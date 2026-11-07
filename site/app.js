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

  const mediaQuery = query => window.matchMedia?.(query) || {matches: false, addEventListener() {}};
  let revealObserver;
  const revealedElements = new WeakSet();

  // Feature links open the matching real capture in the product tabs.
  document.querySelectorAll('[data-open-scene]').forEach(link => link.addEventListener('click', () => {
    document.querySelector(`[role=tab][data-scene="${link.dataset.openScene}"]`)?.click();
  }));

  // Content stays visible with no JS, unsupported observers, or reduced motion.
  const reducedMotion = mediaQuery('(prefers-reduced-motion: reduce)');
  const configureReveals = () => {
    revealObserver?.disconnect();
    document.querySelectorAll('.reveal-in').forEach(element => element.classList.remove('reveal-in'));
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        if(revealedElements.has(entry.target))return;
        revealedElements.add(entry.target);
        if(!entry.target.contains(document.activeElement))entry.target.classList.add('reveal-in');
      });
    }, {threshold: .12});
    document.querySelectorAll('.product-intro-heading,.product-intro .product-stage,.features-heading,.feature-card,.download-copy,.download-panel,.privacy-section,.faq .section-heading,.faq-list,.footer-brand,.footer-links').forEach(element => revealObserver.observe(element));
  };
  reducedMotion.addEventListener('change', configureReveals);
  configureReveals();

  // Decorative depth only: bounded to 8px, desktop/no-preference, and visible hero.
  const decoration=document.querySelector('.orbit-art');
  const depthMedia=mediaQuery('(min-width:851px) and (prefers-reduced-motion:no-preference)');
  let depthObserver,depthFrame=0;
  const updateDepth=()=>{
    depthFrame=0;
    const hero=decoration?.closest('.orbit-hero');
    if(!hero)return;
    const rect=hero.getBoundingClientRect();
    const distance=parseFloat(getComputedStyle(hero).getPropertyValue('--orbit-depth'))||8;
    const progress=Math.max(0,Math.min(1,-rect.top/Math.max(rect.height,1)));
    decoration.style.setProperty('--orbit-parallax',`${(progress*distance).toFixed(2)}px`);
  };
  const scheduleDepth=()=>{if(!depthFrame)depthFrame=requestAnimationFrame(updateDepth);};
  const stopDepth=()=>{
    window.removeEventListener('scroll',scheduleDepth);window.removeEventListener('resize',scheduleDepth);
    if(depthFrame)cancelAnimationFrame(depthFrame);depthFrame=0;
    decoration?.classList.remove('parallax-active');
  };
  const configureDepth=()=>{
    if(!decoration)return;
    stopDepth();depthObserver?.disconnect();decoration.style.removeProperty('--orbit-parallax');
    if(!depthMedia.matches||!('IntersectionObserver' in window))return;
    depthObserver=new IntersectionObserver(entries=>{
      stopDepth();
      if(entries.some(entry=>entry.isIntersecting)){
        decoration.classList.add('parallax-active');
        window.addEventListener('scroll',scheduleDepth,{passive:true});window.addEventListener('resize',scheduleDepth,{passive:true});scheduleDepth();
      }
    },{rootMargin:'100px 0px'});
    depthObserver.observe(decoration.closest('.orbit-hero'));
  };
  depthMedia.addEventListener('change',configureDepth);configureDepth();

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
