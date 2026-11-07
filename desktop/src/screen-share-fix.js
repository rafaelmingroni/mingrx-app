/* Mingrx screen-share compatibility.
 * Keep the selected source while relaxing unsupported video constraints or
 * falling back from unavailable loopback audio. Permission denials are final.
 */
(() => {
  if (window.__bananaScreenShareFix) return;
  window.__bananaScreenShareFix = true;

  const { ipcRenderer: screenIpc } = window.MingrxDesktop;
  const screenBtn = document.getElementById('screenBtn');
  const requestedSystemAudio = new WeakSet();
  let starting = false;

  const isCancel = error => ['AbortError'].includes(String(error?.name || ''));

  function screenVideoConstraints() {
    const q = resolutionFor(state.media.screenQuality);
    const savedFps = Number(state.media.screenFps);
    const fps = Number.isFinite(savedFps) && savedFps > 0 ? Math.min(savedFps, 60) : 30;
    return {
      width: { ideal: q.width },
      height: { ideal: q.height },
      frameRate: { ideal: fps }
    };
  }

  async function chooseCaptureSource() {
    const sources = await screenIpc.invoke('capture:sources');
    if (!sources.length) throw new Error('Nenhuma tela ou janela disponível.');
    return new Promise(resolve => {
      openModal('<div class="mingrx-capture-picker"><h2>Compartilhar tela ou janela</h2><p>Escolha o que será transmitido. Confira a miniatura antes de iniciar.</p><div id="captureChoices" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px"></div><label class="mingrx-capture-audio"><input id="captureSystemAudio" type="checkbox"><span>Incluir áudio do sistema</span></label><button id="captureCancel" class="secondary">Cancelar</button></div>');
      const modal=document.getElementById('modal');
      let settled=false, selecting=false;
      const finish=value=>{if(settled)return;settled=true;observer.disconnect();closeModal();resolve(value);};
      const observer=new MutationObserver(()=>{if(modal.classList.contains('hidden'))finish(null);});
      observer.observe(modal,{attributes:true,attributeFilter:['class']});
      for(const source of sources){
        const button=document.createElement('button');button.type='button';
        const image=document.createElement('img');image.src=source.thumbnail;image.alt='';image.style.width='100%';
        const name=document.createElement('span');name.textContent=source.name;
        button.append(image,name);
        button.onclick=async()=>{
          if(selecting||settled)return;
          selecting=true;
          const audio=document.getElementById('captureSystemAudio').checked;
          try{await screenIpc.invoke('capture:select',source.id);if(settled){screenIpc.invoke('capture:cancel').catch(()=>{});return;}finish({audio});}
          catch(error){toast(error.message);finish(null);}
        };
        document.getElementById('captureChoices').appendChild(button);
      }
      document.getElementById('captureCancel').onclick=()=>finish(null);
    });
  }

  async function requestDisplayStream(isActive = () => true) {
    try {
      const choice = await chooseCaptureSource();
      if (!choice) throw Object.assign(new Error('Captura cancelada.'), {name:'AbortError'});
      let video = screenVideoConstraints(), audio = choice.audio;
      for (;;) {
        if(!isActive())throw Object.assign(new Error('A chamada terminou.'),{name:'AbortError'});
        try {
          const stream=await navigator.mediaDevices.getDisplayMedia({video,audio});
          if(!isActive()){
            stream.getTracks().forEach(track=>track.stop());
            throw Object.assign(new Error('A chamada terminou.'),{name:'AbortError'});
          }
          if(choice.audio)requestedSystemAudio.add(stream);
          return stream;
        } catch(error) {
          // Retry only failures that can be fixed by changing capture options.
          // Never retry cancellation, permission denial or an invalid request.
          if(error?.name==='OverconstrainedError' && video!==true){video=true;continue;}
          if(audio && ['OverconstrainedError','NotReadableError','NotFoundError','NotSupportedError'].includes(error?.name)){audio=false;continue;}
          throw error;
        }
      }
    } finally {
      await screenIpc.invoke('capture:cancel').catch(()=>{});
    }
  }

  async function startScreenCompat() {
    if (!state.voice.channelId || state.voice.screen || starting) return;
    starting = true;
    const voice = state.voice, channelId = voice.channelId;
    const isActive = () => state.voice===voice && voice.channelId===channelId;
    let stream;
    try {
      stream = await requestDisplayStream(isActive);
      if(!isActive())throw Object.assign(new Error('A chamada terminou.'),{name:'AbortError'});
      const videoTrack = stream?.getVideoTracks?.()[0];
      if (!videoTrack) {
        stream?.getTracks?.().forEach(track => track.stop());
        throw Object.assign(new Error('A captura não retornou uma faixa de vídeo.'), { name: 'NotReadableError' });
      }

      state.voice.screen = stream;
      screenBtn?.classList.add('off');
      videoTrack.contentHint = state.media.streamPreset === 'smooth' ? 'motion' : 'detail';
      videoTrack.onended = stopScreen;
      await setOutgoingVideo(videoTrack);
      if(!isActive())throw Object.assign(new Error('A chamada terminou.'),{name:'AbortError'});
      await syncSystemAudio();
      if(!isActive())throw Object.assign(new Error('A chamada terminou.'),{name:'AbortError'});
      updateLocalVideo();
      emitMediaState();

      if (requestedSystemAudio.has(stream) && !stream.getAudioTracks().length) {
        toast('Tela compartilhada. Áudio do sistema não está disponível neste computador.', 4200);
      }
    } catch (error) {
      if(stream){
        stream.getTracks().forEach(track=>track.stop());
        if(isActive() && state.voice.screen===stream){
          state.voice.screen=null;
          screenBtn?.classList.remove('off');
          await setOutgoingVideo(state.voice.camera?.getVideoTracks()[0]||null).catch(()=>{});
          await syncSystemAudio().catch(()=>{});
          updateLocalVideo();
          emitMediaState();
        }
      }
      if (isCancel(error)) return;
      console.error('Mingrx screen share:', error);
      const code = String(error?.name || 'erro');
      toast(`Não consegui compartilhar a tela (${code}).`, 5000);
    } finally {
      starting = false;
    }
  }

  async function toggleScreenCompat() {
    if (!state.voice.channelId) return;
    if (state.voice.screen) return stopScreen();
    return startScreenCompat();
  }

  // The original button listener already captured the old function reference.
  // Capture phase lets this compatibility layer handle the click first.
  screenBtn?.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    toggleScreenCompat();
  }, true);

  // Replace the old global shortcut listener as well.
  screenIpc.removeAllListeners('shortcut:screen');
  screenIpc.on('shortcut:screen', () => toggleScreenCompat());

  window.BananaScreenShareFix = {
    requestDisplayStream,
    startScreenCompat,
    toggleScreenCompat
  };
})();
