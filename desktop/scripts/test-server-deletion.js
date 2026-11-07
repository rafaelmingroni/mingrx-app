require('./test-local-emulators');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {initializeTestEnvironment,assertFails}=require('@firebase/rules-unit-testing');
const F=require('firebase/firestore');
const install=require('../src/server-deletion');

(async()=>{
  assert(process.env.FIRESTORE_EMULATOR_HOST,'Deletion tests require the local emulator');
  const env=await initializeTestEnvironment({projectId:'demo-banana-cord',firestore:{rules:fs.readFileSync(path.join(__dirname,'../../firebase/firestore.rules'),'utf8')}});
  const dbFor=(uid,verified=true)=>env.authenticatedContext(uid,{email:`${uid}@test.invalid`,email_verified:verified}).firestore();
  const alice=dbFor('alice'),bob=dbFor('bob'),admin=dbFor('admin'),outsider=dbFor('outsider');
  const parent=db=>F.doc(db,'servers','delete-test');
  const members=['alice','bob','admin','coowner',...Array.from({length:105},(_,i)=>`user-${i}`)];
  const recorded=[],sockets=[];
  const socket=(db,uid,sdk=F)=>{
    const value={db,user:{uid},knownServerIds:new Set(['delete-test']),voice:null,
      unwatchServer:id=>recorded.push(['unwatch',id]),receive:(...args)=>recorded.push(args),
      async leaveVoice(){this.voice=null;recorded.push(['leaveVoice'])}};
    install(value,sdk);sockets.push(value);return value;
  };
  const session=uid=>({userId:uid,sessionId:`session-${uid}`,user:{id:uid,name:uid,avatar:'',status:'online'},
    mediaState:{muted:false,camera:false,screen:false},speaking:false,joinedAt:Date.now(),updatedAt:F.serverTimestamp(),expiresAt:F.Timestamp.fromMillis(Date.now()+90000)});
  try{
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async context=>{
      const db=context.firestore(),rows=[];
      const add=(p,data)=>rows.push([p,data]);
      add('servers/delete-test',{name:'Delete test',ownerId:'alice',inviteCode:'DELETE88',categories:[]});
      add('servers/unrelated',{name:'Unrelated',ownerId:'outsider',inviteCode:'OTHER888'});
      add('servers/unrelated/channels/text/messages/keep',{authorId:'outsider',text:'Keep'});
      add('relationships/alice_bob',{participants:['alice','bob'],status:'friends'});
      for(const uid of members){
        add(`servers/delete-test/members/${uid}`,{role:['alice','coowner'].includes(uid)?'owner':uid==='admin'?'admin':'member'});
        add(`users/${uid}/serverRefs/delete-test`,{serverId:'delete-test'});
        add(`servers/delete-test/presence/${uid}/connections/test`,{userId:uid});
      }
      add('servers/delete-test/channels/text',{name:'text',type:'text',allowedRoles:[]});
      add('servers/delete-test/channels/private',{name:'private',type:'text',allowedRoles:['admin']});
      add('servers/delete-test/channels/voice',{name:'voice',type:'voice',allowedRoles:[]});
      for(let i=0;i<205;i++)add(`servers/delete-test/channels/text/messages/m${i}`,{authorId:'bob',text:`Message ${i}`});
      add('servers/delete-test/channels/private/messages/secret',{authorId:'admin',text:'Private channel'});
      for(const [i,uid]of ['alice','bob','admin'].entries()){
        add(`servers/delete-test/channels/voice/voiceSessions/${i}`,session(uid));
        add(`servers/delete-test/channels/voice/voiceSessions/${i}/signals/signal`,{targetUserId:uid,targetSessionId:`session-${uid}`});
      }
      // Firestore does not cascade: clean signals even if an old slot is gone.
      add('servers/delete-test/channels/voice/voiceSessions/4/signals/orphan',{targetUserId:'bob'});
      add('invites/DELETE88',{serverId:'delete-test',code:'DELETE88',permanent:true});
      for(let i=0;i<105;i++)add(`invites/TEMP${String(i).padStart(4,'0')}`,{serverId:'delete-test',code:`TEMP${String(i).padStart(4,'0')}`,permanent:false});
      add('invites/OTHER888',{serverId:'unrelated',code:'OTHER888'});
      for(let i=0;i<rows.length;i+=400){const batch=F.writeBatch(db);for(const[p,data]of rows.slice(i,i+400))batch.set(F.doc(db,p),data);await batch.commit()}
    });
    // Reproduce the reported schema mismatch without weakening the rule.
    await F.updateDoc(parent(alice),{deleting:true});
    await assertFails(F.updateDoc(parent(alice),{inviteCode:''}));
    await assertFails(F.updateDoc(parent(alice),{deleting:false}));
    const reset=()=>env.withSecurityRulesDisabled(context=>F.updateDoc(parent(context.firestore()),{deleting:false}));
    await reset();
    // Membership/admin privileges never confer permission to delete the server.
    for(const [db,uid]of [[bob,'bob'],[admin,'admin'],[dbFor('coowner'),'coowner'],[outsider,'outsider'],[dbFor('alice',false),'alice']]){
      await assert.rejects(socket(db,uid).deleteServer('delete-test'));
      await assertFails(F.deleteDoc(parent(db)));
    }
    assert.equal((await F.getDoc(parent(alice))).data().deleting,false);
    await assertFails(F.updateDoc(parent(admin),{deleting:true}));
    const otherSlot=F.doc(alice,'servers','delete-test','channels','voice','voiceSessions','1');
    await assertFails(F.deleteDoc(otherSlot));
    await assertFails(F.getDocs(F.collection(otherSlot,'signals')));

    // Freeze descendant creation during deletion, before any parent is removed.
    await F.updateDoc(parent(alice),{deleting:true});
    await assertFails(F.setDoc(F.doc(alice,'invites','NEWCODE8'),{serverId:'delete-test',code:'NEWCODE8',createdBy:'alice'}));
    await assertFails(F.setDoc(F.doc(alice,'servers','delete-test','channels','new'),{name:'new',type:'text'}));
    await assertFails(F.setDoc(F.doc(alice,'servers','delete-test','members','new'),{role:'member'}));
    await assertFails(F.setDoc(F.doc(alice,'servers','delete-test','channels','voice','voiceSessions','3'),session('alice')));
    const send=F.writeBatch(alice);
    send.set(F.doc(alice,'users','alice','limits','chat'),{lastSentAt:F.serverTimestamp(),messageKey:'delete-test/text/new'});
    send.set(F.doc(alice,'servers','delete-test','channels','text','messages','new'),{authorId:'alice',text:'Late write',createdAt:F.serverTimestamp(),editedAt:null,replyToId:null,reactions:{},mentionIds:[]});
    await assertFails(send.commit());
    await reset();

    // Simulate an interrupted connection after a member batch reached Firestore.
    let interrupted=false;
    const flaky={...F,writeBatch(db){
      const batch=F.writeBatch(db),paths=[];
      return{delete(ref){paths.push(ref.path);batch.delete(ref);return this},async commit(){
        await batch.commit();
        if(!interrupted&&paths.some(p=>p.includes('/members/'))){interrupted=true;throw new Error('Synthetic connection interruption')}
      }};
    }};
    const owner=socket(alice,'alice',flaky);owner.voice={serverId:'delete-test'};
    await assert.rejects(owner.deleteServer('delete-test'),/Synthetic connection interruption/);
    assert(interrupted,'The deletion must reach member cleanup');
    assert((await F.getDoc(F.doc(alice,'servers','delete-test','members','alice'))).exists(),'Owner membership must survive interrupted cleanup');
    const interruptedServer=(await F.getDoc(parent(alice))).data();
    assert.equal(interruptedServer.deleting,true);
    assert(!('inviteCode'in interruptedServer),'Remove the invitation field instead of writing an invalid empty value');
    assert(!recorded.some(([event])=>event==='server:removed'),'Do not announce success before completion');
    const resumed=owner.deleteServer('delete-test');
    assert.equal(owner.deleteServer('delete-test'),resumed,'Repeated clicks must share the same deletion');
    await resumed;
    assert(!owner.knownServerIds.has('delete-test'));
    assert.equal(recorded.filter(([event])=>event==='server:removed').length,1);
    assert.equal(recorded.filter(([event])=>event==='leaveVoice').length,1);
    await env.withSecurityRulesDisabled(async context=>{
      const db=context.firestore();
      assert(!(await F.getDoc(parent(db))).exists());
      for(const suffix of ['members','channels',...members.map(uid=>`presence/${uid}/connections`),'channels/text/messages','channels/private/messages','channels/voice/voiceSessions',...['0','1','2','3','4'].map(slot=>`channels/voice/voiceSessions/${slot}/signals`)]){
        assert((await F.getDocs(F.collection(db,'servers','delete-test',...suffix.split('/')))).empty,'Retained descendants: '+suffix);
      }
      for(const uid of members)assert(!(await F.getDoc(F.doc(db,'users',uid,'serverRefs','delete-test'))).exists(),'Stale server reference: '+uid);
      assert((await F.getDocs(F.query(F.collection(db,'invites'),F.where('serverId','==','delete-test')))).empty);
      for(const p of ['servers/unrelated','servers/unrelated/channels/text/messages/keep','invites/OTHER888','relationships/alice_bob'])assert((await F.getDoc(F.doc(db,p))).exists(),'Unrelated data changed: '+p);
    });
    console.log('Server deletion: real Firestore rules, owner-only access, pagination, restricted channels, voice/signals/presence, interruption and resume passed.');
  }finally{await env.cleanup()}
})().catch(error=>{console.error(error);process.exitCode=1});
