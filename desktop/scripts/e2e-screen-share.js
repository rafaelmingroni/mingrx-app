// Production isolated renderer + real CSS. Capture results are synthetic so
// driver failures, denial and call-exit races are deterministic on every CI OS.
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {app,BrowserWindow,ipcMain}=require('electron');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-dev-shm-usage');
const channels=[];
for(const [name,value] of Object.entries({
  'update:get-config':{autoCheck:false,currentVersion:'3.2.0'},
  'update:get-state':{status:'idle'},'banana-updater:get-state':{phase:'idle'},
  'banana-updater:get-version':'3.2.0','banana-updater:check':{ok:true},
  'banana-v21:get-settings':{settings:{shareActivity:false,startup:{enabled:false}}},
  'banana-v21:get-system-languages':['pt-BR'],'ptt:configure':true
}))ipcMain.handle(name,()=>value);
ipcMain.handle('capture:sources',()=>{
  channels.push('sources');
  return [{id:'screen:chosen',name:'Tela de teste',thumbnail:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}];
});
ipcMain.handle('capture:select',(_event,id)=>{assert.equal(id,'screen:chosen');channels.push('select');return true});
ipcMain.handle('capture:cancel',()=>{channels.push('cancel');return true});
const timeout=setTimeout(()=>{console.error('Screen capture regression timed out');app.exit(1)},45000);

async function runInRenderer(){
  const assert=(value,message)=>{if(!value)throw new Error(message)};
  const equal=(a,b,message)=>assert(JSON.stringify(a)===JSON.stringify(b),message+': '+JSON.stringify(a));
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const waitFor=async check=>{for(let i=0;i<100;i++){if(check())return;await sleep(10)}throw new Error('Picker did not reach expected state')};
  const api=window.BananaScreenShareFix;
  assert(api,'Production screen-share layer is missing');
  const originalCapture=navigator.mediaDevices.getDisplayMedia;
  const originals={setOutgoingVideo,syncSystemAudio,updateLocalVideo,emitMediaState,toast};
  const notices=[];
  toast=message=>notices.push(message);
  let requests=[],responses=[];
  const streams=[];
  function stream(){
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180;
    canvas.getContext('2d').fillRect(0,0,320,180);
    const result=canvas.captureStream(5);streams.push(result);return result;
  }
  Object.defineProperty(navigator.mediaDevices,'getDisplayMedia',{configurable:true,value:async options=>{
    requests.push(structuredClone(options));
    const response=responses.shift();
    if(typeof response==='function')return response();
    if(response)throw Object.assign(new Error('Synthetic capture failure'),{name:response});
    return stream();
  }});
  async function choose(audio){
    await waitFor(()=>document.getElementById('captureSystemAudio'));
    document.getElementById('captureSystemAudio').checked=audio;
    document.querySelector('#captureChoices button').click();
  }
  async function capture(failures,audio=false){
    responses=[...failures];requests=[];
    const pending=api.requestDisplayStream();
    // Attach rejection handling before interacting with the async picker.
    const result=pending.then(value=>({value}),error=>({error}));
    await choose(audio);
    return result;
  }
  try{
    state.media.screenFps=60;
    let result=await capture(['OverconstrainedError'],false);
    assert(result.value,'Video-only constraint failure must recover');
    equal(requests.map(r=>r.audio),[false,false],'Audio must remain off');
    equal(requests[0].video.frameRate,{ideal:60},'FPS is a preference, not a capture requirement');
    assert(requests[1].video===true,'Second request must remove video constraints');
    result.value.getTracks().forEach(t=>t.stop());

    result=await capture(['OverconstrainedError'],true);
    assert(result.value,'Video constraints must relax without dropping requested audio');
    equal(requests.map(r=>r.audio),[true,true],'Retain audio through video fallback');
    result.value.getTracks().forEach(t=>t.stop());

    for(const failures of [['NotReadableError','OverconstrainedError'],['OverconstrainedError','NotReadableError'],['OverconstrainedError','OverconstrainedError']]){
      result=await capture(failures,true);
      assert(result.value,'Combined video/audio fallback must recover');
      assert(requests.length===3&&requests[2].video===true&&requests[2].audio===false,'Bounded fallback must reach unconstrained video without audio');
      result.value.getTracks().forEach(t=>t.stop());
    }
    for(const name of ['NotAllowedError','AbortError','SecurityError','TypeError']){
      result=await capture([name],true);
      assert(result.error?.name===name&&requests.length===1,'Do not retry '+name);
    }
    result=await capture(['OverconstrainedError','OverconstrainedError'],false);
    assert(result.error?.name==='OverconstrainedError'&&requests.length===2,'Repeated video failure must terminate');
    for(const fps of [0,-1,NaN,Infinity]){
      state.media.screenFps=fps;result=await capture([],false);
      equal(requests[0].video.frameRate,{ideal:30},'Invalid persisted FPS must use a valid default');
      result.value.getTracks().forEach(t=>t.stop());
    }

    // Closing the actual picker must resolve and leave no capture request.
    requests=[];
    let pending=api.requestDisplayStream().catch(error=>error);
    await waitFor(()=>document.getElementById('captureCancel'));
    document.getElementById('captureCancel').click();
    assert((await pending).name==='AbortError'&&requests.length===0,'Cancel must not acquire a stream');
    pending=api.requestDisplayStream().catch(error=>error);
    await waitFor(()=>document.getElementById('captureSystemAudio'));closeModal();
    assert((await pending).name==='AbortError','Modal close must settle capture');

    // Keep success and rollback independent of peer-network availability.
    setOutgoingVideo=async()=>{};syncSystemAudio=async()=>{};updateLocalVideo=()=>{};emitMediaState=()=>{};
    const voice=()=>({channelId:'test-call',screen:null,camera:null,peers:new Map()});
    state.voice=voice();requests=[];responses=[];notices.length=0;
    pending=api.startScreenCompat();await choose(false);await pending;
    assert(state.voice.screen&&notices.length===0,'Choosing video only must not claim system audio failed');
    state.voice.screen.getTracks().forEach(t=>t.stop());state.voice=voice();
    notices.length=0;pending=api.startScreenCompat();await choose(true);await pending;
    assert(notices.some(text=>text.includes('Áudio do sistema')),'Requested but missing audio needs an explanation');
    state.voice.screen.getTracks().forEach(t=>t.stop());state.voice=voice();

    requests=[];pending=api.startScreenCompat();
    await waitFor(()=>document.getElementById('captureSystemAudio'));
    await api.startScreenCompat(); // Duplicate click must reuse the active picker.
    await choose(false);await pending;
    assert(requests.length===1,'Repeated click must not start concurrent capture');
    state.voice.screen.getTracks().forEach(t=>t.stop());state.voice=voice();
    requests=[];pending=api.startScreenCompat();
    await waitFor(()=>document.getElementById('captureSystemAudio'));
    state.voice=voice();await choose(false);await pending;
    assert(requests.length===0&&!state.voice.screen,'Leaving a call in the picker must prevent capture');

    let resolveStream;
    requests=[];responses=[()=>new Promise(resolve=>resolveStream=resolve)];
    pending=api.startScreenCompat();await choose(false);await waitFor(()=>resolveStream);
    state.voice=voice();const late=stream();resolveStream(late);await pending;
    assert(!state.voice.screen&&late.getTracks().every(t=>t.readyState==='ended'),'Late capture after leaving must stop every track');

    const camera=stream();state.voice=voice();state.voice.camera=camera;
    const outgoing=[];let failOnce=true;
    setOutgoingVideo=async track=>{outgoing.push(track);if(failOnce){failOnce=false;throw new Error('Synthetic sender failure')}};
    pending=api.startScreenCompat();await choose(false);await pending;
    assert(!state.voice.screen&&!document.getElementById('screenBtn').classList.contains('off'),'Failed setup must clear the sharing indicator');
    assert(outgoing.at(-1)===camera.getVideoTracks()[0],'Failed setup must restore the camera');
    assert(streams.at(-1).getTracks().every(t=>t.readyState==='ended'),'Failed setup must release capture tracks');
    return {ok:true,cases:'constraints/audio fallback, denial, invalid FPS, cancellation, concurrency, call exit and rollback'};
  }finally{
    for(const s of streams)s.getTracks().forEach(t=>t.stop());
    Object.assign(window,originals);
    Object.defineProperty(navigator.mediaDevices,'getDisplayMedia',{configurable:true,value:originalCapture});
    closeModal();
  }
}

app.whenReady().then(async()=>{
  const win=new BrowserWindow({show:false,width:1100,height:800,webPreferences:{preload:path.join(__dirname,'..','preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false}});
  await win.loadFile(path.join(__dirname,'..','src','index.html'));
  console.log(await win.webContents.executeJavaScript(`(${runInRenderer.toString()})()`,true));
  // Real renderer geometry at common Windows display scaling factors.
  for(const zoom of [1,1.25,1.5,2]){
    win.webContents.setZoomFactor(zoom);
    await win.webContents.executeJavaScript('window.__captureLayout=window.BananaScreenShareFix.requestDisplayStream().catch(()=>null);void 0',true);
    if(process.env.MINGRX_CAPTURE_PREVIEW && zoom===1){
      await win.webContents.executeJavaScript(`(async()=>{
        for(let i=0;i<100&&!document.getElementById('captureSystemAudio');i++)await new Promise(r=>setTimeout(r,10));
        document.getElementById('cloudGate')?.remove();
        document.documentElement.dataset.mingrxTheme='midnight';
      })()`,true);
      win.show();win.webContents.invalidate();
      await new Promise(resolve=>setTimeout(resolve,200));
      fs.writeFileSync(process.env.MINGRX_CAPTURE_PREVIEW,(await win.webContents.capturePage()).toPNG());
    }
    const layout=await win.webContents.executeJavaScript(`(async()=>{
      for(let i=0;i<100&&!document.getElementById('captureSystemAudio');i++)await new Promise(r=>setTimeout(r,10));
      const input=document.getElementById('captureSystemAudio'),label=input.closest('label'),text=label.querySelector('span');
      const box=input.getBoundingClientRect(),copy=text.getBoundingClientRect(),parent=label.getBoundingClientRect();
      label.click();const toggled=input.checked;closeModal();await window.__captureLayout;
      return{box:box.toJSON(),copy:copy.toJSON(),parent:parent.toJSON(),toggled};
    })()`,true);
    assert(layout.toggled,'Clicking the text must toggle the checkbox');
    assert(Math.abs((layout.box.top+layout.box.height/2)-(layout.copy.top+layout.copy.height/2))<2,'Checkbox and text must be vertically centered at '+zoom);
    assert(layout.box.width===18&&layout.box.height===18&&layout.copy.left-layout.box.right>=9,'Checkbox must retain intrinsic size and gap at '+zoom);
    assert(layout.copy.right<=layout.parent.right+1,'Audio label must fit the picker');
    console.log('Capture checkbox alignment passed at '+zoom*100+'%');
  }
  assert.equal(channels.filter(c=>c==='sources').length,channels.filter(c=>c==='cancel').length,'Every picker must release its main-process grant');
  clearTimeout(timeout);win.destroy();console.log('Screen-share renderer regressions passed. Native Windows driver capture is not simulated by this test.');app.exit(0);
}).catch(error=>{clearTimeout(timeout);console.error(error);app.exit(1)});
