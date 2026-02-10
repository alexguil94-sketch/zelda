
/* Theme toggle — dark/light (saved in localStorage) */
(() => {
  const KEY = 'zelda_theme';
  const root = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');

  const setTheme = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch {}
    if (btn) btn.textContent = (t === 'light') ? '🌙' : '☀️';
    if (btn) btn.setAttribute('aria-label', (t === 'light') ? 'Activer le mode sombre' : 'Activer le mode clair');
    if (btn) {
      btn.removeAttribute('aria-disabled');
      btn.disabled = false;
      btn.title = (t === 'light') ? 'Basculer en mode sombre' : 'Basculer en mode clair';
    }
  };

  const saved = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
  if (saved === 'light' || saved === 'dark') setTheme(saved);
  else setTheme('dark');

  btn?.addEventListener('click', () => {
    const next = (root.dataset.theme === 'light') ? 'dark' : 'light';
    setTheme(next);
  });
})();
