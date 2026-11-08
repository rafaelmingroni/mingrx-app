/* Mingrx emoji: renders emoji in messages and reactions with Fluent Emoji 3D
   (Microsoft, MIT, assets/emoji/LICENSE). Images are 64px webp loaded lazily; the alt
   text keeps the original character so copy, search and screen readers still work.
   Sequences without an image (for example skin tones) stay as text. */
(() => {
  if (window.__mingrxEmojiLoaded) return;
  window.__mingrxEmojiLoaded = true;
  const CODES = new Set(String(window.MINGRX_EMOJI_CODES || '').split(' ').filter(Boolean));
  if (!CODES.size) return;
  const RE = /(?:\p{RI}\p{RI}|[#*0-9]️?⃣|\p{Extended_Pictographic}️?\p{EMod}?(?:‍\p{Extended_Pictographic}️?\p{EMod}?)*)/gu;
  const HAS_WIDE = /[^\x00- ]/;
  const codeOf = s => [...s].map(c => c.codePointAt(0).toString(16)).join('-');
  const fileFor = s => {
    const full = codeOf(s);
    if (CODES.has(full)) return full;
    const bare = codeOf(s.replace(/️/g, ''));
    return CODES.has(bare) ? bare : '';
  };
  const img = (s, file) => {
    const el = document.createElement('img');
    el.className = 'mx-emoji';
    el.alt = s;
    el.draggable = false;
    el.loading = 'lazy';
    el.decoding = 'async';
    el.src = `../assets/emoji/${file}.webp`;
    return el;
  };

  const TARGET = '.msg-text, .v21-reaction, .v21-context-reactions button, .v1-reply-preview';
  const SKIP = 'input, textarea, [contenteditable="true"], code, pre, .v21-inline-edit';

  function decorateText(node) {
    const text = node.nodeValue || '';
    const frag = document.createDocumentFragment();
    let last = 0, count = 0;
    for (const m of text.matchAll(RE)) {
      const file = fileFor(m[0]);
      if (!file) continue;
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      frag.appendChild(img(m[0], file));
      last = m.index + m[0].length;
      count++;
    }
    if (!count) return;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.replaceWith(frag);
  }

  function decorate(el) {
    if (!(el instanceof Element) || el.closest(SKIP)) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (HAS_WIDE.test(n.nodeValue || '')) nodes.push(n);
    nodes.forEach(decorateText);
    if (el.matches('.msg-text')) {
      const emojis = el.querySelectorAll(':scope > .mx-emoji').length;
      const onlyEmoji = emojis > 0 && emojis <= 6 && !el.textContent.trim() && el.children.length === emojis;
      el.classList.toggle('mx-emoji-only', onlyEmoji);
    }
  }

  const scan = root => {
    if (!(root instanceof Element)) return;
    if (root.matches(TARGET)) decorate(root);
    root.querySelectorAll(TARGET).forEach(decorate);
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
      if (!(target instanceof Element)) continue;
      const host = target.closest(TARGET);
      if (host) pending.add(host);
      for (const a of r.addedNodes) if (a instanceof Element) pending.add(a);
    }
    if (pending.size && !queued) { queued = true; queueMicrotask(flush); }
  });
  const start = () => {
    scan(document.body);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  window.MingrxEmoji = Object.freeze({ scan, has: s => !!fileFor(s) });
})();
