/* Menu Chronologie — 40 ans de Zelda (vanilla JS)
   - Modale (fenêtre) avec 2 images + 3-4 lignes
   - Lightbox (zoom) : clic + molette + drag

   Burger menu : géré par /js/burger.js

   Modifie tes contenus ici : ITEMS (titre, texte, images, lien)
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// --- 1) Données à éditer
// Astuce : remplace les images par les tiennes dans /assets/img/
const PLACE_IMG_1 = 'assets/img/ui/chronologie_ref.jpg';
const PLACE_IMG_2 = 'assets/logo/logo1_zelda_.jpeg';

const ITEMS = {
  // Portails décennies
  'era-1986': {
    title: '1986 – 1995',
    sub: 'Naissance & fondations (ère 2D)',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Le début de la légende : exploration libre, secrets, premiers donjons.",
      "Naissance du lore (Triforce, Link, Zelda, Ganon) et de la formule Zelda.",
      "Consolidation 2D avec des bases de level design qui vont durer 40 ans.",
    ],
    ctaLabel: 'Entrer dans la page',
    href: 'pages/1986-1995.html'
  },
  'era-1996': {
    title: '1996 – 2005',
    sub: 'Révolution 3D & expérimentation',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Passage à la 3D : ciblage, caméra, donjons en volume — un standard.",
      "Boucle temporelle, masques, océan… Nintendo ose des mécaniques folles.",
      "Une décennie qui pose un énorme héritage sur console + portable.",
    ],
    ctaLabel: 'Entrer dans la page',
    href: 'pages/1996-2005.html'
  },
  'era-2006': {
    title: '2006 – 2015',
    sub: 'Nouveaux horizons (Wii / DS / 3DS)',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Expérimentation des contrôles (tactile, mouvement) et nouvelles contraintes.",
      "Ton plus mature (Twilight Princess) puis origines du lore (Skyward Sword).",
      "Le 2D innove encore (A Link Between Worlds) + remakes/remasters en série.",
    ],
    ctaLabel: 'Entrer dans la page',
    href: 'pages/2006-2015.html'
  },
  'era-2016': {
    title: '2016 – 2025',
    sub: 'Open‑air, remasters, transmedia, transition Switch → Switch 2',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "BOTW (2017) refond la formule : monde ouvert systémique.",
      "TOTK (2023) pousse le bac à sable créatif (assemblage, verticalité).",
      "2025 : Switch 2 Editions + Zelda Notes = stratégie de transition.",
    ],
    ctaLabel: 'Entrer dans la page',
    href: 'pages/2016-2025.html'
  },

  // Arbre résumé
  oot: {
    title: 'The Legend of Zelda: Ocarina of Time',
    sub: '1998 • Nintendo 64',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Le modèle de l’aventure 3D : ciblage, caméra, donjons et mise en scène.",
      "Voyage dans le temps : Link enfant/adulte, conséquences sur Hyrule.",
      "Un pivot majeur de la saga (et un repère de l’ère N64).",
    ],
    ctaLabel: 'Aller à 1996–2005',
    href: 'pages/1996-2005.html'
  },
  alttp: {
    title: 'A Link to the Past',
    sub: '1991 • Super Nintendo',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "La formule Zelda 2D raffinée : donjon → objet → boss.",
      "Double monde (Lumière/Ténèbres) : un concept qui reviendra souvent.",
      "Un pilier de la période 2D.",
    ],
    ctaLabel: 'Aller à 1986–1995',
    href: 'pages/1986-1995.html'
  },
  oracles: {
    title: 'Oracle of Ages / Seasons',
    sub: '2001 • Game Boy Color',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Deux jeux complémentaires : énigmes (Ages) + action/exploration (Seasons).",
      "Connexion via code : histoire étendue et secrets croisés.",
      "Un classique portable souvent sous‑côté.",
    ],
    ctaLabel: 'Aller à 1996–2005',
    href: 'pages/1996-2005.html'
  },
  la: {
    title: 'Link’s Awakening',
    sub: '1993 • Game Boy',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Zelda portable, ambiance étrange et mélancolique sur Cocolint.",
      "Donjons solides + scénario marquant.",
      "La preuve qu’un Zelda “hors Hyrule” peut être culte.",
    ],
    ctaLabel: 'Aller à 1986–1995',
    href: 'pages/1986-1995.html'
  },
  albw: {
    title: 'A Link Between Worlds',
    sub: '2013 • Nintendo 3DS',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Transformation en peinture murale : puzzles ultra inventifs.",
      "Objets loués : plus de liberté dans l’ordre des donjons.",
      "Un pont parfait entre Zelda classique et modernité.",
    ],
    ctaLabel: 'Aller à 2006–2015',
    href: 'pages/2006-2015.html'
  },
  mm: {
    title: 'Majora’s Mask',
    sub: '2000 • Nintendo 64',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Cycle de 3 jours : tension permanente + quêtes de PNJ mémorables.",
      "Masques = transformations et nouvelles façons d’explorer.",
      "Le Zelda le plus sombre et le plus expérimental.",
    ],
    ctaLabel: 'Aller à 1996–2005',
    href: 'pages/1996-2005.html'
  },
  tp: {
    title: 'Twilight Princess',
    sub: '2006 • GameCube / Wii',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Tonalité plus mature, Hyrule “réaliste”, donjons monumentaux.",
      "Link loup + sens : exploration et énigmes différentes.",
      "Midona : un duo iconique.",
    ],
    ctaLabel: 'Aller à 2006–2015',
    href: 'pages/2006-2015.html'
  },
  fsa: {
    title: 'Four Swords Adventures',
    sub: '2004 • GameCube',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Zelda coop (jusqu’à 4) : fun en équipe, parfois chaotique.",
      "Esprit 2D modernisé et défis courts, rythmés.",
      "Un vrai ovni multijoueur dans la saga.",
    ],
    ctaLabel: 'Aller à 1996–2005',
    href: 'pages/1996-2005.html'
  },
  ww: {
    title: 'The Wind Waker',
    sub: '2002 • GameCube',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Cel‑shading : style intemporel et super expressif.",
      "Exploration maritime : l’océan comme monde ouvert.",
      "Une des fins les plus marquantes de la licence.",
    ],
    ctaLabel: 'Aller à 1996–2005',
    href: 'pages/1996-2005.html'
  },
  ph: {
    title: 'Phantom Hourglass',
    sub: '2007 • Nintendo DS',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Contrôle tactile et puzzles pensés pour le stylet.",
      "Donjon central revisité au fil du jeu.",
      "Suite directe de Wind Waker sur portable.",
    ],
    ctaLabel: 'Aller à 2006–2015',
    href: 'pages/2006-2015.html'
  },
  st: {
    title: 'Spirit Tracks',
    sub: '2009 • Nintendo DS',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Voyage en train : carte du monde sur rails, mais pleine de secrets.",
      "Zelda joue un vrai rôle (esprit) pour puzzles et narration.",
      "Un Zelda DS très attachant.",
    ],
    ctaLabel: 'Aller à 2006–2015',
    href: 'pages/2006-2015.html'
  },
  botw: {
    title: 'Breath of the Wild',
    sub: '2017 • Switch / Wii U',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Liberté totale : grimpe, physique, météo, solutions multiples.",
      "Narration par souvenirs : tu choisis ton rythme.",
      "Un reboot de la formule, devenu un nouveau standard.",
    ],
    ctaLabel: 'Aller à 2016–2025',
    href: 'pages/2016-2025.html'
  },
  totk: {
    title: 'Tears of the Kingdom',
    sub: '2023 • Switch',
    images: [PLACE_IMG_1, PLACE_IMG_2],
    lines: [
      "Création/assemblage : tu deviens ingénieur d’Hyrule.",
      "Cieux + profondeurs : exploration verticale énorme.",
      "Retour au lore ancien et nouveaux mystères.",
    ],
    ctaLabel: 'Aller à 2016–2025',
    href: 'pages/2016-2025.html'
  },
};

// --- 2) Modale (fenêtre)
const modal = $('[data-modal]');
const modalTitle = $('#modalTitle');
const modalSub = $('#modalSub');
const modalLines = $('#modalLines');
const modalImg1 = $('#modalImg1');
const modalImg2 = $('#modalImg2');
const modalCta = $('#modalCta');

let lastFocus = null;

if (modal) modal.hidden = true;

function setModalContent(item){
  modalTitle.textContent = item.title ?? '';
  modalSub.textContent = item.sub ?? '';

  // lines
  modalLines.innerHTML = '';
  (item.lines ?? []).slice(0, 4).forEach(t => {
    const li = document.createElement('li');
    li.textContent = t;
    modalLines.appendChild(li);
  });

  // images
  const [img1, img2] = item.images ?? [];
  modalImg1.src = img1 || '';
  modalImg1.alt = item.title ? `Illustration 1 — ${item.title}` : 'Illustration 1';
  modalImg2.src = img2 || '';
  modalImg2.alt = item.title ? `Illustration 2 — ${item.title}` : 'Illustration 2';

  // cta
  modalCta.textContent = item.ctaLabel || 'Ouvrir';
  modalCta.href = item.href || '#';
}

function openModal(id){
  const item = ITEMS[id];
  if (!item || !modal) return;

  lastFocus = document.activeElement;
  setModalContent(item);

  modal.hidden = false;
  document.body.classList.add('no-scroll');

  // focus : bouton fermer
  const closeBtn = $('.modal-panel [data-close]');
  closeBtn?.focus();
}

function closeModal(){
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('no-scroll');
  lastFocus?.focus?.();
}

$$('[data-open]').forEach(el => {
  el.addEventListener('click', () => openModal(el.getAttribute('data-open')));
});

$$('[data-close]').forEach(el => el.addEventListener('click', closeModal));
$('.modal-backdrop')?.addEventListener('click', closeModal);

// --- 3) Lightbox (zoom)
const lightbox = $('[data-lightbox]');
const lbImg = $('[data-lb-img]');
const lbStage = $('[data-lb-stage]');
const lbClose = $('[data-lb-close]');
const lbPlus = $('[data-lb-plus]');
const lbMinus = $('[data-lb-minus]');
const lbReset = $('[data-lb-reset]');

if (lightbox) lightbox.hidden = true;

let lbScale = 1;
let lbX = 0;
let lbY = 0;
let lbDragging = false;
let lbStart = {x:0, y:0};

function applyTransform(){
  if (!lbImg) return;
  lbImg.style.transform = `translate(${lbX}px, ${lbY}px) scale(${lbScale})`;
}

function clampScale(v){
  return Math.max(0.6, Math.min(4, v));
}

function openLightbox(src, alt){
  if (!src || !lightbox || !lbImg) return;
  lightbox.hidden = false;
  document.body.classList.add('no-scroll');

  lbImg.src = src;
  lbImg.alt = alt || '';

  lbScale = 1;
  lbX = 0;
  lbY = 0;
  applyTransform();

  lbClose?.focus();
}

function closeLightbox(){
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  if (modal && !modal.hidden) return;
  document.body.classList.remove('no-scroll');
}

function zoomBy(delta, originEvent){
  const prev = lbScale;
  lbScale = clampScale(lbScale + delta);

  // zoom “autour” du pointeur (approx)
  if (originEvent && lbStage){
    const rect = lbStage.getBoundingClientRect();
    const ox = originEvent.clientX - rect.left - rect.width/2;
    const oy = originEvent.clientY - rect.top - rect.height/2;
    const ratio = (lbScale - prev) / prev;
    lbX -= ox * ratio;
    lbY -= oy * ratio;
  }
  applyTransform();
}

lbClose?.addEventListener('click', closeLightbox);
$('.lightbox-backdrop')?.addEventListener('click', closeLightbox);

lbPlus?.addEventListener('click', () => zoomBy(0.2));
lbMinus?.addEventListener('click', () => zoomBy(-0.2));
lbReset?.addEventListener('click', () => { lbScale = 1; lbX = 0; lbY = 0; applyTransform(); });

lbStage?.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.12 : 0.12;
  zoomBy(delta, e);
}, {passive:false});

lbStage?.addEventListener('mousedown', (e) => {
  lbDragging = true;
  lbStart = {x: e.clientX - lbX, y: e.clientY - lbY};
});
window.addEventListener('mousemove', (e) => {
  if (!lbDragging) return;
  lbX = e.clientX - lbStart.x;
  lbY = e.clientY - lbStart.y;
  applyTransform();
});
window.addEventListener('mouseup', () => { lbDragging = false; });

// Dans la modale : clic image => lightbox
$$('.modal [data-zoom]').forEach(btn => {
  btn.addEventListener('click', () => {
    const img = btn.querySelector('img');
    openLightbox(img?.src, img?.alt);
  });
});

// Esc : ferme d'abord le zoom, sinon la modale
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (lightbox && !lightbox.hidden) closeLightbox();
  else closeModal();
});

// --- 4) Sécurité : si un id est inconnu

// Zoom aussi sur l’image “hero” (aperçu en haut de page)
const heroImg = document.querySelector('[data-hero-img]');
if (heroImg) {
  heroImg.style.cursor = 'zoom-in';
  heroImg.addEventListener('click', () => openLightbox(heroImg.src, heroImg.alt));
}

window.__openZeldaItem = openModal;


// --- Extra: zoom direct sur images (ex: carte de la hero)
document.addEventListener('click', (e) => {
  const z = e.target.closest('[data-zoomable]');
  if (!z) return;
  const im = z.tagName.toLowerCase() === 'img' ? z : z.querySelector('img');
  if (!im) return;
  try { openLightbox(im.src, im.alt || ''); } catch {}
});
