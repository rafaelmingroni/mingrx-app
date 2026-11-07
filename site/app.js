(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const isHome = !location.pathname || /\/(?:index\.html)?$/.test(location.pathname);
  if (isHome && params.has('invite')) {
    location.replace(`./invite.html?invite=${encodeURIComponent(params.get('invite') || '')}`);
    return;
  }

  window.MingrxUI?.mount(document);

  document.querySelectorAll('[data-show-scene]').forEach(link => link.addEventListener('click', () => window.MingrxUI?.tabs(document.querySelector('[data-ui-tabs]'))?.select(link.dataset.showScene)));
  document.querySelectorAll('.legal-toc').forEach(toc => { if (window.matchMedia?.('(min-width: 851px)').matches) toc.open = true; });
  document.querySelectorAll('[data-copy-site]').forEach(button => button.addEventListener('click', async () => {
    const group = button.closest('.pc-link');
    const status = group?.querySelector('.copy-status');
    const fallback = group?.querySelector('.copy-fallback');
    window.MingrxUI?.setButtonBusy(button,true,'Copiando link…');
    try {
      await navigator.clipboard.writeText('https://mingrx.site/');
      if (status) status.textContent = 'Link copiado. Abra no seu computador.';
      if (fallback) fallback.hidden = true;
    } catch {
      if (status) status.textContent = 'Não foi possível copiar automaticamente. Use o endereço abaixo.';
      if (fallback) fallback.hidden = false;
    } finally {
      window.MingrxUI?.setButtonBusy(button,false);
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
    const visibleSections = new Set();
    const navigationObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting)visibleSections.add(entry.target);else visibleSections.delete(entry.target); });
      const visible=[...visibleSections].sort((a,b)=>Math.abs(a.getBoundingClientRect().top-window.innerHeight*.15)-Math.abs(b.getBoundingClientRect().top-window.innerHeight*.15))[0];
      sectionLinks.forEach(link => {
        if (visible && link.hash === `#${visible.id}`) link.setAttribute('aria-current','location');
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
