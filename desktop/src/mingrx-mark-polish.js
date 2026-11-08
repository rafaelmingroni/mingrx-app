/* Converts remaining fixed-color Mingrx image marks into theme-aware vector marks. */
(() => {
  if (window.__mingrxMarkPolishLoaded) return;
  window.__mingrxMarkPolishLoaded = true;

  const SELECTORS = [
    '.empty-view > img.big-banana-img',
    '.v214-private-home > img',
    '.mingrx-community-head > img',
    '.banana-updater-logo img',
    '.banana-updater-install-logo img',
    '.cloud-home-logo img'
  ].join(',');

  function createMark(extra = '') {
    const span = document.createElement('span');
    span.className = `mingrx-inline-mark mingrx-surface-mark ${extra}`.trim();
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = `<img src="../assets/mingrx.svg" alt="">`;
    return span;
  }

  function classFor(img) {
    if (img.matches('.big-banana-img')) return 'mingrx-empty-mark';
    if (img.closest('.v214-private-home')) return 'mingrx-private-mark';
    if (img.closest('.mingrx-community-head')) return 'mingrx-community-mark';
    if (img.closest('.banana-updater-logo,.banana-updater-install-logo')) return 'mingrx-updater-mark';
    if (img.closest('.cloud-home-logo')) return 'mingrx-cloud-home-mark';
    return '';
  }

  function upgrade(root = document) {
    const images = [];
    if (root?.matches?.(SELECTORS)) images.push(root);
    for (const image of root?.querySelectorAll?.(SELECTORS) || []) images.push(image);
    for (const image of images) {
      if (!image.isConnected) continue;
      image.replaceWith(createMark(classFor(image)));
    }
  }

  upgrade();
  const observer = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) if (node.nodeType === Node.ELEMENT_NODE) upgrade(node);
    }
  });
  observer.observe(document.body, { childList:true, subtree:true });
})();
