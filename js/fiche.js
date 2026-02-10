
/* Fiches décennie — zoom images (lightbox) */
(() => {
  const lb = document.querySelector('[data-fiche-lightbox]');
  if (!lb) return;

  const stage = lb.querySelector('[data-fiche-stage]');
  const img = lb.querySelector('[data-fiche-img]');
  const btnClose = lb.querySelector('[data-fiche-close]');
  const btnPlus = lb.querySelector('[data-fiche-plus]');
  const btnMinus = lb.querySelector('[data-fiche-minus]');
  const btnReset = lb.querySelector('[data-fiche-reset]');

  let scale = 1, tx = 0, ty = 0;
  let dragging = false, startX = 0, startY = 0;

  const apply = () => {
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const open = (src, alt='') => {
    img.src = src;
    img.alt = alt;
    scale = 1; tx = 0; ty = 0; apply();
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    btnClose?.focus();
  };

  const close = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };

  // Open from any gallery thumb
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.thumb');
    if (!btn) return;
    const im = btn.querySelector('img');
    const src = btn.dataset.zoom || im?.getAttribute('src');
    if (!src) return;
    open(src, im?.getAttribute('alt') || '');
  });

  btnClose?.addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });

  window.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
  });

  btnPlus?.addEventListener('click', () => { scale = clamp(scale + 0.25, 1, 4); apply(); });
  btnMinus?.addEventListener('click', () => { scale = clamp(scale - 0.25, 1, 4); apply(); });
  btnReset?.addEventListener('click', () => { scale = 1; tx = 0; ty = 0; apply(); });

  stage?.addEventListener('wheel', (e) => {
    if (!lb.classList.contains('is-open')) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    scale = clamp(scale + delta, 1, 4);
    apply();
  }, { passive:false });

  stage?.addEventListener('pointerdown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    dragging = true;
    startX = e.clientX - tx;
    startY = e.clientY - ty;
    stage.setPointerCapture?.(e.pointerId);
  });

  stage?.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    tx = e.clientX - startX;
    ty = e.clientY - startY;
    apply();
  });

  const stop = () => { dragging = false; };
  stage?.addEventListener('pointerup', stop);
  stage?.addEventListener('pointercancel', stop);

  stage?.addEventListener('dblclick', () => { scale = 1; tx = 0; ty = 0; apply(); });
})();
