/* Dropdowns du header bannière
   - "Pages" (décennies) + "Personnages"
   - Toggle click + Escape + click outside
   - ARIA: aria-expanded + aria-controls + hidden
   Note: encapsulé pour éviter les collisions globales (ex: `$` déjà déclaré ailleurs).
*/

(() => {
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setupBannerDropdowns() {
    const toggles = qsa('[data-pages-toggle], [data-characters-toggle]');
    if (!toggles.length) return;

    const dropdowns = toggles
      .map((toggle) => {
        const menuId = toggle.getAttribute('aria-controls') || '';
        const menu = menuId ? document.getElementById(menuId) : null;
        if (!menu) return null;

        const close = () => {
          toggle.setAttribute('aria-expanded', 'false');
          menu.hidden = true;
        };

        const open = () => {
          toggle.setAttribute('aria-expanded', 'true');
          menu.hidden = false;
        };

        const isOpen = () =>
          toggle.getAttribute('aria-expanded') === 'true' && menu.hidden === false;

        // Normalize initial state.
        toggle.setAttribute('aria-expanded', 'false');
        menu.hidden = true;

        return { toggle, menu, close, open, isOpen };
      })
      .filter(Boolean);

    if (!dropdowns.length) return;

    const closeAll = (except = null) => {
      dropdowns.forEach((d) => {
        if (except && d.toggle === except.toggle) return;
        d.close();
      });
    };

    dropdowns.forEach((d) => {
      d.toggle.addEventListener('click', (e) => {
        e.preventDefault();
        if (d.isOpen()) d.close();
        else {
          closeAll(d);
          d.open();
        }
      });

      d.menu.addEventListener('click', (e) => {
        const a = (e.target instanceof Element) ? e.target.closest('a') : null;
        if (!a) return;
        closeAll();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const openDropdown = dropdowns.find((d) => d.isOpen());
      if (!openDropdown) return;
      closeAll();
      openDropdown.toggle.focus();
    });

    document.addEventListener('click', (e) => {
      const openDropdown = dropdowns.find((d) => d.isOpen());
      if (!openDropdown) return;

      const target = e.target;
      if (!(target instanceof Node)) return;

      const clickedInside = dropdowns.some((d) => d.toggle.contains(target) || d.menu.contains(target));
      if (clickedInside) return;

      closeAll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupBannerDropdowns, { once: true });
  } else {
    setupBannerDropdowns();
  }
})();
