/* Dropdown "Pages" (décennies) — header bannière
   - Toggle click + Escape + click outside
   - ARIA: aria-expanded + aria-controls + hidden
   Note: encapsulé pour éviter les collisions globales (ex: `$` déjà déclaré ailleurs).
*/

(() => {
  const qs = (sel, root = document) => root.querySelector(sel);

  function setupBannerPagesDropdown() {
    const toggle = qs('[data-pages-toggle]');
    const menuId = toggle?.getAttribute('aria-controls') || '';
    const menu = menuId ? document.getElementById(menuId) : null;
    if (!toggle || !menu) return;

    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    };

    const open = () => {
      toggle.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
    };

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true' && menu.hidden === false;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (isOpen()) close();
      else open();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!isOpen()) return;
      close();
      toggle.focus();
    });

    document.addEventListener('click', (e) => {
      if (!isOpen()) return;
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (toggle.contains(target) || menu.contains(target)) return;
      close();
    });

    menu.addEventListener('click', (e) => {
      const a = (e.target instanceof Element) ? e.target.closest('a') : null;
      if (!a) return;
      close();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupBannerPagesDropdown, { once: true });
  } else {
    setupBannerPagesDropdown();
  }
})();
