(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const isHome = !location.pathname || /\/(?:index\.html)?$/.test(location.pathname);
  if (isHome && params.has('invite')) {
    location.replace(`./invite.html?invite=${encodeURIComponent(params.get('invite') || '')}`);
    return;
  }

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.topnav');
  if (menuButton && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      nav.inert = window.matchMedia('(max-width: 850px)').matches;
      menuButton.setAttribute('aria-expanded', 'false');
    };
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      nav.inert = !open;
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.matchMedia('(min-width: 851px)').addEventListener?.('change', closeMenu);
  }

  // One visible scene, keyboard-operable tabs, and no autoplay.
  const sceneTabs = [...document.querySelectorAll('[data-scene]')];
  const activateScene = (name, focus = false) => {
    const selected = sceneTabs.find(tab => tab.dataset.scene === name);
    if (!selected) return;
    sceneTabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
    });
    if (focus) selected.focus();
    positionIndicator();
  };
  const tabList = document.querySelector('.scene-tabs');
  const indicator = tabList ? document.createElement('span') : null;
  const positionIndicator = () => {
    const selected = sceneTabs.find(tab => tab.getAttribute('aria-selected') === 'true');
    if (!tabList || !selected || !indicator) return;
    tabList.style.setProperty('--tab-x', `${selected.offsetLeft}px`);
    tabList.style.setProperty('--tab-width', `${selected.offsetWidth}px`);
    tabList.classList.add('has-scene-indicator');
  };
  if (indicator) {
    indicator.className = 'scene-indicator';
    indicator.setAttribute('aria-hidden','true');
    tabList.prepend(indicator);
    positionIndicator();
    if ('ResizeObserver' in window) new ResizeObserver(positionIndicator).observe(tabList);
    document.fonts?.ready.then(positionIndicator);
  }
  let sceneAnimations = [];
  let outgoingScene;
  let sceneRequest = 0;
  const changeScene = async (name, focus = false) => {
    const current = document.querySelector('.scene-panel:not([hidden]):not(.scene-outgoing)');
    if (!current || current.id === `scene-${name}`) { if (focus) activateScene(name, true); return; }
    const request = ++sceneRequest;
    sceneAnimations.forEach(animation => animation.cancel());
    outgoingScene?.remove();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const overlay = current.cloneNode(true);
    const canAnimate = !reduce && typeof current.animate === 'function';
    overlay.removeAttribute('id');
    overlay.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    overlay.classList.add('scene-outgoing');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    activateScene(name, focus);
    const next = document.getElementById(`scene-${name}`);
    const targetImage = next.querySelector('img');
    const stage = document.querySelector('.product-stage');
    current.parentElement.append(overlay);
    outgoingScene = overlay;
    if (targetImage && !targetImage.complete) {
      targetImage.loading = 'eager';
      stage?.setAttribute('aria-busy','true');
      try { await targetImage.decode(); } catch { /* Original image links remain available. */ }
    }
    if (request !== sceneRequest) { overlay.remove(); return; }
    stage?.removeAttribute('aria-busy');
    if (canAnimate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-scene')) || 360;
      const fade = overlay.animate([{opacity:1},{opacity:0}], {duration,easing:'ease-out'});
      const arrive = next.animate([{opacity:.4,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}], {duration,easing:'cubic-bezier(.16,1,.3,1)'});
      sceneAnimations = [fade, arrive];
      fade.finished.then(() => overlay.remove()).catch(() => overlay.remove());
    } else overlay.remove();
  };
  sceneTabs.forEach((tab, index) => {
    const warmImage = () => {
      const image = document.querySelector(`#${tab.getAttribute('aria-controls')} img`);
      if (image) image.loading = 'eager';
    };
    tab.addEventListener('pointerenter', warmImage, {once: true});
    tab.addEventListener('focus', warmImage, {once: true});
    tab.addEventListener('click', () => { warmImage(); changeScene(tab.dataset.scene); });
    tab.addEventListener('keydown', event => {
      const destinations = {ArrowRight:(index+1)%sceneTabs.length, ArrowLeft:(index-1+sceneTabs.length)%sceneTabs.length, Home:0, End:sceneTabs.length-1};
      if (!(event.key in destinations)) return;
      event.preventDefault();
      changeScene(sceneTabs[destinations[event.key]].dataset.scene, true);
    });
  });

  const captureDialog = document.querySelector('.capture-dialog');
  if (captureDialog && typeof captureDialog.showModal === 'function') {
    const image = captureDialog.querySelector('img');
    const status = captureDialog.querySelector('.capture-load-status');
    let opener;
    document.querySelectorAll('[data-preview]').forEach(link => link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button) return;
      event.preventDefault();
      opener = link;
      const source = link.querySelector('img') || link.closest('figure')?.querySelector('img');
      image.alt = source?.alt || (link.href.includes('call') ? 'Chamada real no Mingrx com contas de demonstração.' : 'Conversa e comunidade reais no Mingrx com conteúdo de demonstração.');
      status.textContent = 'Carregando captura…';
      image.src = link.href;
      captureDialog.querySelector('.capture-original').href = link.href;
      captureDialog.showModal();
      document.documentElement.classList.add('capture-open');
    }));
    image.addEventListener('load', () => { status.textContent = ''; });
    image.addEventListener('error', () => { status.textContent = 'Não foi possível carregar a captura. Abra a imagem original pelo link abaixo.'; });
    captureDialog.querySelector('.capture-close').addEventListener('click', () => captureDialog.close());
    captureDialog.addEventListener('click', event => {
      const rect = captureDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) captureDialog.close();
    });
    captureDialog.addEventListener('close', () => {
      document.documentElement.classList.remove('capture-open');
      opener?.focus({preventScroll:true});
    });
  }

  document.querySelectorAll('[data-show-scene]').forEach(link => link.addEventListener('click', () => activateScene(link.dataset.showScene)));
  document.querySelectorAll('.legal-toc').forEach(toc => { if (window.matchMedia?.('(min-width: 851px)').matches) toc.open = true; });
  document.querySelectorAll('[data-copy-site]').forEach(button => button.addEventListener('click', async () => {
    const group = button.closest('.pc-link');
    const status = group?.querySelector('.copy-status');
    const fallback = group?.querySelector('.copy-fallback');
    button.disabled = true;
    button.setAttribute('aria-busy','true');
    const label = button.firstChild;
    const originalLabel = label?.textContent;
    if (label?.nodeType === 3) label.textContent = 'Copiando link…';
    try {
      await navigator.clipboard.writeText('https://mingrx.site/');
      if (status) status.textContent = 'Link copiado. Abra no seu computador.';
      if (fallback) fallback.hidden = true;
    } catch {
      if (status) status.textContent = 'Não foi possível copiar automaticamente. Use o endereço abaixo.';
      if (fallback) fallback.hidden = false;
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      if (label?.nodeType === 3) label.textContent = originalLabel;
    }
  }));

  // Native scroll is never intercepted. Pick the story nearest the viewing line.
  const mediaQuery = query => window.matchMedia?.(query) || {matches: false, addEventListener() {}};
  const stories = [...document.querySelectorAll('[data-showcase-step]')];
  const showcase = document.querySelector('.showcase-layout');
  const progressLinks = [...document.querySelectorAll('.showcase-progress a')];
  const desktopMotion = mediaQuery('(min-width: 851px) and (prefers-reduced-motion: no-preference)');
  let showcaseObserver;
  let revealObserver;
  let frame = 0;
  const selectStory = () => {
    frame = 0;
    const line = window.innerHeight * .5;
    const nearest = stories.reduce((best, story) => {
      const rect = story.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - line);
      return !best || distance < best.distance ? {story, distance} : best;
    }, null)?.story;
    if (!nearest) return;
    stories.forEach(story => story.classList.toggle('is-active', story === nearest));
    progressLinks.forEach(link => {
      if (link.hash === `#${nearest.id}`) link.setAttribute('aria-current','step');
      else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-showcase-image]').forEach(image => {
      image.classList.toggle('is-active', image.dataset.showcaseImage === nearest.dataset.showcaseStep);
    });
    const caption = document.querySelector('.showcase-caption');
    if (caption) caption.textContent = nearest.dataset.caption;
  };
  const scheduleStory = () => { if (!frame) frame = requestAnimationFrame(selectStory); };
  const stopShowcase = () => {
    window.removeEventListener('scroll', scheduleStory);
    window.removeEventListener('resize', scheduleStory);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  const configureShowcase = () => {
    if (!showcase) return;
    stopShowcase();
    showcaseObserver?.disconnect();
    if (!('IntersectionObserver' in window)) return;
    showcaseObserver = new IntersectionObserver(entries => {
      stopShowcase();
      if (entries.some(entry => entry.isIntersecting)) {
        window.addEventListener('scroll', scheduleStory, {passive: true});
        window.addEventListener('resize', scheduleStory, {passive: true});
        scheduleStory();
      }
    }, {rootMargin: '120px 0px'});
    showcaseObserver.observe(showcase);
  };
  desktopMotion.addEventListener('change', configureShowcase);
  configureShowcase();

  // Content stays visible with no JS, unsupported observers, or reduced motion.
  const reducedMotion = mediaQuery('(prefers-reduced-motion: reduce)');
  const configureReveals = () => {
    revealObserver?.disconnect();
    document.querySelectorAll('.reveal-in').forEach(element => element.classList.remove('reveal-in'));
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-in');
        revealObserver.unobserve(entry.target);
      });
    }, {threshold: .12});
    document.querySelectorAll('.features-heading,.feature-card,.showcase-heading,.start-section .section-heading,.privacy-section,.faq .section-heading').forEach(element => revealObserver.observe(element));
  };
  reducedMotion.addEventListener('change', configureReveals);
  configureReveals();

  const sectionLinks = [...document.querySelectorAll('.topnav a[href^="#"]')];
  if ('IntersectionObserver' in window && sectionLinks.length) {
    const navigationObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if (!visible) return;
      sectionLinks.forEach(link => {
        if (link.hash === `#${visible.target.id}`) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-15% 0px -55% 0px',threshold:0});
    sectionLinks.forEach(link => { const target = document.getElementById(link.hash.slice(1)); if (target) navigationObserver.observe(target); });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const downloadLinks = [...document.querySelectorAll('.download-link')];
  if (!downloadLinks.length) return;
  // Every link already has a working fallback. Never block a download on API availability.
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), 6000) : null;
  fetch('https://api.github.com/repos/rafaelmingroni/mingrx-app/releases/latest', {
    headers: { Accept: 'application/vnd.github+json' },
    ...(controller ? { signal: controller.signal } : {})
  }).then(response => response.ok ? response.json() : Promise.reject(new Error('Release unavailable')))
    .then(release => {
      if (release.draft || release.prerelease) return;
      const asset = (release.assets || []).find(item => /^Mingrx-Setup-.*-x64\.exe$/i.test(item.name));
      const url = asset?.browser_download_url || '';
      if (/^https:\/\/github\.com\/rafaelmingroni\/mingrx-app\/releases\/download\/[^\s]+\.exe$/.test(url)) {
        downloadLinks.forEach(link => { link.href = url; });
      }
      const version = String(release.tag_name || '').replace(/^v/i, '');
      if (/^\d+\.\d+\.\d+$/.test(version)) {
        document.querySelectorAll('.release-note').forEach(note => {
          const publicVersion = version.replace(/\.0$/, '');
          note.textContent = `Mingrx ${publicVersion}. Gratuito para Windows 10 e 11.`;
        });
      }
    }).catch(() => {})
    .finally(() => { if (timeout !== null) clearTimeout(timeout); });
})();
