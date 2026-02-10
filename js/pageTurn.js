/* Page Turn — 40 ans de Zelda
   - Effet “page tournée” quand on navigue vers une autre page (décennies, accueil, etc.)
   - Désactivé si prefers-reduced-motion

   Utilise : .pageTurn (wrapper) + classes .turn-enter / .turn-leave
*/

(() => {
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const page = document.querySelector('.pageTurn');
  if (!page) return;

  // Animation d’entrée
  if (!prefersReduced) {
    page.classList.add('turn-enter');
    page.addEventListener('animationend', () => page.classList.remove('turn-enter'), { once: true });
  }

  const isInternalHtml = (url) => {
    try {
      const u = new URL(url, window.location.href);
      if (u.origin !== window.location.origin) return false;
      if (!u.pathname.toLowerCase().endsWith('.html')) return false;
      return true;
    } catch {
      return false;
    }
  };

  const samePath = (url) => {
    const u = new URL(url, window.location.href);
    return u.pathname === window.location.pathname;
  };

  const shouldIntercept = (a) => {
    if (!a || !a.href) return false;
    if (a.hasAttribute('download')) return false;
    if (a.target && a.target !== '_self') return false;
    // liens d’ancre sur la même page
    if (a.getAttribute('href')?.startsWith('#')) return false;
    // on laisse le mini-jeu tranquille (souvent une autre ambiance)
    {
      const href = a.getAttribute('href') || '';
      if (href.includes('/game/') || href.startsWith('game/') || href.startsWith('./game/')) return false;
    }
    if (!isInternalHtml(a.href)) return false;
    if (samePath(a.href)) return false;
    return true;
  };

  const closeNavIfOpen = () => {
    if (document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      const overlay = document.querySelector('[data-nav-overlay]');
      const drawer = document.querySelector('[data-nav]');
      const burger = document.querySelector('[data-burger]');
      overlay && (overlay.hidden = true);
      drawer && drawer.setAttribute('aria-hidden', 'true');
      burger && burger.setAttribute('aria-expanded', 'false');
    }
  };

  const go = (href) => {
    if (prefersReduced) {
      window.location.href = href;
      return;
    }
    closeNavIfOpen();
    page.classList.add('turn-leave');
    // petit buffer, au cas où l’animation se coupe
    const delay = 520;
    const done = () => window.location.href = href;

    let fired = false;
    const finish = () => {
      if (fired) return;
      fired = true;
      done();
    };

    page.addEventListener('animationend', finish, { once: true });
    window.setTimeout(finish, delay);
  };

  // Intercept tous les liens internes .html
  document.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a');
    if (!a) return;
    if (!shouldIntercept(a)) return;
    e.preventDefault();
    go(a.href);
  });
})();
