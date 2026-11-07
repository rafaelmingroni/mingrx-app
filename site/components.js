// Lightweight site components: reusable scoped instances; no framework or third-party runtime dependency.
(() => {
 'use strict';
 const navigationInstances = new WeakMap();
 const tabInstances = new WeakMap();
 const dialogInstances = new WeakMap();
 const busyStates = new WeakMap();
 const tooltipInstances = new WeakMap();
 const createNavigation = root => {
  const menuButton = root.querySelector('.menu-button');
  const nav = root.querySelector('.topnav');
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
    closeMenu();
  }

 };
 const createTabs = root => {
  // One visible scene, keyboard-operable tabs, and no autoplay.
  const sceneTabs = [...root.querySelectorAll('[role=tab][aria-controls]')];
  const panels = new Map([...root.querySelectorAll('[role=tabpanel]')].map(panel => [panel.id,panel]));
  const panelFor = tab => panels.get(tab?.getAttribute('aria-controls'));
  const activateScene = (name, focus = false) => {
    const selected = sceneTabs.find(tab => tab.dataset.scene === name);
    if (!selected) return;
    sceneTabs.forEach(tab => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = panels.get(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
    });
    if (focus) selected.focus();
    positionIndicator();
  };
  const tabList = root.querySelector('[role=tablist]');
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
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotion.addEventListener('change',event=>{
    if(event.matches){sceneAnimations.forEach(animation=>animation.cancel());outgoingScene?.remove();}
  });
  const changeScene = async (name, focus = false) => {
    const target=panelFor(sceneTabs.find(tab=>tab.dataset.scene===name));
    if(!target)return false;
    const current = [...panels.values()].find(panel => !panel.hidden);
    if (!current || current === target) { if (focus) activateScene(name, true); return; }
    const request = ++sceneRequest;
    sceneAnimations.forEach(animation => animation.cancel());
    outgoingScene?.remove();
    const reduce = reducedMotion.matches;
    const overlay = current.cloneNode(true);
    const canAnimate = !reduce && typeof current.animate === 'function';
    overlay.removeAttribute('id');
    overlay.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    overlay.classList.add('scene-outgoing');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    activateScene(name, focus);
    const next = target;
    const targetImage = next.querySelector('img');
    const stage = root;
    current.parentElement.append(overlay);
    outgoingScene = overlay;
    if (targetImage && !targetImage.complete) {
      targetImage.loading = 'eager';
      stage?.setAttribute('aria-busy','true');
      try { await targetImage.decode(); } catch { /* Original image links remain available. */ }
    }
    if (request !== sceneRequest) { overlay.remove(); return; }
    stage?.removeAttribute('aria-busy');
    if (canAnimate && !reducedMotion.matches) {
      const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-scene')) || 360;
      const fade = overlay.animate([{opacity:1},{opacity:0}], {duration,easing:'ease-out'});
      const arrive = next.animate([{opacity:0,transform:'translateY(4px) scale(.995)'},{opacity:1,transform:'translateY(0) scale(1)'}], {duration,easing:'cubic-bezier(.16,1,.3,1)'});
      sceneAnimations = [fade, arrive];
      fade.finished.then(() => overlay.remove()).catch(() => overlay.remove());
    } else overlay.remove();
  };
  sceneTabs.forEach((tab, index) => {
    const warmImage = () => {
      const image = panelFor(tab)?.querySelector('img');
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

  return {select:changeScene};
 };
 const createDialog = root => {
  const captureDialog = root;
  if (captureDialog && typeof captureDialog.showModal === 'function') {
    const image = captureDialog.querySelector('img');
    const status = captureDialog.querySelector('.capture-load-status');
    const closeButton=captureDialog.querySelector('.capture-close');
    const originalLink=captureDialog.querySelector('.capture-original');
    if(!image||!status||!closeButton||!originalLink)return;
    let opener;
    const open = link => {
      opener = link;
      const source = link.querySelector('img') || link.closest('figure')?.querySelector('img');
      image.alt = source?.alt || (link.href.includes('call') ? 'Chamada real no Mingrx com contas de demonstração.' : 'Conversa e comunidade reais no Mingrx com conteúdo de demonstração.');
      status.textContent = 'Carregando captura…';
      image.src = link.href;
      originalLink.href = link.href;
      if(!captureDialog.open)captureDialog.showModal();
      document.documentElement.classList.add('capture-open');
    };
    image.addEventListener('load', () => { status.textContent = ''; });
    image.addEventListener('error', () => { status.textContent = 'Não foi possível carregar a captura. Abra a imagem original pelo link abaixo.'; });
    closeButton.addEventListener('click', () => captureDialog.close());
    captureDialog.addEventListener('click', event => {
      const rect = captureDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) captureDialog.close();
    });
    captureDialog.addEventListener('close', () => {
      if (!document.querySelector('[data-ui-dialog][open]')) document.documentElement.classList.remove('capture-open');
      opener?.focus({preventScroll:true});
    });
    return {open};
  }

 };
 const setButtonBusy = (button,busy,label='Carregando…') => {
  if(busy){
   if(busyStates.has(button)) return;
   const text=button.querySelector('[data-button-label]')||[...button.childNodes].find(node=>node.nodeType===3&&node.textContent.trim());
   busyStates.set(button,{disabled:button.disabled,text,label:text?.textContent});
   button.disabled=true;button.setAttribute('aria-busy','true');
   if(text)text.textContent=label;
  }else{
   const state=busyStates.get(button);if(!state)return;
   button.disabled=state.disabled;button.removeAttribute('aria-busy');
   if(state.text)state.text.textContent=state.label;
   busyStates.delete(button);
  }
 };
 const createTooltip = trigger => {
  const tip=document.getElementById(trigger.dataset.uiTooltip);
  if(!tip)return {};
  let hovered=false;
  tip.classList.add('ui-tooltip-text');tip.hidden=true;
  const nativePopover=typeof tip.showPopover==='function';
  if(nativePopover)tip.setAttribute('popover','manual');
  const hide=()=>{tip.classList.remove('is-visible');if(nativePopover&&tip.matches(':popover-open'))tip.hidePopover();tip.hidden=true;};
  const show=()=>{
   tip.hidden=false;
   if(nativePopover&&!tip.matches(':popover-open'))tip.showPopover();
   const gap=parseFloat(getComputedStyle(trigger).getPropertyValue('--space-1'))||8;
   const rect=trigger.getBoundingClientRect(),box=tip.getBoundingClientRect();
   const left=Math.max(gap,Math.min(rect.right-box.width,window.innerWidth-box.width-gap));
   const top=rect.bottom+gap+box.height>window.innerHeight-gap?Math.max(gap,rect.top-box.height-gap):rect.bottom+gap;
   tip.style.left=`${left}px`;tip.style.top=`${top}px`;
   tip.classList.add('is-visible');
  };
  trigger.addEventListener('mouseenter',()=>{hovered=true;show();});
  trigger.addEventListener('mouseleave',()=>{hovered=false;if(document.activeElement!==trigger)hide();});
  trigger.addEventListener('focus',show);
  trigger.addEventListener('blur',()=>{if(!hovered)hide();});
  trigger.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
  trigger.closest('dialog')?.addEventListener('close',hide);
  window.addEventListener('scroll',hide,{passive:true});
  window.addEventListener('resize',hide,{passive:true});
  return {hide};
 };
 const matching = (scope,selector) => [ ...(scope.matches?.(selector)?[scope]:[]), ...scope.querySelectorAll(selector) ];
 const mount = (scope=document) => {
  for(const root of matching(scope,'[data-ui-navigation]'))if(!navigationInstances.has(root)){navigationInstances.set(root,createNavigation(root)||{});}
  for(const root of matching(scope,'[data-ui-tabs]'))if(!tabInstances.has(root)){tabInstances.set(root,createTabs(root));}
  for(const root of matching(scope,'[data-ui-dialog]'))if(!dialogInstances.has(root)){dialogInstances.set(root,createDialog(root)||{});}
  for(const root of matching(scope,'[data-ui-tooltip]'))if(!tooltipInstances.has(root)){tooltipInstances.set(root,createTooltip(root));}
 };
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('a[data-preview]');
  if(!link||event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button)return;
  const root=link.dataset.previewDialog?document.getElementById(link.dataset.previewDialog):document.querySelector('[data-ui-dialog][data-primary-dialog]');
  const instance=dialogInstances.get(root);
  if(!instance?.open)return;
  event.preventDefault();instance.open(link);
 });
 window.MingrxUI = Object.freeze({mount,setButtonBusy,tabs:root=>tabInstances.get(root)});
})();
