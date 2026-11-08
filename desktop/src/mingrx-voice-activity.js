/* Mingrx voice activity: who is speaking is detected by each participant from the audio it
   already receives (RTCRtpReceiver synchronization sources carry the packet audio level), so the
   speaking state never goes through Firebase, where every community member could read it.
   Runs only while you are in a call. */
(() => {
  if (window.__mingrxVoiceActivityLoaded) return;
  window.__mingrxVoiceActivityLoaded = true;

  const TICK_MS = 150;
  const LEVEL = 0.03;      // RFC 6464 level as 0..1; speech is well above, room noise below.
  const HANGOVER_MS = 400; // keep the ring through short pauses between words.
  const FRESH_MS = 500;    // ignore a level whose last packet is older than this.

  function levelOf(peer) {
    let level = 0;
    const now = performance.now();
    for (const receiver of peer.pc?.getReceivers?.() || []) {
      if (receiver.track?.kind !== 'audio' || typeof receiver.getSynchronizationSources !== 'function') continue;
      for (const source of receiver.getSynchronizationSources()) {
        if (now - Number(source.timestamp || 0) > FRESH_MS) continue;
        level = Math.max(level, Number(source.audioLevel || 0));
      }
    }
    return level;
  }

  function tick() {
    const voice = state?.voice;
    if (!voice?.channelId || !voice.peers) return;
    const now = performance.now();
    let changed = false;
    for (const [socketId, peer] of voice.peers) {
      if (typeof peer.pc?.getReceivers !== 'function') continue; // nothing received to measure
      if (levelOf(peer) > LEVEL && !peer.mediaState?.muted) peer._vadAt = now;
      const speaking = !!peer._vadAt && now - peer._vadAt < HANGOVER_MS;
      if (!!peer.speaking !== speaking) {
        peer.speaking = speaking;
        if (typeof setCardSpeaking === 'function') setCardSpeaking(`video-${socketId}`, speaking);
        changed = true;
      }
    }
    // The channel list shows the same state for your own call (other calls never show it).
    const entries = state.voicePresence?.get?.(voice.channelId);
    if (Array.isArray(entries)) {
      const selfId = state.socket?.id;
      for (const entry of entries) {
        const speaking = entry.socketId === selfId
          ? !!voice.speaking && !voice.muted
          : !!voice.peers.get(entry.socketId)?.speaking;
        if (!!entry.speaking !== speaking) { entry.speaking = speaking; changed = true; }
      }
    }
    if (changed && voice.serverId && voice.serverId === state.selectedServer?.id && typeof renderChannels === 'function') {
      try { renderChannels(); } catch {}
    }
  }

  setInterval(tick, TICK_MS);
})();
