/* Chronologie de Ganon — page dédiée (vanilla JS)
   Objectifs :
   - Contenus éditables via un tableau JS (remplacer images/textes facilement)
   - Génération des cartes (3 timelines + ère moderne)
   - IntersectionObserver : ajoute .is-visible sur les cartes au scroll
   - Accordéon : click/Enter (bouton) + aria-expanded/aria-controls
   - Filtre : ajoute/retire .is-hidden (Tout/Défaite/Enfant/Adulte/Moderne)
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const PLACEHOLDER_IMG = 'assets/img/ui/ganon.png';

// --- Données à éditer
const GANON_DATA = {
  hero: {
    image: PLACEHOLDER_IMG,
    alt: 'Ganondorf (image de remplacement)',
  },
  appearances: [
    'TLoZ',
    'ALttP',
    'OoT',
    'OoS',
    'OoA',
    'TWW',
    'FSA',
    'TP',
    'ALBW',
    'TCT',
    'CoH',
  ],
  timelines: [
    {
      key: 'defeat',
      title: 'Fin Défaite',
      subtitle: 'La victoire de Ganon : le monde bascule dans l’ombre.',
      accent: 'var(--ganon-defeat)',
      games: [
        {
          title: 'A Link to the Past',
          desc: 'Ganon règne sur le Monde des Ténèbres : un retour au démon pur.',
          tag: 'Démon pur',
          image: 'assets/img/fiche-1986-1995/alttp-1991-1.jpg',
        },
        {
          title: 'The Legend of Zelda (NES)',
          desc: 'Le Roi Démon rassemble la Triforce de la Puissance et menace Hyrule.',
          tag: 'Roi démon',
          image: 'assets/img/fiche-1986-1995/loz-1986-1.jpg',
        },
        {
          title: 'Oracle of Ages / Seasons',
          desc: 'Un rituel tente de ressusciter Ganon : menace cyclique et implacable.',
          tag: 'Résurrection',
          image: 'assets/img/fiche-1996-2005/oracle-2001-1.jpg',
        },
        {
          title: 'A Link Between Worlds',
          desc: 'L’héritage de Ganon ressurgit sous une forme nouvelle (fusion/écho).',
          tag: 'Héritage',
          image: 'assets/img/fiche-2006-2015/albw-2013-1.jpg',
        },
      ],
    },
    {
      key: 'child',
      title: 'Link enfant',
      subtitle: 'Le futur change : jugement, exil… et rancune.',
      accent: 'var(--ganon-child)',
      games: [
        {
          title: 'Twilight Princess',
          desc: 'Ganondorf revient comme menace centrale, plus sombre et déterminé.',
          tag: 'Chevalier sombre',
          image: 'assets/img/fiche-2006-2015/tp-2006-1.jpg',
        },
        {
          title: 'Majora’s Mask',
          desc: 'Pas de Ganon, mais une suite directe de la branche enfant (lien narratif).',
          tag: 'Branche liée',
          image: 'assets/img/fiche-1996-2005/mm-2000-1.jpg',
        },
      ],
    },
    {
      key: 'adult',
      title: 'Ère du grand océan',
      subtitle: 'Hyrule submergé : le Roi Démon revient sous les flots.',
      accent: 'var(--ganon-adult)',
      games: [
        {
          title: 'The Wind Waker',
          desc: 'Ganondorf réapparaît avec une vision tragique : un antagoniste complexe.',
          tag: 'Antagoniste tragique',
          image: 'assets/img/fiche-1996-2005/ww-2002-1.jpg',
        },
        {
          title: 'Phantom Hourglass',
          desc: 'Suite directe : Ganon n’est plus là, mais l’héritage de la branche demeure.',
          tag: 'Héritage',
          image: 'assets/img/fiche-2006-2015/ph-2007-1.jpg',
        },
        {
          title: 'Spirit Tracks',
          desc: 'Nouvelle ère : la légende s’éloigne, mais les traces du passé persistent.',
          tag: 'Légende',
          image: 'assets/img/fiche-2006-2015/st-2009-1.jpg',
        },
      ],
    },
  ],
  modern: [
    {
      key: 'botw',
      title: 'Calamité Ganon',
      subtitle: 'Breath of the Wild',
      desc: 'Une incarnation de rancune et d’énergie maléfique à l’échelle d’Hyrule.',
      tag: 'Calamité',
      accent: 'var(--ganon-defeat)',
      image: 'assets/img/fiche-2016-2025/botw-2017-1.jpg',
      details: [
        'Forme de corruption pure : “rancune” et machines détournées.',
        'Menace cyclique : revient malgré les sceaux et les époques.',
        'Opposition directe à la Triforce (force brute contre sagesse/courage).',
      ],
    },
    {
      key: 'totk',
      title: 'Ganondorf TOTK',
      subtitle: 'Tears of the Kingdom',
      desc: 'Le Roi Démon retrouve un corps et une présence plus “humaine”, mais terrifiante.',
      tag: 'Roi démon',
      accent: 'var(--ganon-adult)',
      image: 'assets/img/fiche-2016-2025/totk-2023-1.jpg',
      details: [
        'Retour d’un Ganondorf incarné : stratégie, charisme, domination.',
        'Aura et pouvoir amplifiés : une menace plus personnelle et mythique.',
        'Réactivation des thèmes fondateurs (Triforce, destin, sceaux).',
      ],
    },
  ],
  gallery: [
    {
      era: 'Branche Défaite',
      tone: 'Le démon triomphe puis revient sans fin.',
      items: [
        {
          title: 'The Legend of Zelda (1986)',
          image: 'assets/img/fiche-1986-1995/loz-1986-2.jpg',
          caption: 'Naissance du mythe du Roi Démon.',
        },
        {
          title: 'A Link to the Past (1991)',
          image: 'assets/img/fiche-1986-1995/alttp-1991-2.jpg',
          caption: 'Ganon règne depuis le Monde des Ténèbres.',
        },
        {
          title: 'Oracle (2001)',
          image: 'assets/img/fiche-1996-2005/oracle-2001-2.jpg',
          caption: 'Rituel de résurrection incomplet.',
        },
        {
          title: 'A Link Between Worlds (2013)',
          image: 'assets/img/fiche-2006-2015/albw-2013-2.jpg',
          caption: 'Retour par fusion et héritage démoniaque.',
        },
      ],
    },
    {
      era: 'Branche Enfant',
      tone: 'Jugement, exil, puis revanche de Ganondorf.',
      items: [
        {
          title: 'Ocarina of Time (1998)',
          image: 'assets/img/fiche-1996-2005/oot-1998-1.jpg',
          caption: 'Point de fracture des lignes temporelles.',
        },
        {
          title: 'Majora’s Mask (2000)',
          image: 'assets/img/fiche-1996-2005/mm-2000-2.jpg',
          caption: 'Pas de Ganon direct, mais continuité de la branche.',
        },
        {
          title: 'Twilight Princess (2006)',
          image: 'assets/img/fiche-2006-2015/tp-2006-2.jpg',
          caption: 'Retour du roi Gerudo en forme bestiale et duel final.',
        },
      ],
    },
    {
      era: 'Branche Adulte',
      tone: 'Hyrule submergé, conflit sous la Grande Mer.',
      items: [
        {
          title: 'The Wind Waker (2002)',
          image: 'assets/img/fiche-1996-2005/ww-2002-2.jpg',
          caption: 'Ganondorf tragique face au dernier roi d’Hyrule.',
        },
        {
          title: 'Phantom Hourglass (2007)',
          image: 'assets/img/fiche-2006-2015/ph-2007-2.jpg',
          caption: 'L’héritage de la branche adulte se poursuit.',
        },
        {
          title: 'Spirit Tracks (2009)',
          image: 'assets/img/fiche-2006-2015/st-2009-2.jpg',
          caption: 'Nouvelle ère, mémoire persistante du Roi Démon.',
        },
      ],
    },
    {
      era: 'Ère Moderne',
      tone: 'Du Fléau au Ganondorf ressuscité.',
      items: [
        {
          title: 'Breath of the Wild (2017)',
          image: 'assets/img/fiche-2016-2025/botw-dlc-2017-1.jpg',
          caption: 'Calamité Ganon comme malice totale.',
        },
        {
          title: 'Tears of the Kingdom (2023)',
          image: 'assets/img/fiche-2016-2025/totk-2023-2.jpg',
          caption: 'Retour d’un Ganondorf incarné, plus politique et direct.',
        },
        {
          title: 'Echoes of Wisdom (2024)',
          image: 'assets/img/fiche-2016-2025/eow-2024-1.jpg',
          caption: 'Un Écho de Ganon sert la menace de Null.',
        },
      ],
    },
  ],
  biography: [
    {
      game: 'The Legend of Zelda',
      period: 'NES / FDS',
      summary:
        'Ganon vole la Triforce du Pouvoir, Zelda brise la Triforce de la Sagesse en huit fragments et Link finit par le vaincre avec les Flèches d’Argent.',
      points: [
        'Invasion d’Hyrule mineur et capture de Zelda.',
        'Combat final au niveau 9 (Rocher du Spectacle).',
        'Défaite de Ganon et récupération de la Triforce du Pouvoir.',
      ],
    },
    {
      game: 'The Adventure of Link',
      period: 'NES',
      summary:
        'Les sbires de Ganon tentent de le ressusciter avec le sang de Link ; Ganon n’apparaît réellement que dans l’écran Game Over.',
      points: [
        'Le “Magicien” pose la malédiction de Zelda endormie.',
        'Rituel de résurrection inachevé pendant l’aventure.',
        'Retour possible de Ganon uniquement dans la défaite de Link.',
      ],
    },
    {
      game: 'A Link to the Past',
      period: 'SNES',
      summary:
        'Ganondorf entre au Royaume Sacré, obtient la Triforce et devient Ganon ; le Royaume Sacré se transforme en Monde des Ténèbres.',
      points: [
        'Manipulation via Agahnim et enlèvement des descendantes des sages.',
        'Le sceau est brisé puis Link poursuit Ganon dans le Monde des Ténèbres.',
        'Victoire finale de Link à la Pyramide du Pouvoir (Épée de Légende + Flèches d’Argent).',
      ],
    },
    {
      game: 'Link’s Awakening',
      period: 'Game Boy',
      summary:
        'Le vrai Ganon n’apparaît pas, mais une Ombre de Ganon reprend sa forme et son style de combat comme souvenir du passé.',
      points: [
        'Forme de cauchemar liée à la mémoire de Link.',
        'Attaques au trident et chauves-souris enflammées.',
        'Vaincu sans Flèches d’Argent (attaque tournoyante / Bottes de Pégase).',
      ],
    },
    {
      game: 'Ocarina of Time',
      period: 'N64',
      summary:
        'Ganondorf, roi Gerudo, manipule la cour d’Hyrule, obtient la Triforce du Pouvoir puis transforme le royaume durant les sept années d’hibernation de Link.',
      points: [
        'Recherche des Pierres Spirituelles et trahison du roi d’Hyrule.',
        'Conquête d’Hyrule et transformation du château en bastion démoniaque.',
        'Défaite de Ganondorf puis forme bestiale Ganon, enfin scellé par les sages.',
      ],
    },
    {
      game: 'Oracle of Seasons / Oracle of Ages',
      period: 'Game Boy Color',
      summary:
        'Twinrova déclenche les rites obscurs (Destruction, Chagrin, Désespoir) pour ressusciter Ganon, mais le rituel incomplet le ramène sous forme instable.',
      points: [
        'Onox et Veran allument deux flammes via le chaos.',
        'Zelda est ciblée comme sacrifice final.',
        'Renaissance imparfaite : Ganon devient une bête sans âme.',
      ],
    },
    {
      game: 'The Wind Waker',
      period: 'GameCube',
      summary:
        'Après son retour, Ganon provoque une crise qui mène à l’inondation d’Hyrule ; il cherche ensuite à reformer la Triforce.',
      points: [
        'Capture de jeunes filles aux oreilles pointues pour retrouver Zelda.',
        'Affrontement final sur la tour, avec intervention du roi d’Hyrule.',
        'Coup final de Link : Épée de Légende dans le front de Ganondorf.',
      ],
    },
    {
      game: 'Four Swords Adventures',
      period: 'GameCube',
      summary:
        'Ganondorf se réincarne, récupère le Trident, exploite le Miroir des Ténèbres et orchestre le chaos via les Shadow Link.',
      points: [
        'Transgression du tabou Gerudo et vol d’artefacts sacrés.',
        'Manipulation de Link pour libérer Vaati en diversion.',
        'Scellé dans l’Épée de Quatre après le combat final.',
      ],
    },
    {
      game: 'Twilight Princess',
      period: 'GameCube / Wii',
      summary:
        'Condamné à mort, Ganondorf survit grâce à la Triforce du Pouvoir, est exilé dans le Crépuscule et manipule Zant pour revenir.',
      points: [
        'Prise de contrôle de Zelda puis transformation en Ganon.',
        'Affrontements successifs : magie, bête, duel à cheval puis duel à l’épée.',
        'Mort lorsque la Triforce du Pouvoir quitte finalement sa main.',
      ],
    },
    {
      game: 'Skyward Sword',
      period: 'Wii',
      summary:
        'Ganon n’est pas présent directement, mais le jeu ancre son origine dans la haine de Demise, vouée à se réincarner.',
      points: [
        'Fondation mythologique de la boucle Link / Zelda / Roi Démon.',
        'La “malédiction” explique la récurrence des conflits.',
      ],
    },
    {
      game: 'A Link Between Worlds',
      period: '3DS',
      summary:
        'Yuga ressuscite Ganon puis fusionne avec lui ; la lutte tourne autour des fragments de Triforce et du destin de Lorule/Hyrule.',
      points: [
        'Fusion Yuga-Ganon pour concentrer la puissance.',
        'Confrontation finale après l’éveil des sages et de la Triforce du Courage.',
      ],
    },
    {
      game: 'Breath of the Wild',
      period: 'Switch / Wii U',
      summary:
        'Sous forme de Fléau, Ganon revient comme catastrophe cyclique, corrompt Gardiens et Créatures Divines, puis affronte Link et Zelda.',
      points: [
        'Calamité déjà vaincue 10 000 ans plus tôt avec la technologie Sheikah.',
        'Destruction d’Hyrule un siècle avant le début du jeu.',
        'Phase finale : Ganon la Bête Sombre, détruit avec l’aide de Zelda.',
      ],
    },
    {
      game: 'Tears of the Kingdom',
      period: 'Switch',
      summary:
        'Ganondorf est découvert momifié sous Hyrule, se réveille, relance la malice et réapparaît comme Roi Démon incarné.',
      points: [
        'Réveil dans les profondeurs et corruption du bras de Link.',
        'Retour d’un Ganondorf “humain” puis montée en puissance démoniaque.',
        'Réactivation des thèmes trident, Triforce du Pouvoir et guerre antique.',
      ],
    },
    {
      game: 'Echoes of Wisdom',
      period: 'Switch',
      summary:
        'Le “Ganon” rencontré est un Écho lié à Null, pas le véritable Ganondorf originel.',
      points: [
        'Kidnapping de Zelda puis faille vers le Monde immobile.',
        'Le faux Ganon sert de leurre narratif avant la menace réelle.',
        'Combat en phases (trident, chauves-souris, boules de feu, volée du mort).',
      ],
    },
  ],
  dossier: [
    {
      title: 'Contexte',
      tag: 'Origines',
      lines: [
        'Ganondorf est un Gerudo, roi désigné d’un peuple où un seul homme naît par siècle.',
        'Dans plusieurs versions de la chronologie, il devient Ganon après avoir obtenu ou approché la Triforce.',
        'Son rôle évolue du “boss final” monstrueux vers un antagoniste politique et mythologique.',
      ],
    },
    {
      title: 'Personnalité',
      tag: 'Profil',
      lines: [
        'Mégalomane, patient, calculateur : il préfère souvent manipuler avant d’affronter.',
        'Courtois en façade, mais brutal et destructeur quand le contrôle lui échappe.',
        'Dans The Wind Waker, ses motivations gagnent en profondeur avec le contraste désert Gerudo / Hyrule fertile.',
      ],
    },
    {
      title: 'Capacités',
      tag: 'Pouvoirs',
      lines: [
        'Mage de très haut niveau, épéiste compétent et combattant physiquement redoutable.',
        'La Triforce du Pouvoir lui confère une quasi-invulnérabilité et une régénération hors norme.',
        'Peut engendrer et commander des armées de monstres via sa malice.',
      ],
    },
    {
      title: 'Noms et formes',
      tag: 'Nomenclature',
      lines: [
        'Ganondorf : forme humanoïde (roi Gerudo).',
        'Ganon : forme démoniaque/porcine ou surnom du roi démon.',
        'Variantes majeures : Fléau Ganon, Bête Sombre, Yuga-Ganon, Écho de Ganon.',
      ],
    },
    {
      title: 'Arsenal',
      tag: 'Armes',
      lines: [
        'Trident : symbole récurrent de sa puissance démoniaque.',
        'Épées : doubles lames (The Wind Waker), Épée des Six Sages (Twilight Princess).',
        'Magie noire : projectiles, malédictions, invocations, transformations.',
      ],
    },
    {
      title: 'Stratégie récurrente',
      tag: 'Méthode',
      lines: [
        'Corrompre de l’intérieur : conseillers, usurpateurs, marionnettes (Agahnim, Zant, etc.).',
        'Briser ou contourner les sceaux, puis frapper Hyrule quand ses gardiens sont affaiblis.',
        'Forcer la réunion des détenteurs de Triforce pour s’emparer du pouvoir total.',
      ],
    },
  ],
  references: [
    {
      type: 'Jeux principaux',
      source:
        'The Legend of Zelda, The Adventure of Link, A Link to the Past, Ocarina of Time, The Wind Waker, Twilight Princess, Breath of the Wild, Tears of the Kingdom, Echoes of Wisdom.',
      note: 'Base canonique prioritaire pour les faits de chronologie et de narration.',
    },
    {
      type: 'Titres satellites',
      source:
        'Oracle of Seasons / Oracle of Ages, Four Swords Adventures, A Link Between Worlds, Link’s Awakening.',
      note: 'Complètent les cycles de résurrection, les variantes et les formes secondaires.',
    },
    {
      type: 'Ouvrages',
      source: 'Hyrule Historia, The Legend of Zelda Encyclopedia (repères éditoriaux).',
      note: 'Utilisés pour recouper la terminologie et la structure des périodes.',
    },
    {
      type: 'Note éditoriale',
      source: 'Synthèse rédigée à partir de ton dossier de recherche intégré à la page.',
      note: 'Texte reformulé pour le web, avec sections compactes et lisibles.',
    },
  ],
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function renderTimelines() {
  const host = $('[data-ganon-timelines]');
  if (!host) return;

  host.innerHTML = '';

  GANON_DATA.timelines.forEach((timeline) => {
    const panel = el('article', 'portal ganonPanel');
    panel.style.setProperty('--accent', timeline.accent);
    panel.dataset.filterItem = '';
    panel.dataset.era = timeline.key;

    const top = el('div', 'portal-top');
    top.appendChild(el('h3', '', timeline.title));
    top.appendChild(el('p', '', timeline.subtitle));
    panel.appendChild(top);

    const list = el('ul', 'ganonGameList');

    timeline.games.forEach((game) => {
      const li = document.createElement('li');

      const card = el('article', 'ganonGameCard');
      card.dataset.reveal = '';

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = game.image || PLACEHOLDER_IMG;
      img.alt = `Illustration — ${game.title}`;

      const body = el('div', 'ganonGameBody');
      body.appendChild(el('h4', '', game.title));
      body.appendChild(el('p', '', game.desc));

      const tagWrap = el('div', 'ganonGameTag');
      tagWrap.appendChild(el('span', '', game.tag));
      body.appendChild(tagWrap);

      card.appendChild(img);
      card.appendChild(body);

      li.appendChild(card);
      list.appendChild(li);
    });

    panel.appendChild(list);
    host.appendChild(panel);
  });
}

function renderModern() {
  const host = $('[data-ganon-modern]');
  if (!host) return;

  host.innerHTML = '';

  const band = $('.ganonBand');
  if (band) {
    band.dataset.filterItem = '';
    band.dataset.era = 'modern';
  }

  GANON_DATA.modern.forEach((entry) => {
    const card = el('article', 'ganonModernCard');
    card.dataset.reveal = '';
    card.style.setProperty('--accent', entry.accent || 'var(--gold)');

    const header = el('header', 'ganonModernHead');
    const headLeft = document.createElement('div');
    headLeft.appendChild(el('h3', '', entry.title));
    headLeft.appendChild(el('p', 'muted', entry.subtitle));
    header.appendChild(headLeft);

    card.appendChild(header);
    card.appendChild(el('p', '', entry.desc));

    const media = el('div', 'ganonModernMedia');
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = entry.image || PLACEHOLDER_IMG;
    img.alt = `Illustration — ${entry.title}`;
    media.appendChild(img);
    card.appendChild(media);

    const tagWrap = el('div', 'ganonGameTag');
    tagWrap.appendChild(el('span', '', entry.tag));
    card.appendChild(tagWrap);

    const accordion = el('div', 'ganonAccordion');
    const triggerId = `ganon-${entry.key}-trigger`;
    const panelId = `ganon-${entry.key}-panel`;

    const btn = el('button', 'btn btn-small');
    btn.type = 'button';
    btn.id = triggerId;
    btn.dataset.accordionTrigger = '';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', panelId);
    btn.textContent = 'Voir détails';

    const panel = el('div', 'ganonAccordionPanel');
    panel.id = panelId;
    panel.hidden = true;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', triggerId);

    const ul = document.createElement('ul');
    (entry.details || []).slice(0, 5).forEach((line) => {
      ul.appendChild(el('li', '', line));
    });
    panel.appendChild(ul);

    accordion.appendChild(btn);
    accordion.appendChild(panel);
    card.appendChild(accordion);

    card.dataset.filterItem = '';
    card.dataset.era = 'modern';

    host.appendChild(card);
  });
}

function renderGallery() {
  const host = $('[data-ganon-gallery]');
  if (!host) return;

  host.innerHTML = '';

  (GANON_DATA.gallery || []).forEach((era) => {
    const card = el('article', 'ganonGalleryEra');
    card.dataset.reveal = '';

    const head = el('header', 'ganonGalleryHead');
    head.appendChild(el('h3', '', era.era || 'Époque'));
    head.appendChild(el('p', 'muted', era.tone || ''));
    card.appendChild(head);

    const grid = el('div', 'ganonGalleryPhotos');
    (era.items || []).forEach((item) => {
      const figure = el('figure', 'ganonGalleryItem');
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = item.image || PLACEHOLDER_IMG;
      img.alt = `Illustration — ${item.title || 'Ganon'}`;

      const cap = el('figcaption', 'ganonGalleryCaption');
      cap.appendChild(el('strong', '', item.title || 'Titre'));
      cap.appendChild(el('span', '', item.caption || ''));

      figure.appendChild(img);
      figure.appendChild(cap);
      grid.appendChild(figure);
    });

    card.appendChild(grid);
    host.appendChild(card);
  });
}

function renderAppearances() {
  const host = $('[data-ganon-appearances]');
  if (!host) return;

  host.innerHTML = '';

  const title = el('p', 'ganonAppearancesTitle', 'Présences majeures');
  host.appendChild(title);

  const list = el('div', 'ganonAppearancesList');
  (GANON_DATA.appearances || []).forEach((code) => {
    const chip = el('span', 'ganonAppearanceChip', code);
    list.appendChild(chip);
  });
  host.appendChild(list);
}

function renderBiography() {
  const host = $('[data-ganon-bio]');
  if (!host) return;

  host.innerHTML = '';

  (GANON_DATA.biography || []).forEach((entry) => {
    const card = el('article', 'ganonLoreCard');
    card.dataset.reveal = '';

    const head = el('header', 'ganonLoreHead');
    head.appendChild(el('h3', '', entry.game));
    head.appendChild(el('p', 'muted', entry.period || ''));
    card.appendChild(head);

    card.appendChild(el('p', 'ganonLoreSummary', entry.summary || ''));

    const ul = el('ul', 'ganonLoreList');
    (entry.points || []).forEach((line) => {
      ul.appendChild(el('li', '', line));
    });
    card.appendChild(ul);

    host.appendChild(card);
  });
}

function renderDossier() {
  const host = $('[data-ganon-dossier]');
  if (!host) return;

  host.innerHTML = '';

  (GANON_DATA.dossier || []).forEach((entry) => {
    const card = el('article', 'ganonDossierCard');
    card.dataset.reveal = '';

    const head = el('div', 'ganonDossierHead');
    head.appendChild(el('h3', '', entry.title));
    const tagWrap = el('div', 'ganonGameTag');
    tagWrap.appendChild(el('span', '', entry.tag || 'Note'));
    head.appendChild(tagWrap);
    card.appendChild(head);

    const ul = el('ul', 'ganonDossierList');
    (entry.lines || []).forEach((line) => {
      ul.appendChild(el('li', '', line));
    });
    card.appendChild(ul);

    host.appendChild(card);
  });
}

function renderReferences() {
  const host = $('[data-ganon-references]');
  if (!host) return;

  host.innerHTML = '';

  const list = el('ul', 'ganonRefsList');
  (GANON_DATA.references || []).forEach((entry) => {
    const li = el('li', 'ganonRefsItem');

    const top = el('div', 'ganonRefsTop');
    const tagWrap = el('div', 'ganonGameTag');
    tagWrap.appendChild(el('span', '', entry.type || 'Source'));
    top.appendChild(tagWrap);
    top.appendChild(el('p', '', entry.source || ''));
    li.appendChild(top);

    li.appendChild(el('p', 'muted', entry.note || ''));
    list.appendChild(li);
  });

  host.appendChild(list);
}

function setupAccordion() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-accordion-trigger]');
    if (!btn) return;

    const panelId = btn.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;

    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const next = !expanded;

    btn.setAttribute('aria-expanded', next ? 'true' : 'false');
    panel.hidden = !next;
  });
}

function setupFilter() {
  const buttons = $$('[data-filter]');
  if (!buttons.length) return;

  const apply = (filterKey) => {
    buttons.forEach((b) => {
      const active = b.getAttribute('data-filter') === filterKey;
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
    btn.addEventListener('click', () => apply(btn.getAttribute('data-filter') || 'all'));
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

function hydrateHeroImage() {
  const img = $('[data-ganon-hero-img]');
  if (!img) return;
  img.src = GANON_DATA.hero.image || img.src;
  img.alt = GANON_DATA.hero.alt || img.alt || '';
}

function init() {
  hydrateHeroImage();
  renderTimelines();
  renderModern();
  renderGallery();
  renderAppearances();
  renderBiography();
  renderDossier();
  renderReferences();
  setupAccordion();
  setupFilter();
  setupReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
