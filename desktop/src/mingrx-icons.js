/* Mingrx 2026 icons: replaces interface emoji glyphs (controls, channel symbols, call
   actions) with one consistent stroked SVG set. Message text, reactions and inputs are
   never touched. Glyphs set later by other modules are re-decorated in a single batched
   observer pass. */
(() => {
  if (window.__mingrxIconsLoaded) return;
  window.__mingrxIconsLoaded = true;

  const paths = {
    mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    micOff: '<path d="M3 3l18 18M9 9v2a3 3 0 0 0 5.1 2.1M15 9.3V6a3 3 0 0 0-5.7-1.3"/><path d="M5 11a7 7 0 0 0 11.5 5.4M19 11a7 7 0 0 1-.6 2.8M12 18v3"/>',
    headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/>',
    headphonesOff: '<path d="M3 3l18 18M4 15v-3a8 8 0 0 1 1.5-4.7M8.6 4.8A8 8 0 0 1 20 12v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><path d="M16 16v3a2 2 0 0 0 2 2h1"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10 5-3v10l-5-3"/>',
    screen: '<rect x="3" y="4" width="18" height="12" rx="2.5"/><path d="M8 20h8M12 16v4"/>',
    hangup: '<path d="M3.5 14.5c4.7-4.6 12.3-4.6 17 0l-1.9 2.4a1.4 1.4 0 0 1-1.8.3l-2.3-1.4a1.4 1.4 0 0 1-.6-1.5l.3-1.3a10 10 0 0 0-4.4 0l.3 1.3a1.4 1.4 0 0 1-.6 1.5l-2.3 1.4a1.4 1.4 0 0 1-1.8-.3z"/>',
    volume: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    volumeOff: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="m16 10 4 4m0-4-4 4"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    pin: '<path d="M12 17v5M8 3h8l-1 6 3 3v2H6v-2l3-3z"/>',
    maximize: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
    eye: '<path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"/><circle cx="12" cy="12" r="3"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    reply: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v4"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    chat: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 20a6.5 6.5 0 0 0-3-5.5"/>'
  };
  // Leading glyph -> icon. Variation selectors are stripped before lookup.
  const glyphs = new Map([
    ['🎤', 'mic'], ['🎙', 'mic'], ['🔇', 'micOff'], ['🎧', 'headphones'], ['🔈', 'headphonesOff'], ['📹', 'video'], ['🎥', 'video'],
    ['🖥', 'screen'], ['💻', 'screen'], ['📞', 'hangup'], ['🔊', 'volume'], ['🔉', 'volume'], ['🔕', 'volumeOff'],
    ['🔗', 'link'], ['⚙', 'settings'], ['📌', 'pin'], ['⛶', 'maximize'], ['↻', 'refresh'], ['👁', 'eye'], ['▶', 'play'],
    ['👑', 'crown'], ['🗑', 'trash'], ['↩', 'reply'], ['✎', 'edit'], ['💬', 'chat'], ['👥', 'users'], ['🔒', 'lock'], ['✕', 'close'], ['🍌', 'user']
  ]);
  const SCOPE = 'button, .symbol, .voice-user-icons, .icon-btn, .secondary-mini, .avatar-video, .v208-watch-stream, .server-actions, .mingrx312-nav-icon, #channelIcon';
  // Settings render their own icon set and are measured while scrolling; leave them untouched.
  const SKIP = '#settingsArea, .settings-shell, .msg-text, .messages .reactions, .v21-reaction, .reaction, .emoji-picker, input, textarea, [contenteditable="true"], .mx-ico';
  const svg = name => `<svg class="mx-ico mx-ico-${name}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
  const leading = text => {
    const trimmed = text.replace(/^\s+/, '');
    for (const [glyph, name] of glyphs) if (trimmed.startsWith(glyph)) {
      const rest = trimmed.slice(glyph.length).replace(/^[︎️]/, '');
      return { name, rest };
    }
    return null;
  };

  function decorate(el) {
    if (!(el instanceof Element) || el.closest(SKIP) || !el.matches(SCOPE)) return;
    for (const node of [...el.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      const hit = leading(node.nodeValue || '');
      if (!hit) continue;
      const tpl = document.createElement('template');
      tpl.innerHTML = svg(hit.name);
      const icon = tpl.content.firstChild;
      const rest = hit.rest.replace(/^\s+/, '');
      node.replaceWith(icon, ...(rest ? [document.createTextNode(rest)] : []));
      el.classList.add('mx-has-ico');
      if (!rest && !el.getAttribute('aria-label') && el.title) el.setAttribute('aria-label', el.title);
      break;
    }
  }
  const scan = root => {
    if (!(root instanceof Element)) return;
    if (root.matches(SCOPE)) decorate(root);
    root.querySelectorAll(SCOPE).forEach(decorate);
  };

  let pending = new Set(), queued = false;
  const flush = () => {
    queued = false;
    const batch = pending; pending = new Set();
    for (const el of batch) if (el.isConnected) scan(el);
  };
  const observer = new MutationObserver(records => {
    for (const r of records) {
      const target = r.type === 'characterData' ? r.target.parentElement : r.target;
      if (!target || target.closest(SKIP)) continue;
      const host = target.closest(SCOPE);
      if (host) pending.add(host);
      for (const n of r.addedNodes) if (n instanceof Element && !n.closest?.(SKIP)) pending.add(n);
    }
    if (pending.size && !queued) { queued = true; queueMicrotask(flush); }
  });
  const start = () => {
    scan(document.body);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.MingrxIcons = Object.freeze({ svg, scan });
})();
