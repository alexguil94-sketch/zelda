/* Page Zelda — contenu + interactions (vanilla JS)
   - Contenu éditable via un objet JSON (ZELDA_DATA)
   - Fade-in au scroll (IntersectionObserver) + respect prefers-reduced-motion
   - Accordéon (ARIA) pour “Origines & lignée”
   - Carrousel léger (ARIA) pour la galerie d’incarnations
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const PLACE_IMG = 'assets/img/ui/chronologie_ref.jpg';

// =========================
// JSON — Contenu à éditer
// =========================
const ZELDA_DATA = {
  hero: {
    title: 'Princesse Zelda',
    subtitle: 'Héritière d’Hylia • Porteuse de la Sagesse • Gardienne d’Hyrule',
    bullets: [
      { label: 'Rôle', text: 'Souveraine et guide : elle protège le royaume autant par l’esprit que par le cœur.' },
      { label: 'Triforce', text: 'Sagesse : lucidité, clairvoyance, et choix difficiles quand tout vacille.' },
      { label: 'Mission', text: 'Maintenir les sceaux, préserver la mémoire d’Hyrule, et rallumer l’espoir à l’heure la plus sombre.' },
    ],
    quote:
      '“Quand la nuit dévore les routes, la Sagesse n’éclaire pas seulement le chemin : elle apprend à le reconstruire.”',
    image: { src: PLACE_IMG, alt: 'Princesse Zelda (image de remplacement)' },
  },

  origins: {
    paragraphs: [
      'Zelda n’est pas une seule personne : c’est une lignée. Une promesse royale qui se réveille, âge après âge, sous des visages différents. À chaque époque, la princesse porte le même poids — non pas celui d’une couronne, mais d’un devoir.',
      'Dans les chroniques d’Hyrule, la souveraineté n’est jamais un luxe. Elle s’apprend dans la prudence, se paie en renoncements, et se mesure à la capacité de protéger sans céder à la Force brute. Le nom “Zelda” se transmet comme un flambeau : pour rappeler que la mémoire peut survivre aux ruines.',
      'On murmure l’héritage d’Hylia : une origine sacrée, sans besoin de révéler tous ses secrets. Ce qui compte, c’est le rôle — garder un lien entre le peuple, la lumière, et l’avenir, même quand le temps se fracture.',
    ],
    accordionTitle: 'Serment de la lignée (sans spoilers lourds)',
    accordionParagraphs: [
      'Être Zelda, c’est apprendre à écouter avant de décider, et à décider avant d’être prête.',
      'C’est porter la Sagesse non comme un titre, mais comme une responsabilité : celle de sceller le mal, d’élever le royaume, et d’oser le sacrifice quand il n’existe aucune solution parfaite.',
    ],
  },

  powers: [
    {
      title: 'Sagesse & clairvoyance',
      text: 'Lire entre les lignes du destin, percevoir l’ombre derrière le mensonge, choisir l’issue la moins cruelle.',
      note: 'Note lore : la Sagesse n’est pas “savoir tout”, c’est savoir quoi préserver.',
      icon: '✦',
    },
    {
      title: 'Magie de lumière / purification',
      text: 'Une lumière qui repousse la corruption, répare les sceaux, et rend au monde sa respiration.',
      note: 'Note lore : la lumière de Zelda n’attaque pas d’abord — elle délivre.',
      icon: '☼',
    },
    {
      title: 'Sceaux & prières (rituels)',
      text: 'Formules anciennes, chants, gestes sacrés : une magie lente, mais décisive, qui tient des siècles.',
      note: 'Note lore : un sceau est une promesse… et un prix.',
      icon: 'ᛟ',
    },
    {
      title: 'Flèches de lumière / arc sacré',
      text: 'Quand la lumière devient projectile : une justice nette, rare, réservée aux ténèbres majeures.',
      note: 'Note lore : l’arme est sacrée, mais la volonté l’est davantage.',
      icon: '➶',
    },
    {
      title: 'Communication / guidance',
      text: 'Visions, songes, lien spirituel : Zelda guide sans imposer, avertit sans écraser le libre arbitre.',
      note: 'Note lore : la guidance est un pont — pas une chaîne.',
      icon: '◈',
    },
    {
      title: 'Leadership (décisions, sacrifice)',
      text: 'Rassembler, négocier, résister. Parfois attendre, parfois frapper. Toujours assumer.',
      note: 'Note lore : la sagesse royale se lit dans les conséquences.',
      icon: '♛',
    },
  ],

  incarnations: [
    {
      title: 'Zelda / Sheik',
      subtitle: 'Ocarina of Time — la sagesse en mouvement',
      image: { src: PLACE_IMG, alt: 'Zelda / Sheik (image de remplacement)' },
      lines: [
        'Elle comprend que survivre, parfois, exige de disparaître.',
        'La princesse devient guide : discrète, précise, indispensable.',
        'Sa force n’est pas la domination, mais l’anticipation.',
        'Elle protège l’avenir en protégeant d’abord le héros.',
        'Une preuve : la Sagesse sait se faire ombre quand il le faut.',
      ],
    },
    {
      title: 'Zelda érudite',
      subtitle: 'Skyward Sword — l’écho d’Hylia',
      image: { src: PLACE_IMG, alt: 'Zelda érudite (image de remplacement)' },
      lines: [
        'Elle avance avec douceur, mais sans fuite devant le destin.',
        'Sa foi n’est pas aveugle : elle est courageuse.',
        'La transmission n’est pas un héritage de sang, mais de devoir.',
        'Chaque pas construit un sceau, chaque choix construit un monde.',
        'Une Zelda fondatrice : le mythe devient responsabilité.',
      ],
    },
    {
      title: 'Zelda royale',
      subtitle: 'Twilight Princess — dignité au bord du crépuscule',
      image: { src: PLACE_IMG, alt: 'Zelda royale (image de remplacement)' },
      lines: [
        'Elle porte le royaume comme on porte une forteresse : sans trembler.',
        'Elle ne promet pas la victoire — seulement la tenue.',
        'Sa présence pèse, mais elle n’écrase jamais.',
        'Quand tout s’assombrit, elle offre une ligne de conduite.',
        'Une leçon : la noblesse, c’est la lucidité sous pression.',
      ],
    },
    {
      title: 'Zelda stratège',
      subtitle: 'Breath of the Wild — science, patience et sacrifice',
      image: { src: PLACE_IMG, alt: 'Zelda stratège (image de remplacement)' },
      lines: [
        'Elle cherche, échoue, recommence — et transforme l’échec en méthode.',
        'Elle apprend la Sagesse comme une discipline, pas comme un don.',
        'Elle porte une guerre de cent ans dans le silence.',
        'Son pouvoir est d’abord une résistance : tenir, encore, encore.',
        'Une Zelda humaine : l’espoir devient effort.',
      ],
    },
    {
      title: 'Zelda renaissante',
      subtitle: 'The Wind Waker — la royauté derrière l’audace',
      image: { src: PLACE_IMG, alt: 'Zelda renaissante (image de remplacement)' },
      lines: [
        'Elle vit libre, puis comprend ce que signifie “hériter”.',
        'La princesse n’est pas un masque : c’est une responsabilité assumée.',
        'Elle choisit d’être plus qu’un symbole : une décision.',
        'Son identité devient pont entre passé englouti et futur possible.',
        'Une Zelda lumineuse : l’autorité peut naître de la bravoure.',
      ],
    },
    {
      title: 'Zelda souveraine',
      subtitle: 'Tears of the Kingdom — mémoire, sacrifice et renaissance',
      image: { src: PLACE_IMG, alt: 'Zelda souveraine (image de remplacement)' },
      lines: [
        'Elle agit pour un futur qu’elle ne verra peut-être pas.',
        'Son choix est moins un acte héroïque qu’un acte fondateur.',
        'La Sagesse devient une histoire longue : un fil tendu sur des siècles.',
        'Elle incarne la continuité quand tout menace de se briser.',
        'Une Zelda mythique : l’espoir prend la forme d’un serment.',
      ],
    },
  ],

  timeline: [
    { label: 'Skyward Sword', text: 'La princesse découvre que la Sagesse est une promesse ancienne — et qu’elle doit être tenue.' },
    { label: 'Ocarina of Time', text: 'Elle guide dans l’ombre : protéger le futur commence parfois par disparaître.' },
    { label: 'A Link to the Past', text: 'Zelda devient appel et refuge : la sagesse survit même derrière les barreaux.' },
    { label: 'Twilight Princess', text: 'Le devoir royal se fait bouclier : tenir droit quand le monde penche.' },
    { label: 'The Wind Waker', text: 'L’identité se révèle : la royauté renaît au milieu des vagues.' },
    { label: 'Spirit Tracks', text: 'Même séparée, Zelda agit : la sagesse se transmet, se partage, se relève.' },
    { label: 'Breath of the Wild', text: 'La patience devient pouvoir : résister assez longtemps pour sauver un royaume.' },
    { label: 'Tears of the Kingdom', text: 'La mémoire devient destin : l’espoir s’étend sur des âges pour gagner une seule seconde.' },
  ],

  relations: [
    {
      title: 'Link',
      subtitle: 'L’élan du Courage',
      text: 'Link avance. Zelda comprend. Ensemble, ils composent une alliance rare : l’action guidée par la lucidité.',
      bullets: [
        'Dynamique : coopération, confiance, respect des rôles.',
        'Impact : le héros agit, la princesse structure l’issue.',
        'Nuance : pas besoin de romance — leur lien est d’abord un serment.',
      ],
      accent: 'var(--blue)',
    },
    {
      title: 'Impa',
      subtitle: 'La mémoire vivante',
      text: 'Impa protège la lignée, transmet les rites, et rappelle à Zelda que le devoir ne se porte jamais seule.',
      bullets: [
        'Dynamique : mentorat, loyauté, protection sans étouffer.',
        'Impact : continuité des sceaux, discipline, tradition.',
        'Nuance : l’ombre qui garde la lumière, sans chercher le trône.',
      ],
      accent: 'var(--forest)',
    },
    {
      title: 'Ganondorf',
      subtitle: 'La tentation de la Force',
      text: 'Face à la domination, Zelda incarne l’opposé : une puissance qui choisit de protéger plutôt que de posséder.',
      bullets: [
        'Dynamique : duel idéologique (possession vs protection).',
        'Impact : sceaux, guerres, cycles — la sagesse paie le prix du temps.',
        'Nuance : l’ombre n’efface pas la lumière, elle la met à l’épreuve.',
      ],
      accent: 'var(--ruby)',
    },
  ],

  why: [
    'Zelda compte parce qu’elle refuse la simplification. Dans une saga où la Force pourrait tout emporter, elle rappelle que le monde se sauve aussi avec des choix, des limites, et une mémoire.',
    'Elle incarne une sagesse active : pas celle qui observe, mais celle qui agit au bon moment — parfois en silence, parfois au premier rang, toujours avec une vision plus large qu’elle-même.',
    'À travers ses incarnations, Zelda devient le symbole d’un espoir durable : un royaume peut tomber, se submerger, se fracturer… et pourtant, une voix continue de dire : “recommence.”',
  ],
};

// Expose pour édition rapide dans la console si besoin
window.ZELDA_DATA = ZELDA_DATA;

// =========================
// Rendu
// =========================
function renderHero() {
  const title = $('[data-zelda-hero-title]');
  const subtitle = $('[data-zelda-hero-subtitle]');
  const bulletHost = $('[data-zelda-hero-bullets]');
  const quote = $('[data-zelda-hero-quote]');
  const quoteWrap = $('[data-zelda-hero-quote-wrap]');
  const heroImg = $('[data-zelda-hero-img]');

  if (title) title.textContent = ZELDA_DATA.hero.title;
  if (subtitle) subtitle.textContent = ZELDA_DATA.hero.subtitle;

  if (bulletHost) {
    bulletHost.innerHTML = '';
    ZELDA_DATA.hero.bullets.slice(0, 3).forEach((b) => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = `${b.label} : `;
      li.appendChild(strong);
      li.appendChild(document.createTextNode(b.text));
      bulletHost.appendChild(li);
    });
  }

  if (quoteWrap) {
    const hasQuote = Boolean(ZELDA_DATA.hero.quote && ZELDA_DATA.hero.quote.trim());
    quoteWrap.hidden = !hasQuote;
    if (quote && hasQuote) quote.textContent = ZELDA_DATA.hero.quote;
  }

  if (heroImg) {
    heroImg.src = ZELDA_DATA.hero.image?.src || heroImg.src;
    heroImg.alt = ZELDA_DATA.hero.image?.alt || heroImg.alt || '';
  }
}

function renderOrigins() {
  const host = $('[data-zelda-origins]');
  if (host) {
    host.innerHTML = '';
    (ZELDA_DATA.origins.paragraphs || []).forEach((t) => {
      host.appendChild(el('p', '', t));
    });
  }

  const btn = $('[data-accordion-trigger]');
  const panel = $('#zeldaOriginsMore');
  if (!btn || !panel) return;

  btn.textContent = ZELDA_DATA.origins.accordionTitle || btn.textContent;

  const extra = (ZELDA_DATA.origins.accordionParagraphs || []).filter(Boolean);
  panel.innerHTML = '';
  extra.forEach((t) => panel.appendChild(el('p', '', t)));

  // Si rien à afficher, on masque tout
  if (!extra.length) {
    btn.hidden = true;
    panel.hidden = true;
  }
}

function renderPowers() {
  const host = $('[data-zelda-powers]');
  if (!host) return;

  host.innerHTML = '';
  ZELDA_DATA.powers.forEach((c) => {
    const card = el('article', 'lore-card lore-card--icon');
    card.dataset.reveal = '';

    const head = el('div', 'lore-cardHead');
    const icon = el('span', 'lore-icon', c.icon || '✦');
    icon.setAttribute('aria-hidden', 'true');
    head.appendChild(icon);
    head.appendChild(el('h3', '', c.title));
    card.appendChild(head);

    card.appendChild(el('p', '', c.text));
    card.appendChild(el('p', 'lore-note', c.note));

    host.appendChild(card);
  });
}

function renderRelations() {
  const host = $('[data-zelda-relations]');
  if (!host) return;

  host.innerHTML = '';
  ZELDA_DATA.relations.forEach((r) => {
    const card = el('article', 'lore-card lore-card--relation');
    card.dataset.reveal = '';
    card.style.setProperty('--accent', r.accent || 'var(--gold)');

    card.appendChild(el('h3', '', r.title));
    card.appendChild(el('p', 'muted', r.subtitle));
    card.appendChild(el('p', '', r.text));

    const ul = document.createElement('ul');
    ul.className = 'lore-list';
    (r.bullets || []).slice(0, 4).forEach((t) => ul.appendChild(el('li', '', t)));
    card.appendChild(ul);

    host.appendChild(card);
  });
}

function renderCarousel() {
  const track = $('[data-zelda-carousel-track]');
  if (!track) return;

  track.innerHTML = '';
  track.setAttribute('tabindex', '0');

  ZELDA_DATA.incarnations.forEach((item, idx) => {
    const card = el('article', 'lore-card zelda-slide');
    card.dataset.reveal = '';
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${idx + 1} sur ${ZELDA_DATA.incarnations.length}`);

    const fig = document.createElement('figure');
    fig.className = 'zelda-figure';

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = item.image?.src || PLACE_IMG;
    img.alt = item.image?.alt || `Illustration — ${item.title}`;
    fig.appendChild(img);

    const cap = el('figcaption', 'zelda-figcap');
    cap.appendChild(el('h3', '', item.title));
    cap.appendChild(el('p', 'muted', item.subtitle));
    fig.appendChild(cap);

    card.appendChild(fig);

    const ul = document.createElement('ul');
    ul.className = 'lore-list';
    (item.lines || []).slice(0, 5).forEach((t) => ul.appendChild(el('li', '', t)));
    card.appendChild(ul);

    track.appendChild(card);
  });
}

function renderTimeline() {
  const host = $('[data-zelda-timeline]');
  if (!host) return;
  host.innerHTML = '';

  ZELDA_DATA.timeline.forEach((t) => {
    const li = el('li', 'timeline-item');
    li.dataset.reveal = '';

    const node = el('span', 'timeline-node');
    node.setAttribute('aria-hidden', 'true');
    li.appendChild(node);

    li.appendChild(el('h3', 'timeline-title', t.label));
    li.appendChild(el('p', 'timeline-text', t.text));

    host.appendChild(li);
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// =========================
// Interactions
// =========================
function setupAccordion() {
  const btn = $('[data-accordion-trigger]');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const id = btn.getAttribute('aria-controls');
    const panel = id ? document.getElementById(id) : null;
    if (!panel) return;

    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    btn.setAttribute('aria-expanded', next ? 'true' : 'false');
    panel.hidden = !next;
  });
}

function setupCarousel() {
  const wrap = $('[data-zelda-carousel]');
  const track = $('[data-zelda-carousel-track]');
  const prev = $('[data-carousel-prev]');
  const next = $('[data-carousel-next]');
  if (!wrap || !track || !prev || !next) return;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const step = () => {
    const first = track.querySelector('.zelda-slide');
    if (!first) return 420;
    const rect = first.getBoundingClientRect();
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return rect.width + gap;
  };

  const scrollByX = (x) => {
    if (reduceMotion) track.scrollLeft += x;
    else track.scrollBy({ left: x, top: 0, behavior: 'smooth' });
  };

  const update = () => {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft >= max - 2;

    prev.disabled = atStart;
    next.disabled = atEnd;
    prev.setAttribute('aria-disabled', atStart ? 'true' : 'false');
    next.setAttribute('aria-disabled', atEnd ? 'true' : 'false');
  };

  prev.addEventListener('click', () => scrollByX(-step()));
  next.addEventListener('click', () => scrollByX(step()));

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByX(-step()); }
    if (e.key === 'ArrowRight') { e.preventDefault(); scrollByX(step()); }
  });

  track.addEventListener('scroll', () => update(), { passive: true });
  window.addEventListener('resize', update);

  update();
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
  renderPowers();
  renderCarousel();
  renderTimeline();
  renderRelations();

  setupAccordion();
  setupCarousel();
  setupReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

