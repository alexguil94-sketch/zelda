/* Page Link — contenu + interactions (vanilla JS)
   - Contenu éditable via un objet JSON (LINK_DATA)
   - Fade-in au scroll (IntersectionObserver) + respect prefers-reduced-motion
   - Filtre sur les incarnations (data-link-filter) : ajoute/retire .is-hidden
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const PLACE_IMG = 'assets/img/ui/chronologie_ref.jpg';

const LINK_DATA = {
  hero: {
    title: 'Link',
    subtitle: 'Le héros principal de la saga The Legend of Zelda — silencieux, universel, courageux.',
    origin: 'Shigeru Miyamoto • 1986',
    bullets: [
      { label: 'Rôle', text: 'Héros choisi : il se lève quand le mal menace Hyrule.' },
      { label: 'Triforce', text: 'Courage : la force d’avancer, même sans certitude.' },
      { label: 'Signature', text: 'Tunique, épée, bouclier — et une exploration faite d’énigmes et de temples.' },
    ],
    quote:
      'Link parle peu, mais il raconte beaucoup : par ses gestes, ses choix et la route qu’il trace.',
    image: { src: PLACE_IMG, alt: 'Link (image de remplacement)' },
  },

  origins: {
    paragraphs: [
      'Link a été imaginé par Shigeru Miyamoto avec l’idée d’un personnage dans lequel le joueur peut se projeter facilement.',
      'Contrairement à beaucoup de héros, Link parle très peu — c’est volontaire pour renforcer l’immersion : on vit l’aventure à travers lui.',
    ],
    meaning: [
      'Un lien entre le joueur et l’aventure.',
      'Un lien entre les différentes époques de la saga.',
      'Un lien entre Courage, Sagesse et Pouvoir (les trois forces de la Triforce).',
    ],
  },

  who: [
    {
      title: 'Une réincarnation du Courage',
      text:
        'Dans la mythologie de la série, Link est souvent une réincarnation ou un héritier spirituel du héros choisi par la Triforce du Courage.',
      icon: '🌿',
      accent: 'var(--link-forest)',
      bullets: [
        'Il renaît à différentes époques lorsque le mal menace Hyrule.',
        'Chaque jeu propose une version différente du héros, avec sa propre histoire.',
      ],
    },
    {
      title: 'Un héros “silencieux”',
      text:
        'Link n’a presque jamais de dialogue : il reste expressif, mais “ouvert”, pour laisser le joueur projeter sa propre aventure.',
      icon: '🧠',
      accent: 'var(--link-gold)',
      bullets: ['Courage face à l’inconnu.', 'Croissance personnelle.', 'Aventure initiatique.'],
    },
    {
      title: 'Le cerveau et le courage',
      text:
        'Link n’est pas seulement un guerrier : il résout des énigmes, explore des temples, et interagit avec l’environnement.',
      icon: '🧩',
      accent: 'var(--link-blue)',
      bullets: ['Observation.', 'Exploration.', 'Adaptation.'],
    },
  ],

  incarnations: [
    {
      key: 'classic',
      title: 'Link classique',
      subtitle: '1986–1991 • Vue du dessus, héro anonyme',
      tag: 'Fondations',
      accent: 'var(--link-gold)',
      image: { src: PLACE_IMG, alt: 'Link classique (image de remplacement)' },
      lines: ['Apparence simple, aventure en vue du dessus.', 'Guidé par le destin, quasi anonyme.'],
    },
    {
      key: 'oot',
      title: 'Link d’Ocarina of Time',
      subtitle: 'Le pivot narratif',
      tag: 'Chronologie',
      accent: 'var(--link-blue)',
      image: { src: PLACE_IMG, alt: 'Link d’Ocarina of Time (image de remplacement)' },
      lines: ['Voyage entre enfance et âge adulte.', 'Pose les bases de la chronologie officielle.'],
    },
    {
      key: 'ww',
      title: 'Link de The Wind Waker',
      subtitle: 'Cartoon, expressif, héro malgré lui',
      tag: 'Océan',
      accent: 'var(--link-blue)',
      image: { src: PLACE_IMG, alt: 'Link de The Wind Waker (image de remplacement)' },
      lines: ['Style plus expressif.', 'Courageux, jeune, déterminé.'],
    },
    {
      key: 'tp',
      title: 'Link de Twilight Princess',
      subtitle: 'Univers sombre',
      tag: 'Ombre',
      accent: 'var(--link-forest)',
      image: { src: PLACE_IMG, alt: 'Link de Twilight Princess (image de remplacement)' },
      lines: ['Transformation en loup.', 'Conflit intérieur et héroïsme mûri.'],
    },
    {
      key: 'modern',
      title: 'Link de Breath of the Wild / Tears of the Kingdom',
      subtitle: 'Version la plus libre et moderne',
      tag: 'Ère moderne',
      accent: 'var(--link-blue)',
      image: { src: PLACE_IMG, alt: 'Link moderne (image de remplacement)' },
      lines: ['Amnésique au début, reconstruit son identité.', 'Design devenu iconique (tunique bleue).'],
    },
  ],

  skills: [
    {
      title: 'Maîtrise des armes',
      icon: '🗡️',
      accent: 'var(--link-gold)',
      lines: ['Épée de Légende (Master Sword).', 'Arc, bombes, grappin, boomerang…'],
    },
    {
      title: 'Intelligence & exploration',
      icon: '🧭',
      accent: 'var(--link-forest)',
      lines: ['Résolution d’énigmes.', 'Exploration de temples.', 'Interaction avec l’environnement.'],
      note: 'Link incarne autant le cerveau que le courage.',
    },
    {
      title: 'Personnalité & symbolique',
      icon: '✨',
      accent: 'var(--link-blue)',
      lines: ['Héros universel, peu de dialogues.', 'Expressif malgré le silence.', 'Symbole de croissance personnelle.'],
    },
  ],

  relations: [
    {
      title: 'Courage',
      name: 'Link',
      text: 'Le héros qui avance, explore, et affronte l’inconnu.',
      accent: 'var(--link-forest)',
    },
    {
      title: 'Sagesse',
      name: 'Zelda',
      text: 'Alliée, princesse ou guide spirituelle : la lumière qui tient le royaume debout.',
      accent: 'var(--link-blue)',
    },
    {
      title: 'Pouvoir',
      name: 'Ganon',
      text: 'Incarnation de la puissance et antagoniste principal (Ganon/Ganondorf).',
      accent: 'var(--ruby)',
    },
  ],

  why: [
    'Design simple et reconnaissable.',
    'Évolution constante selon les générations.',
    'Personnage silencieux mais universel.',
    'Mélange d’action, d’émotion et d’exploration.',
    'Un des héros les plus emblématiques du jeu vidéo.',
  ],
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function renderHero() {
  const title = $('[data-link-hero-title]');
  const subtitle = $('[data-link-hero-subtitle]');
  const origin = $('[data-link-hero-origin]');
  const bullets = $('[data-link-hero-bullets]');
  const quote = $('[data-link-hero-quote]');
  const quoteWrap = $('[data-link-hero-quote-wrap]');
  const img = $('[data-link-hero-img]');

  if (title) title.textContent = LINK_DATA.hero.title;
  if (subtitle) subtitle.textContent = LINK_DATA.hero.subtitle;
  if (origin) origin.textContent = LINK_DATA.hero.origin;

  if (bullets) {
    bullets.innerHTML = '';
    (LINK_DATA.hero.bullets || []).forEach((b) => {
      const li = document.createElement('li');
      li.appendChild(el('strong', '', `${b.label} : `));
      li.appendChild(document.createTextNode(b.text));
      bullets.appendChild(li);
    });
  }

  if (quote) quote.textContent = LINK_DATA.hero.quote || '';
  if (quoteWrap) quoteWrap.hidden = !LINK_DATA.hero.quote;

  if (img) {
    img.src = LINK_DATA.hero.image?.src || img.src || PLACE_IMG;
    img.alt = LINK_DATA.hero.image?.alt || img.alt || '';
  }
}

function renderOrigins() {
  const host = $('[data-link-origins]');
  if (host) {
    host.innerHTML = '';
    (LINK_DATA.origins.paragraphs || []).forEach((p) => host.appendChild(el('p', '', p)));
  }

  const meaning = $('[data-link-meaning]');
  if (meaning) {
    meaning.innerHTML = '';
    (LINK_DATA.origins.meaning || []).forEach((line) => meaning.appendChild(el('li', '', line)));
  }
}

function renderWho() {
  const host = $('[data-link-who]');
  if (!host) return;
  host.innerHTML = '';

  LINK_DATA.who.forEach((card) => {
    const article = el('article', 'linkCard');
    article.dataset.reveal = '';
    article.style.setProperty('--accent', card.accent || 'var(--gold)');

    const head = el('header', 'linkCardHead');
    head.appendChild(el('span', 'linkIcon', card.icon || '★'));
    head.appendChild(el('h3', '', card.title));
    article.appendChild(head);
    article.appendChild(el('p', '', card.text));

    const ul = document.createElement('ul');
    ul.className = 'linkList';
    (card.bullets || []).slice(0, 6).forEach((t) => ul.appendChild(el('li', '', t)));
    article.appendChild(ul);

    host.appendChild(article);
  });
}

function renderIncarnations() {
  const host = $('[data-link-incarnations]');
  if (!host) return;
  host.innerHTML = '';

  LINK_DATA.incarnations.forEach((item) => {
    const card = el('article', 'linkCard linkCard--incarnation');
    card.dataset.reveal = '';
    card.dataset.filterItem = '';
    card.dataset.era = item.key;
    card.style.setProperty('--accent', item.accent || 'var(--gold)');

    const fig = document.createElement('figure');
    fig.className = 'linkFigure';

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = item.image?.src || PLACE_IMG;
    img.alt = item.image?.alt || `Illustration — ${item.title}`;
    fig.appendChild(img);

    const cap = el('figcaption', 'linkFigcap');
    cap.appendChild(el('h3', '', item.title));
    cap.appendChild(el('p', 'muted', item.subtitle));
    fig.appendChild(cap);
    card.appendChild(fig);

    const tagWrap = el('div', 'linkTag');
    tagWrap.appendChild(el('span', '', item.tag));
    card.appendChild(tagWrap);

    const ul = document.createElement('ul');
    ul.className = 'linkList';
    (item.lines || []).slice(0, 4).forEach((t) => ul.appendChild(el('li', '', t)));
    card.appendChild(ul);

    host.appendChild(card);
  });
}

function renderSkills() {
  const host = $('[data-link-skills]');
  if (!host) return;
  host.innerHTML = '';

  LINK_DATA.skills.forEach((item) => {
    const card = el('article', 'linkCard linkCard--skill');
    card.dataset.reveal = '';
    card.style.setProperty('--accent', item.accent || 'var(--gold)');

    const head = el('header', 'linkCardHead');
    head.appendChild(el('span', 'linkIcon', item.icon || '★'));
    head.appendChild(el('h3', '', item.title));
    card.appendChild(head);

    const ul = document.createElement('ul');
    ul.className = 'linkList';
    (item.lines || []).slice(0, 6).forEach((t) => ul.appendChild(el('li', '', t)));
    card.appendChild(ul);

    if (item.note) card.appendChild(el('p', 'linkNote muted', item.note));

    host.appendChild(card);
  });
}

function renderRelations() {
  const host = $('[data-link-relations]');
  if (!host) return;
  host.innerHTML = '';

  LINK_DATA.relations.forEach((r) => {
    const card = el('article', 'linkCard linkCard--relation');
    card.dataset.reveal = '';
    card.style.setProperty('--accent', r.accent || 'var(--gold)');

    const head = el('header', 'linkRelationHead');
    head.appendChild(el('h3', '', r.title));
    head.appendChild(el('p', 'muted', r.name));
    card.appendChild(head);

    card.appendChild(el('p', '', r.text));
    host.appendChild(card);
  });
}

function renderWhy() {
  const host = $('[data-link-why]');
  if (!host) return;
  host.innerHTML = '';

  LINK_DATA.why.forEach((t) => {
    const li = el('li', 'linkCheckItem');
    li.dataset.reveal = '';
    li.appendChild(el('span', 'linkCheck', '✔'));
    li.appendChild(el('span', 'linkCheckText', t));
    host.appendChild(li);
  });
}

function setupFilter() {
  const buttons = $$('[data-link-filter]');
  if (!buttons.length) return;

  const apply = (filterKey) => {
    buttons.forEach((b) => {
      const active = b.getAttribute('data-link-filter') === filterKey;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    $$('[data-filter-item]').forEach((item) => {
      const era = item.getAttribute('data-era') || '';
      const visible = filterKey === 'all' || era === filterKey;
      item.classList.toggle('is-hidden', !visible);
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => apply(btn.getAttribute('data-link-filter') || 'all'));
  });

  apply('all');
}

function setupReveal() {
  const targets = $$('[data-reveal]');
  if (!targets.length) return;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (reduceMotion) {
    targets.forEach((t) => t.classList.add('is-visible'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
  );

  targets.forEach((t) => io.observe(t));
}

function init() {
  renderHero();
  renderOrigins();
  renderWho();
  renderIncarnations();
  renderSkills();
  renderRelations();
  renderWhy();

  setupFilter();
  setupReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

