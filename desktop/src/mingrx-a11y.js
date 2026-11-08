/* Mingrx accessibility: dialogs behave like dialogs (Escape closes, focus moves in, Tab stays
   inside, focus returns on close) and controls without a visible label get an accessible name. */
(() => {
  if (window.__mingrxA11yLoaded) return;
  window.__mingrxA11yLoaded = true;

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const visible = el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && !el.closest('.hidden,[hidden]');

  // Inputs whose visible label is not tied to them in the markup.
  const LABELS = {
    profileName: 'Nome', profileFile: 'Foto de perfil', profileStatus: 'Status', profileCustomStatus: 'Status personalizado',
    voiceThreshold: 'Sensibilidade da voz', outputVolume: 'Volume de saída', soundVolume: 'Volume dos sons',
    serverNameEdit: 'Nome da comunidade', newServerName: 'Nome da comunidade', joinCode: 'Código de convite',
    messageInput: 'Mensagem', inputDevice: 'Dispositivo de entrada', outputDevice: 'Dispositivo de saída', cameraDevice: 'Câmera'
  };
  function nameControls(root = document) {
    for (const [id, label] of Object.entries(LABELS)) {
      const el = root.getElementById ? root.getElementById(id) : root.querySelector?.('#' + id);
      if (el && !el.getAttribute('aria-label')) el.setAttribute('aria-label', label);
    }
    // Per-person volume sliders in a call.
    for (const input of document.querySelectorAll('.video-card input[type=range]:not([aria-label])')) {
      const who = input.closest('.video-card')?.querySelector('.video-label')?.textContent?.split('·')[0]?.trim();
      input.setAttribute('aria-label', who ? `Volume de ${who}` : 'Volume');
    }
  }

  const modal = document.getElementById('modal');
  let returnFocus = null;
  const isOpen = () => modal && !modal.classList.contains('hidden');
  const card = () => modal?.querySelector('.modal-card');

  function onOpen() {
    const c = card();
    if (!c) return;
    c.setAttribute('role', 'dialog');
    c.setAttribute('aria-modal', 'true');
    const heading = c.querySelector('h1, h2, h3');
    if (heading) {
      heading.id ||= 'mingrxDialogTitle';
      c.setAttribute('aria-labelledby', heading.id);
    } else c.removeAttribute('aria-labelledby');
    if (!c.contains(document.activeElement)) {
      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const first = [...c.querySelectorAll('input:not([type=hidden]):not([disabled]), textarea, select')].find(visible)
        || [...c.querySelectorAll(FOCUSABLE)].find(el => visible(el) && !el.classList.contains('close') && !/fechar|close/i.test(el.getAttribute('aria-label') || el.title || ''))
        || c;
      if (first === c) c.setAttribute('tabindex', '-1');
      first.focus({ preventScroll: true });
    }
    nameControls();
  }
  function onClose() {
    const target = returnFocus;
    returnFocus = null;
    if (target?.isConnected && visible(target)) target.focus({ preventScroll: true });
  }

  if (modal) {
    let wasOpen = isOpen();
    new MutationObserver(() => {
      const open = isOpen();
      if (open && !wasOpen) queueMicrotask(onOpen);
      if (!open && wasOpen) onClose();
      wasOpen = open;
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  document.addEventListener('keydown', event => {
    if (!isOpen()) return;
    if (event.key === 'Escape' && !event.defaultPrevented) {
      // Let open menus and inline editors inside the dialog close first.
      if (document.querySelector('.v21-context-menu, .mingrx-role-picker.open, .v21-role-menu:not(.hidden)')) return;
      event.preventDefault();
      if (typeof closeModal === 'function') closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const c = card();
    const items = c ? [...c.querySelectorAll(FOCUSABLE)].filter(visible) : [];
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !c.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !c.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  });

  // Menus that open inside a scrolling dialog flip upward when there is no room below.
  document.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest('.v21-role-button') : null;
    if (!button) return;
    requestAnimationFrame(() => {
      const menu = button.parentElement?.querySelector('.v21-role-menu');
      if (!menu || menu.classList.contains('hidden')) return;
      menu.classList.remove('mx-open-up');
      const scroller = button.closest('.modal-card, .modal-body, .settings-content') || document.documentElement;
      const limit = Math.min(window.innerHeight, scroller.getBoundingClientRect().bottom);
      if (menu.getBoundingClientRect().bottom > limit - 8) menu.classList.add('mx-open-up');
    });
  });

  // Mouse wheel scrolls the horizontal community bar.
  document.querySelector('.servers')?.addEventListener('wheel', event => {
    const bar = event.currentTarget;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || bar.scrollWidth <= bar.clientWidth) return;
    bar.scrollLeft += event.deltaY;
    event.preventDefault();
  }, { passive: false });

  // Sliders paint their filled part from the current value.
  const fill = input => {
    const min = Number(input.min || 0), max = Number(input.max || 100), value = Number(input.value);
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
    input.style.setProperty('--mx-fill', `${Math.min(100, Math.max(0, pct))}%`);
  };
  const fillAll = () => document.querySelectorAll('input[type=range]').forEach(fill);
  document.addEventListener('input', event => { if (event.target instanceof HTMLInputElement && event.target.type === 'range') fill(event.target); }, true);

  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; nameControls(); fillAll(); });
  }).observe(document.body, { childList: true, subtree: true });
  nameControls();
  fillAll();
})();
