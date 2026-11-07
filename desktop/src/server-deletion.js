// The owner stays a member until the final atomic delete, so cleanup remains
// authorized and an interrupted deletion can be resumed from the same server.
module.exports = function installServerDeletion(socket, F) {
  const {doc,collection,getDoc,getDocs,query,where,limit,writeBatch,updateDoc,deleteField,serverTimestamp}=F;
  const pending=new Map();
  async function purge(reference, constraints=[]) {
    for (;;) {
      const page=await getDocs(query(reference,...constraints,limit(100)));
      if(page.empty)return;
      const batch=writeBatch(socket.db);
      page.docs.forEach(row=>batch.delete(row.ref));
      await batch.commit();
    }
  }
  async function remove(serverId) {
    const db=socket.db, uid=socket.user.uid, reference=doc(db,'servers',serverId);
    const server=await getDoc(reference);
    if(!server.exists())return;
    if(server.data().ownerId!==uid)throw new Error('Só o dono pode excluir a comunidade.');
    // Empty invitation strings violate the production schema. Remove the field
    // instead, in the same write that prevents new joins and child writes.
    await updateDoc(reference,{deleting:true,inviteCode:deleteField(),updatedAt:serverTimestamp()});
    if(socket.voice?.serverId===serverId){
      socket.receive('voice:revoked');
      await socket.leaveVoice();
    }
    await purge(collection(db,'invites'),[where('serverId','==',serverId)]);
    const members=await getDocs(collection(db,'servers',serverId,'members'));
    for(const member of members.docs){
      await purge(collection(db,'servers',serverId,'presence',member.id,'connections'));
    }
    const channels=await getDocs(collection(db,'servers',serverId,'channels'));
    for(const channel of channels.docs){
      if(channel.data().type==='text'){
        await purge(collection(channel.ref,'messages'));
      }else if(channel.data().type==='voice'){
        const sessions=await getDocs(collection(channel.ref,'voiceSessions'));
        const slots=new Set(['0','1','2','3','4',...sessions.docs.map(session=>session.id)]);
        for(const slot of slots){
          await purge(collection(channel.ref,'voiceSessions',slot,'signals'));
        }
        await purge(collection(channel.ref,'voiceSessions'));
      }
    }
    await purge(collection(db,'servers',serverId,'channels'));
    // Each member and their reference disappear together. Never remove our own
    // membership until every operation requiring membership has completed.
    const others=members.docs.filter(member=>member.id!==uid);
    for(let i=0;i<others.length;i+=100){
      const batch=writeBatch(db);
      for(const member of others.slice(i,i+100)){
        batch.delete(member.ref);
        batch.delete(doc(db,'users',member.id,'serverRefs',serverId));
      }
      await batch.commit();
    }
    const batch=writeBatch(db);
    batch.delete(doc(db,'users',uid,'serverRefs',serverId));
    batch.delete(doc(db,'servers',serverId,'members',uid));
    batch.delete(reference);
    await batch.commit();
    socket.knownServerIds.delete(serverId);
    socket.unwatchServer(serverId);
    socket.receive('server:removed',{serverId,deleted:true});
  }
  socket.deleteServer=function(serverId){
    if(pending.has(serverId))return pending.get(serverId);
    const task=remove(serverId).finally(()=>pending.delete(serverId));
    pending.set(serverId,task);
    return task;
  };
};
