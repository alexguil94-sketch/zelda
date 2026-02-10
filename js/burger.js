/* Burger drawer (all screens)
   - Opens a side parchment menu
   - Works on desktop & mobile
   - ESC / overlay click closes
*/

(() => {
  const burger = document.querySelector('[data-burger]');
  const nav = document.querySelector('[data-nav]');
  if (!burger || !nav) return;

  // Ensure we always have an overlay (prevents “burger does nothing” if missing)
  let overlay = document.querySelector('[data-nav-overlay]');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.setAttribute('data-nav-overlay', '');
    overlay.hidden = true;
    document.body.appendChild(overlay);
  }

  let lastFocus = null;

  const setOpen = (isOpen) => {
    document.body.classList.toggle('nav-open', isOpen);
    nav.classList.toggle('is-open', isOpen);

    burger.setAttribute('aria-expanded', String(isOpen));
    nav.setAttribute('aria-hidden', String(!isOpen));

    overlay.hidden = !isOpen;

    // Avoid any interaction when closed (CSS also covers this)
    nav.style.pointerEvents = isOpen ? 'auto' : 'none';

    // Focus management
    if (isOpen) {
      lastFocus = document.activeElement;
      const firstLink = nav.querySelector('a, button');
      firstLink?.focus?.();
    } else {
      (lastFocus?.focus ? lastFocus : burger)?.focus?.();
      lastFocus = null;
    }
  };

  const toggle = (e) => {
    e?.preventDefault?.();
    setOpen(!document.body.classList.contains('nav-open'));
  };

  // Start closed
  setOpen(false);

  burger.addEventListener('click', toggle);
  overlay.addEventListener('click', () => setOpen(false));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) setOpen(false);
  });

  // Close if user clicks outside
  document.addEventListener('click', (e) => {
    if (!document.body.classList.contains('nav-open')) return;
    if (e.target.closest('[data-nav]') || e.target.closest('[data-burger]')) return;
    setOpen(false);
  });
})();
