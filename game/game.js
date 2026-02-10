/* =========================================================
   Chroniques du Royaume Ancien — v3 (complete)
   - 8 scenes (3 choices each)
   - mini-games: runes, timing, memo, labyrinth, sequence
   - boss QTE 3 phases
   - sound toggle
   - tribute timeline unlocks
   - animated transitions + typewriter
   - souvenir card export (PNG)
   - localStorage save/resume/reset
========================================================= */

"use strict";

/* ---------------------------
   Config
--------------------------- */
const SAVE_KEY = "hyrule40_game_save_v3";
const ANNIV_TARGET_ISO = "2026-02-21T00:00:00"; // <- change this date if needed

/* ---------------------------
   DOM
--------------------------- */
const screens = {
  home: document.getElementById("screen-home"),
  tribute: document.getElementById("screen-tribute"),
  anniv: document.getElementById("screen-anniv"),
  game: document.getElementById("screen-game"),
  end: document.getElementById("screen-end"),
};

const btnStart = document.getElementById("btnStart");
const btnContinue = document.getElementById("btnContinue");
const btnLaunchFromAnniv = document.getElementById("btnLaunchFromAnniv");
const btnResume = document.getElementById("btnResume");
const btnReset = document.getElementById("btnReset");
const toggleSoundBtn = document.getElementById("toggleSound");

const playerNameEl = document.getElementById("playerName");
const difficultyEl = document.getElementById("difficulty");

const hudHearts = document.getElementById("hudHearts");
const hudRubies = document.getElementById("hudRubies");
const hudInv = document.getElementById("hudInv");
const hudProgressBar = document.getElementById("hudProgressBar");

const scenePanel = document.getElementById("scenePanel");
const sceneMeta = document.getElementById("sceneMeta");
const sceneBadges = document.getElementById("sceneBadges");
const sceneTitle = document.getElementById("sceneTitle");
const sceneText = document.getElementById("sceneText");
const choicesBox = document.getElementById("choices");
const minigameHost = document.getElementById("minigameHost");
const sceneFoot = document.getElementById("sceneFoot");

const tributeTimelineEl = document.getElementById("tributeTimeline");
const countdownEl = document.getElementById("countdown");

const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");
const endSummary = document.getElementById("endSummary");
const endJournal = document.getElementById("endJournal");
const btnSouvenir = document.getElementById("btnSouvenir");
const btnReplay = document.getElementById("btnReplay");

/* ---------------------------
   Audio (beeps)
--------------------------- */
let soundOn = true;
let audioCtx = null;

function ensureAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function beep(freq=520, dur=0.08, type="sine", gain=0.05){
  if(!soundOn) return;
  ensureAudio();
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

/* ---------------------------
   Helpers
--------------------------- */
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function randInt(a, b){ return Math.floor(Math.random() * (b - a + 1)) + a; }
function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function showScreen(name){
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  // update resume button
  btnResume.disabled = (name === "game" ? false : !hasSave());

  // update active tab (header menu)
  document.querySelectorAll(".tab").forEach((b) => {
    const active = b.getAttribute("data-screen") === name;
    b.classList.toggle("is-active", active);
  });
}

function hasSave(){
  return !!localStorage.getItem(SAVE_KEY);
}

function save(){
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  btnContinue.disabled = false;
  btnResume.disabled = false;
}

function load(){
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function resetSave(){
  localStorage.removeItem(SAVE_KEY);
  btnResume.disabled = true;
  btnContinue.disabled = true;
}

/* ---------------------------
   Game state
--------------------------- */
function defaultState(){
  return {
    name: "Héros",
    difficulty: "normal",
    maxHearts: 4,
    hearts: 4,
    rubies: 0,
    inventory: [],
    maxInv: 6,

    step: 0,             // 0..7 (8 scenes)
    ending: null,        // "HERO" | "SAGE" | "EXPLORER"

    effects: {
      shield: 0,         // absorbs damage
      insight: 0,        // hint tokens
    },

    badges: {
      RUNE:false,
      MEMO:false,
      LAB:false,
      TIMING:false,
      SEQ:false,
      BOSS:false,
      COLLECTOR:false,
      MERCY:false,
      BRAVE:false,
    },

    journal: [],         // chronological log entries
    tributeUnlock: 0,    // timeline unlock index
  };
}

let state = defaultState();

/* ---------------------------
   Inventory & log
--------------------------- */
function hasItem(name){ return state.inventory.includes(name); }

function addItem(name){
  if(hasItem(name)) return;
  if(state.inventory.length >= state.maxInv){
    state.inventory.shift();
  }
  state.inventory.push(name);

  // item effects
  if(name === "Amulette") state.effects.shield += 1;
  if(name === "Lampe") state.effects.insight += 1;

  if(state.inventory.length >= 5) state.badges.COLLECTOR = true;

  addEvent("Objet", `Tu obtiens : ${name}`, "🎒");
  beep(820, 0.07, "triangle", 0.05);
  updateHUD();
}

function addRubies(n){
  state.rubies = Math.max(0, state.rubies + n);
  addEvent("Rubis", `${n >= 0 ? "+" : ""}${n} rubis`, "💎");
  beep(n >= 0 ? 760 : 210, 0.06, "sine", 0.05);
  updateHUD();
}

function damage(n){
  if(state.effects.shield > 0){
    state.effects.shield -= 1;
    addEvent("Protection", "L’Amulette absorbe le choc. (0 dégât)", "🛡️");
    beep(920, 0.06, "triangle", 0.05);
    updateHUD();
    return;
  }
  state.hearts = clamp(state.hearts - n, 0, state.maxHearts);
  addEvent("Blessure", `-${n} cœur(s)`, "💔");
  beep(180, 0.10, "square", 0.06);
  updateHUD();

  if(state.hearts <= 0){
    state.ending = "EXPLORER";
    addEvent("Chute", "À bout de forces, tu quittes le royaume… vivant, mais changé.", "🕯️");
    endGame();
  }
}

function heal(n){
  state.hearts = clamp(state.hearts + n, 0, state.maxHearts);
  addEvent("Soin", `+${n} cœur(s)`, "✨");
  beep(640, 0.07, "sine", 0.05);
  updateHUD();
}

function addEvent(title, text, icon="•"){
  const ts = new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  state.journal.push({ ts, title, text, icon });
}

/* ---------------------------
   HUD
--------------------------- */
function updateHUD(){
  hudHearts.textContent = "❤️".repeat(Math.max(1, state.hearts));
  hudRubies.textContent = `💎 ${state.rubies}`;
  hudInv.textContent = `🎒 ${state.inventory.length ? state.inventory.join(", ") : "vide"}`;

  const pct = Math.round((state.step / 7) * 100);
  hudProgressBar.style.width = `${pct}%`;

  // badges row (earned only)
  const earned = Object.entries(state.badges).filter(([,v])=>v).map(([k])=>k);
  sceneBadges.innerHTML = "";
  earned.slice(0, 6).forEach(k=>{
    const b = document.createElement("div");
    b.className = "badge";
    b.innerHTML = `<b>★</b> ${k}`;
    sceneBadges.appendChild(b);
  });
}

/* ---------------------------
   Typewriter
--------------------------- */
function typeText(el, text){
  el.classList.add("typewriter");
  el.textContent = "";
  let i = 0;
  let stopped = false;

  const tick = () => {
    if(stopped) return;
    el.textContent = text.slice(0, i++);
    if(i <= text.length){
      requestAnimationFrame(tick);
    }else{
      el.classList.remove("typewriter");
    }
  };
  tick();

  const skip = () => {
    stopped = true;
    el.textContent = text;
    el.classList.remove("typewriter");
    el.removeEventListener("click", skip);
  };
  el.addEventListener("click", skip);
}

/* ---------------------------
   Tribute timeline (10 items)
--------------------------- */
const tributeItems = [
  { i:"🗺️", d:"~1986", t:"La graine", x:"Une aventure naît dans les bois. Le joueur apprend en explorant." },
  { i:"🧩", d:"~1991", t:"La formule", x:"Donjons, objets, clés… la structure devient une légende." },
  { i:"⏳", d:"~1998", t:"Le temps", x:"Une mécanique transforme la narration : conséquences et mémoire." },
  { i:"🎭", d:"~2000", t:"Le masque", x:"Le monde devient étrange : émotions, cycles, tension." },
  { i:"🌊", d:"~2002", t:"L’océan", x:"L’horizon s’ouvre : l’aventure se réinvente visuellement." },
  { i:"🐺", d:"~2006", t:"L’ombre", x:"Une époque plus sombre : intensité, créatures, mystère." },
  { i:"☁️", d:"~2011", t:"Les origines", x:"Le mythe se raconte depuis la source : un commencement." },
  { i:"🧠", d:"~2013", t:"La ruse", x:"Liberté d’ordre, solutions multiples : le joueur prend le contrôle." },
  { i:"🏔️", d:"~2017", t:"La liberté", x:"Un monde-bac à sable : créativité, physique, émergence." },
  { i:"👑", d:"~2026", t:"La décennie 5", x:"40 ans : la légende devient un patrimoine de joueurs." },
];

function renderTributeTimeline(){
  tributeTimelineEl.innerHTML = "";
  tributeItems.forEach((it, idx)=>{
    const locked = idx > state.tributeUnlock;
    const div = document.createElement("div");
    div.className = "tlItem";
    div.style.opacity = locked ? ".55" : "1";

    div.innerHTML = `
      <div class="tlRow">
        <span>${locked ? "🔒" : it.i} ${it.d}</span>
        <span>${locked ? "Verrouillé" : "Hommage"}</span>
      </div>
      <div class="tlText">
        <strong>${locked ? "Découvre la suite…" : it.t}</strong><br>
        ${locked ? "Progresse dans l’aventure pour déverrouiller cet extrait." : it.x}
      </div>
    `;

    div.addEventListener("click", ()=>{
      if(locked) { beep(220,0.06,"square",0.05); return; }
      div.classList.toggle("open");
      beep(680,0.05,"sine",0.04);
    });

    tributeTimelineEl.appendChild(div);
  });
}

/* ---------------------------
   Scenes (8 scenes, 3 choices each)
   Each choice can:
   - change rubies/hearts/items
   - start a mini-game
   - jump to next step
--------------------------- */
const scenes = [
  // 0
  {
    id:"awakening",
    title:"L’Éveil",
    text:"Tu ouvres les yeux dans une clairière froide. Ton sac vibre doucement : quelque chose t’appelle…",
    foot:"Choisis ta route. Rien n’est gratuit dans un royaume ancien.",
    choices:[
      {
        label:"[1] Inspecter le sac (prudence)",
        effect: ()=>{ addItem("Lampe"); state.badges.MERCY = true; nextStep(); }
      },
      {
        label:"[2] Suivre une lueur au nord (curiosité)",
        effect: ()=>{ addRubies(1); nextStep(); }
      },
      {
        label:"[3] Méditer quelques secondes (calme)",
        effect: ()=>{ heal(1); nextStep(); }
      },
    ]
  },

  // 1
  {
    id:"fork",
    title:"Le Sentier aux Trois Voies",
    text:"Trois passages s’offrent à toi : un sous-bois dense, une arche de pierre, et une passerelle instable.",
    foot:"(Astuce) Les objets peuvent changer l’issue de certains défis.",
    choices:[
      {
        label:"[1] Sous-bois (tenter de trouver des ressources)",
        effect: ()=>{ addRubies(2); nextStep(); }
      },
      {
        label:"[2] Arche de pierre (approche discrète)",
        effect: ()=>{ addItem("Amulette"); nextStep(); }
      },
      {
        label:"[3] Passerelle (risque de chute)",
        effect: ()=>{ damage(1); addRubies(1); nextStep(); }
      },
    ]
  },

  // 2 (Runes minigame hook)
  {
    id:"runes",
    title:"Le Sanctuaire des Runes",
    text:"Une stèle gravée scintille. Les symboles semblent répondre à ta présence. Il faut activer la séquence correcte.",
    foot:"Mini-jeu : Runes (clique la séquence).",
    choices:[
      {
        label:"[1] Activer les runes (défi)",
        effect: ()=> startMiniRunes({ onWin(){
          state.badges.RUNE = true;
          addRubies(3);
          addItem("Sceau");
          unlockTribute();
          nextStep();
        }, onFail(){
          damage(1);
          addEvent("Rune", "La stèle se tait. Tu avances malgré l’échec.", "🗿");
          nextStep();
        }})
      },
      {
        label:"[2] Étudier les gravures (indice)",
        effect: ()=>{ state.effects.insight += 1; addEvent("Indice", "+1 éclair de compréhension.", "💡"); unlockTribute(); nextStep(); }
      },
      {
        label:"[3] Contourner (rapidité)",
        effect: ()=>{ addRubies(1); nextStep(); }
      },
    ]
  },

  // 3 (Timing minigame hook)
  {
    id:"river",
    title:"Le Passage du Courant",
    text:"Un courant barre la route. Un mécanisme de pont bouge par à-coups : il faut agir au bon moment.",
    foot:"Mini-jeu : Timing (clic ou Espace au bon moment).",
    choices:[
      {
        label:"[1] Synchroniser le mécanisme (défi)",
        effect: ()=> startMiniTiming({ onWin(){
          state.badges.TIMING = true;
          addRubies(3);
          addEvent("Passage", "Le pont s’enclenche. Tu traverses !", "🌊");
          unlockTribute();
          nextStep();
        }, onFail(){
          damage(1);
          addEvent("Passage", "Tu glisses, mais tu te rattrapes au dernier moment.", "🌧️");
          nextStep();
        }})
      },
      {
        label:"[2] Utiliser la Lampe (si tu l’as) pour repérer l’instant",
        effect: ()=>{ 
          if(hasItem("Lampe") || state.effects.insight>0){
            if(state.effects.insight>0) state.effects.insight--;
            addEvent("Lampe", "Tu repères la cadence. Passage réussi.", "🏮");
            addRubies(2);
            unlockTribute();
            nextStep();
          } else {
            addEvent("Lampe", "Tu n’as rien pour analyser le rythme…", "🏮");
            damage(1);
            nextStep();
          }
        }
      },
      {
        label:"[3] Prendre un détour (plus long, plus sûr)",
        effect: ()=>{ addEvent("Détour", "Tu perds du temps, mais tu restes entier.", "🧭"); addRubies(1); nextStep(); }
      },
    ]
  },

  // 4 (Memo minigame hook)
  {
    id:"ruins",
    title:"Les Ruines de Mémoire",
    text:"Des dalles portent des motifs par paires. Une porte s’ouvre seulement si tu te souviens…",
    foot:"Mini-jeu : Mémo (3 paires).",
    choices:[
      {
        label:"[1] Tenter le Mémo (défi)",
        effect: ()=> startMiniMemo({ onWin(){
          state.badges.MEMO = true;
          addItem("Carte");
          addRubies(3);
          unlockTribute();
          nextStep();
        }, onFail(){
          damage(1);
          addEvent("Ruines", "La porte cède, mais le prix se lit sur tes épaules.", "🏚️");
          nextStep();
        }})
      },
      {
        label:"[2] Forcer l’ouverture (brutal)",
        effect: ()=>{ state.badges.BRAVE = true; damage(1); addRubies(2); addEvent("Ruines", "Tu forces… ça passe.", "⚒️"); nextStep(); }
      },
      {
        label:"[3] Marchander avec le silence (humble)",
        effect: ()=>{ heal(1); addEvent("Ruines", "Tu attends. La porte s’ouvre comme si elle te jugeait digne.", "🕊️"); nextStep(); }
      },
    ]
  },

  // 5 (Labyrinth minigame hook)
  {
    id:"lab",
    title:"Le Labyrinthe des Pierres",
    text:"Une salle quadrillée s’anime. Les murs changent. Trouve la sortie avant que le lieu ne se referme.",
    foot:"Mini-jeu : Labyrinthe (flèches clavier ou clic).",
    choices:[
      {
        label:"[1] Traverser le labyrinthe (défi)",
        effect: ()=> startMiniLab({ onWin(){
          state.badges.LAB = true;
          addRubies(4);
          addItem("Talisman");
          unlockTribute();
          nextStep();
        }, onFail(){
          damage(1);
          addEvent("Labyrinthe", "Tu trouves une issue… de justesse.", "🧱");
          nextStep();
        }})
      },
      {
        label:"[2] Chercher une faille dans les murs (ruse)",
        effect: ()=>{ addRubies(2); addEvent("Labyrinthe", "Tu lis l’architecture et coupes au plus court.", "🧠"); unlockTribute(); nextStep(); }
      },
      {
        label:"[3] Revenir en arrière (repos)",
        effect: ()=>{ heal(1); addEvent("Labyrinthe", "Tu reprends ton souffle. La peur diminue.", "🌬️"); nextStep(); }
      },
    ]
  },

  // 6 (Sequence minigame hook)
  {
    id:"harp",
    title:"Le Chant des Quatre Notes",
    text:"Un pupitre ancien attend une séquence de quatre notes. Rien d’officiel ici : juste une mélodie oubliée.",
    foot:"Mini-jeu : Séquence (reproduire 4 notes).",
    choices:[
      {
        label:"[1] Jouer la séquence (défi)",
        effect: ()=> startMiniSequence({ onWin(){
          state.badges.SEQ = true;
          addRubies(3);
          addEvent("Chant", "La salle s’illumine : le chemin final s’ouvre.", "🎼");
          unlockTribute();
          nextStep();
        }, onFail(){
          damage(1);
          addEvent("Chant", "La note dérape… mais tu peux encore continuer.", "🎶");
          nextStep();
        }})
      },
      {
        label:"[2] Utiliser le Sceau (si tu l’as) pour stabiliser l’écho",
        effect: ()=>{ 
          if(hasItem("Sceau")){
            addEvent("Sceau", "Le Sceau calme la résonance. Succès.", "🗿");
            addRubies(2);
            unlockTribute();
            nextStep();
          } else {
            addEvent("Sceau", "Tu n’as pas de Sceau…", "🗿");
            damage(1);
            nextStep();
          }
        }
      },
      {
        label:"[3] Ignorer la musique (aller au plus vite)",
        effect: ()=>{ addRubies(1); addEvent("Chant", "Tu avances sans regarder en arrière.", "🧭"); nextStep(); }
      },
    ]
  },

  // 7 (Boss)
  {
    id:"boss",
    title:"Le Gardien de la Porte",
    text:"Une silhouette d’obsidienne se dresse. Elle n’a pas de nom, mais elle a une mission : t’arrêter.",
    foot:"Boss : 3 phases QTE (Espace ou clic au bon moment).",
    choices:[
      {
        label:"[1] Affronter le Gardien (boss QTE)",
        effect: ()=> startBossFight({ onWin(){
          state.badges.BOSS = true;
          addRubies(5);
          addEvent("Boss", "Tu triomphes : le royaume reconnaît ta volonté.", "🧙");
          decideEndingAfterBoss();
          endGame();
        }, onFail(){
          damage(1);
          addEvent("Boss", "Le Gardien te repousse… mais tu t’échappes vivant.", "🕯️");
          decideEndingAfterBoss(true);
          endGame();
        }})
      },
      {
        label:"[2] Proposer un pacte (diplomatie)",
        effect: ()=>{ 
          state.badges.MERCY = true;
          addEvent("Pacte", "La force recule devant la sagesse… parfois.", "🕊️");
          addRubies(2);
          // pas de boss si pacte
          decideEndingAfterBoss(true);
          endGame();
        }
      },
      {
        label:"[3] Détourner l’attention (tactique)",
        effect: ()=>{ 
          state.badges.BRAVE = true;
          addEvent("Tactique", "Tu exploits une faille et franchis la porte.", "🧠");
          addRubies(2);
          decideEndingAfterBoss(false, true);
          endGame();
        }
      },
    ]
  },
];

function unlockTribute(){
  state.tributeUnlock = Math.min(tributeItems.length - 1, Math.max(state.tributeUnlock, state.step + 1));
}

/* ---------------------------
   Endings (enriched)
--------------------------- */
function decideEndingAfterBoss(escaped=false, tactical=false){
  // Weighted ending:
  // HERO: high rubies or boss win
  // SAGE: rune/sequence success + mercy
  // EXPLORER: otherwise
  const scoreHero = (state.rubies >= 12 ? 2 : 0) + (state.badges.BOSS ? 3 : 0) + (state.badges.BRAVE ? 1 : 0);
  const scoreSage = (state.badges.RUNE ? 2 : 0) + (state.badges.SEQ ? 2 : 0) + (state.badges.MERCY ? 1 : 0) + (hasItem("Lampe") ? 1 : 0);
  const scoreExplorer = (escaped ? 2 : 0) + (tactical ? 2 : 0) + (state.inventory.length >= 3 ? 1 : 0);

  if(scoreHero >= scoreSage && scoreHero >= scoreExplorer) state.ending = "HERO";
  else if(scoreSage >= scoreHero && scoreSage >= scoreExplorer) state.ending = "SAGE";
  else state.ending = "EXPLORER";
}

/* ---------------------------
   Scene rendering
--------------------------- */
let activeChoiceButtons = [];
let minigameActive = false;

function renderScene(){
  minigameActive = false;
  minigameHost.innerHTML = "";
  choicesBox.innerHTML = "";
  activeChoiceButtons = [];

  const s = scenes[state.step];
  if(!s) { endGame(); return; }

  // transition
  scenePanel.classList.remove("sceneEnter");
  void scenePanel.offsetWidth;
  scenePanel.classList.add("sceneEnter");

  sceneMeta.textContent = `${state.name} · ${labelDifficulty(state.difficulty)} · Étape ${state.step+1}/8`;
  sceneTitle.textContent = s.title;
  typeText(sceneText, s.text);
  sceneFoot.textContent = s.foot || "";

  // 3 choices always
  s.choices.forEach((c, idx)=>{
    const b = document.createElement("button");
    b.className = "choiceBtn";
    b.type = "button";
    b.textContent = c.label;
    b.addEventListener("click", ()=>{
      if(minigameActive) return;
      beep(620 + idx*40, 0.05, "sine", 0.05);
      c.effect();
      save();
      updateHUD();
      renderTributeTimeline();
    });
    choicesBox.appendChild(b);
    activeChoiceButtons.push(b);
  });

  // unlock tribute progressively too
  state.tributeUnlock = Math.max(state.tributeUnlock, state.step);
  renderTributeTimeline();
  updateHUD();
  save();
}

function labelDifficulty(d){
  if(d==="easy") return "Facile";
  if(d==="hard") return "Héroïque";
  return "Normal";
}

function nextStep(){
  state.step = clamp(state.step + 1, 0, 7);
  unlockTribute();
  renderScene();
}

/* ---------------------------
   Keyboard controls
   - 1/2/3 selects choices
   - Space for some minigames (handled there)
--------------------------- */
document.addEventListener("keydown", (e)=>{
  if(!screens.game.classList.contains("active")) return;
  if(minigameActive) return;

  if(e.key === "1" && activeChoiceButtons[0]) activeChoiceButtons[0].click();
  if(e.key === "2" && activeChoiceButtons[1]) activeChoiceButtons[1].click();
  if(e.key === "3" && activeChoiceButtons[2]) activeChoiceButtons[2].click();
});

/* ---------------------------
   Mini-games
--------------------------- */

/* Runes: click ordered sequence of 4 */
function startMiniRunes({onWin, onFail}){
  minigameActive = true;
  const runes = ["ᚨ","ᚱ","ᛟ","ᚺ","ᛉ","ᚾ"];
  const seq = [];
  while(seq.length<4){
    const r = pick(runes);
    if(!seq.includes(r)) seq.push(r);
  }
  let idx = 0;
  let mistakes = 0;

  minigameHost.innerHTML = `
    <h3 class="mgTitle">Runes anciennes</h3>
    <div class="mgBox">
      <div class="mgMsg">Clique dans l’ordre : <b>${seq.join(" ")}</b></div>
      <div class="mgRow" id="runeRow"></div>
      <div class="mgMsg" id="runeMsg"></div>
    </div>
  `;

  const row = document.getElementById("runeRow");
  const msg = document.getElementById("runeMsg");

  const pool = [...seq].sort(()=>Math.random()-0.5);
  pool.forEach(r=>{
    const b = document.createElement("button");
    b.className = "mgBtn";
    b.textContent = r;
    b.onclick = ()=>{
      beep(700,0.05,"triangle",0.05);
      if(r === seq[idx]){
        idx++;
        msg.textContent = `✅ ${idx}/4`;
        if(idx === 4){
          msg.textContent = "✨ Séquence complète !";
          minigameActive = false;
          setTimeout(onWin, 350);
        }
      }else{
        mistakes++;
        msg.textContent = `❌ Mauvaise rune (${mistakes}/2)`;
        beep(210,0.07,"square",0.06);
        if(mistakes >= 2){
          minigameActive = false;
          setTimeout(onFail, 300);
        }
      }
    };
    row.appendChild(b);
  });
}

/* Timing: moving dot, press/click in zone */
function startMiniTiming({onWin, onFail}){
  minigameActive = true;

  minigameHost.innerHTML = `
    <h3 class="mgTitle">Synchronisation</h3>
    <div class="mgBox">
      <div class="mgMsg">Appuie sur <b>Espace</b> ou clique quand le point est dans la zone dorée.</div>
      <div class="timingTrack" id="track">
        <div class="timingZone" id="zone"></div>
        <div class="timingDot" id="dot"></div>
      </div>
      <div class="mgMsg" id="tmsg">—</div>
      <div class="mgRow"><button class="mgBtn" id="tbtn">Tenter</button></div>
    </div>
  `;

  const dot = document.getElementById("dot");
  const msg = document.getElementById("tmsg");
  const btn = document.getElementById("tbtn");

  let x = 0;
  let dir = 1;
  let running = true;
  const speed = (state.difficulty === "hard") ? 2.8 : (state.difficulty === "easy" ? 1.8 : 2.2);

  const zoneStart = 55;
  const zoneEnd = 73;

  function tick(){
    if(!running) return;
    x += dir * speed;
    if(x > 100){ x = 100; dir = -1; }
    if(x < 0){ x = 0; dir = 1; }
    dot.style.left = `${x}%`;
    requestAnimationFrame(tick);
  }
  tick();

  function attempt(){
    beep(520,0.05,"sine",0.05);
    running = false;
    const ok = x >= zoneStart && x <= zoneEnd;
    msg.textContent = ok ? "✅ Parfait !" : "❌ Trop tôt / trop tard…";
    setTimeout(()=>{
      minigameActive = false;
      ok ? onWin() : onFail();
    }, 450);
  }

  btn.onclick = attempt;

  function onKey(e){
    if(e.code === "Space"){
      e.preventDefault();
      document.removeEventListener("keydown", onKey);
      attempt();
    }
  }
  document.addEventListener("keydown", onKey, {once:true});

  // click on track triggers attempt too
  document.getElementById("track").addEventListener("click", ()=>{
    document.removeEventListener("keydown", onKey);
    attempt();
  }, {once:true});
}

/* Memo: 3 pairs, 6 cards */
function startMiniMemo({onWin, onFail}){
  minigameActive = true;

  const base = ["🌿","🔥","💎"];
  const cards = [...base, ...base].sort(()=>Math.random()-0.5);

  let opened = [];
  let found = 0;
  let tries = 0;

  minigameHost.innerHTML = `
    <h3 class="mgTitle">Mémoire ancienne</h3>
    <div class="mgBox">
      <div class="mgMsg">Trouve les 3 paires. (Erreur max : 4)</div>
      <div class="memoGrid" id="memoGrid"></div>
      <div class="mgMsg" id="mmsg">—</div>
    </div>
  `;

  const grid = document.getElementById("memoGrid");
  const msg = document.getElementById("mmsg");

  cards.forEach((sym, idx)=>{
    const b = document.createElement("button");
    b.className = "cardBtn";
    b.textContent = "❔";
    b.setAttribute("data-sym", sym);
    b.setAttribute("aria-label", "Carte");
    b.onclick = ()=>{
      if(b.classList.contains("open")) return;
      if(opened.length === 2) return;
      beep(620,0.05,"sine",0.05);
      b.classList.add("open");
      b.textContent = sym;
      opened.push(b);

      if(opened.length === 2){
        tries++;
        const [a, c] = opened;
        const ok = a.dataset.sym === c.dataset.sym;
        if(ok){
          found++;
          opened = [];
          msg.textContent = `✅ Paire trouvée (${found}/3)`;
          if(found === 3){
            minigameActive = false;
            setTimeout(onWin, 350);
          }
        } else {
          msg.textContent = `❌ Mauvaise paire (${tries}/4)`;
          beep(200,0.06,"square",0.06);
          setTimeout(()=>{
            opened.forEach(x=>{
              x.classList.remove("open");
              x.textContent = "❔";
            });
            opened = [];
            if(tries >= 4){
              minigameActive = false;
              setTimeout(onFail, 300);
            }
          }, 520);
        }
      }
    };
    grid.appendChild(b);
  });
}

/* Labyrinth: 9x9 grid with walls, arrow keys to goal */
function startMiniLab({onWin, onFail}){
  minigameActive = true;

  // A small fixed maze (0 empty, 1 wall)
  const maze = [
    "000011000",
    "110001010",
    "000001010",
    "011111010",
    "010000000",
    "010111110",
    "010000010",
    "011110010",
    "000000000",
  ].map(row => row.split("").map(ch => ch==="1"));

  let px = 0, py = 0;
  let gx = 8, gy = 8;
  let moves = 0;
  const maxMoves = state.difficulty === "hard" ? 22 : (state.difficulty === "easy" ? 34 : 28);

  minigameHost.innerHTML = `
    <h3 class="mgTitle">Labyrinthe</h3>
    <div class="mgBox">
      <div class="mgMsg">Atteins la case dorée. Flèches clavier (ou clique une case voisine). Moves: <b id="mv">0</b> / ${maxMoves}</div>
      <div class="lab" id="lab"></div>
      <div class="mgMsg" id="lmsg">—</div>
    </div>
  `;

  const lab = document.getElementById("lab");
  const mv = document.getElementById("mv");
  const msg = document.getElementById("lmsg");

  function draw(){
    lab.innerHTML = "";
    for(let y=0;y<9;y++){
      for(let x=0;x<9;x++){
        const cell = document.createElement("div");
        cell.className = "cell";
        if(maze[y][x]) cell.classList.add("wall");
        if(x===gx && y===gy) cell.classList.add("goal");
        if(x===px && y===py) cell.classList.add("player");

        cell.addEventListener("click", ()=>{
          // allow click move if adjacent and not wall
          const dx = Math.abs(x-px);
          const dy = Math.abs(y-py);
          if(dx+dy !== 1) return;
          moveTo(x,y);
        });

        lab.appendChild(cell);
      }
    }
  }

  function moveTo(nx, ny){
    if(maze[ny][nx]) { beep(210,0.05,"square",0.06); return; }
    px = nx; py = ny;
    moves++;
    mv.textContent = String(moves);
    beep(520,0.03,"sine",0.04);
    draw();

    if(px===gx && py===gy){
      msg.textContent = "✅ Sortie atteinte !";
      cleanup();
      minigameActive = false;
      setTimeout(onWin, 350);
      return;
    }
    if(moves >= maxMoves){
      msg.textContent = "❌ Trop tard…";
      cleanup();
      minigameActive = false;
      setTimeout(onFail, 300);
    }
  }

  function onKey(e){
    const k = e.key;
    let nx = px, ny = py;
    if(k==="ArrowUp") ny--;
    else if(k==="ArrowDown") ny++;
    else if(k==="ArrowLeft") nx--;
    else if(k==="ArrowRight") nx++;
    else return;

    e.preventDefault();
    if(nx<0||nx>8||ny<0||ny>8) return;
    moveTo(nx, ny);
  }

  function cleanup(){
    document.removeEventListener("keydown", onKey);
  }

  document.addEventListener("keydown", onKey);
  draw();
}

/* Sequence: show 4-note pattern, then user repeats */
function startMiniSequence({onWin, onFail}){
  minigameActive = true;

  const notes = ["Ⅰ","Ⅱ","Ⅲ","Ⅳ"];
  const pattern = Array.from({length:4}, ()=> pick(notes));
  let phase = "show";
  let input = [];

  minigameHost.innerHTML = `
    <h3 class="mgTitle">Séquence</h3>
    <div class="mgBox">
      <div class="mgMsg" id="smsg">Observe la séquence…</div>
      <div class="seqRow" id="seqRow"></div>
      <div class="mgRow" style="margin-top:10px;">
        <button class="mgBtn" id="sStart">Commencer</button>
      </div>
    </div>
  `;

  const row = document.getElementById("seqRow");
  const msg = document.getElementById("smsg");
  const startBtn = document.getElementById("sStart");

  notes.forEach(n=>{
    const b = document.createElement("button");
    b.className = "note";
    b.textContent = n;
    b.disabled = true;
    b.onclick = ()=>{
      if(phase !== "play") return;
      input.push(n);
      beep(520 + notes.indexOf(n)*120, 0.06, "sine", 0.05);
      msg.textContent = `Entrée : ${input.length}/4`;

      if(input.length === 4){
        const ok = input.join("") === pattern.join("");
        phase = "done";
        msg.textContent = ok ? "✅ Parfait !" : `❌ Raté… (attendu: ${pattern.join(" ")})`;
        minigameActive = false;
        setTimeout(ok ? onWin : onFail, 480);
      }
    };
    row.appendChild(b);
  });

  function flashPattern(){
    let i=0;
    const buttons = Array.from(row.querySelectorAll("button"));
    const interval = setInterval(()=>{
      // clear
      buttons.forEach(x=> x.style.borderColor = "rgba(255,255,255,.12)");
      const note = pattern[i];
      const idx = notes.indexOf(note);
      buttons[idx].style.borderColor = "rgba(242,201,76,.55)";
      beep(420 + idx*110, 0.05, "triangle", 0.05);
      i++;
      if(i>=pattern.length){
        clearInterval(interval);
        buttons.forEach(x=> x.style.borderColor = "rgba(255,255,255,.12)");
        phase = "play";
        input = [];
        msg.textContent = "À toi : reproduis la séquence.";
        buttons.forEach(x=> x.disabled = false);
      }
    }, 520);
  }

  startBtn.onclick = ()=>{
    startBtn.disabled = true;
    flashPattern();
  };
}

/* Boss: 3 phases QTE (press space/click when ring hits sweet spot) */
function startBossFight({onWin, onFail}){
  minigameActive = true;

  const phases = 3;
  let phase = 1;
  let failures = 0;
  const maxFailures = state.difficulty === "hard" ? 1 : 2;

  minigameHost.innerHTML = `
    <h3 class="mgTitle">Boss — Phase <span id="p">1</span>/3</h3>
    <div class="mgBox">
      <div class="mgMsg">Appuie sur <b>Espace</b> ou clique quand le cercle est proche du seuil doré.</div>
      <div class="qteWrap">
        <div class="qteRing" id="ring"></div>
        <div class="qteCore"></div>
      </div>
      <div class="mgMsg" id="bmsg">—</div>
      <div class="mgRow"><button class="mgBtn" id="bTry">Tenter</button></div>
    </div>
  `;

  // minimal qte styling via JS inline
  const style = document.createElement("style");
  style.textContent = `
    .qteWrap{ position:relative; width:180px; height:180px; margin:10px auto; }
    .qteCore{ position:absolute; inset:50%; width:18px; height:18px; transform:translate(-50%,-50%);
      border-radius:999px; background:rgba(242,201,76,.9); box-shadow:0 0 18px rgba(242,201,76,.35);}
    .qteRing{ position:absolute; inset:50%; transform:translate(-50%,-50%);
      width:20px; height:20px; border-radius:999px;
      border:3px solid rgba(74,144,226,.95); box-shadow:0 0 18px rgba(74,144,226,.35);}
  `;
  minigameHost.appendChild(style);

  const ring = document.getElementById("ring");
  const pEl = document.getElementById("p");
  const msg = document.getElementById("bmsg");
  const btn = document.getElementById("bTry");

  let size = 20;
  let running = false;
  let raf = null;

  // sweet spot: size between 64 and 92
  function loop(){
    if(!running) return;
    size += (state.difficulty === "hard") ? 3.6 : (state.difficulty === "easy" ? 2.4 : 3.0);
    ring.style.width = ring.style.height = size + "px";
    if(size > 160){
      // miss by timeout
      running = false;
      cancelAnimationFrame(raf);
      failPhase();
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  function attempt(){
    if(!running) return;
    running = false;
    cancelAnimationFrame(raf);

    const ok = size >= 64 && size <= 92;
    if(ok){
      beep(860,0.07,"triangle",0.05);
      msg.textContent = "✅ Impact !";
      phase++;
      if(phase > phases){
        minigameActive = false;
        setTimeout(onWin, 420);
      } else {
        // reset for next phase
        setTimeout(()=>{
          pEl.textContent = String(phase);
          msg.textContent = "Phase suivante…";
          resetPhase();
        }, 520);
      }
    } else {
      beep(210,0.08,"square",0.06);
      failPhase();
    }
  }

  function failPhase(){
    failures++;
    damage(1);
    msg.textContent = `❌ Raté… (${failures}/${maxFailures})`;
    if(failures > maxFailures){
      minigameActive = false;
      setTimeout(onFail, 480);
      return;
    }
    setTimeout(resetPhase, 520);
  }

  function resetPhase(){
    size = 20;
    ring.style.width = ring.style.height = size + "px";
    running = true;
    loop();
  }

  btn.onclick = ()=>{
    if(!running){
      msg.textContent = "Concentre-toi…";
      resetPhase();
      return;
    }
    attempt();
  };

  function onKey(e){
    if(e.code === "Space"){
      e.preventDefault();
      attempt();
    }
  }
  document.addEventListener("keydown", onKey);

  // click anywhere in minigame to attempt
  minigameHost.addEventListener("click", (e)=>{
    if(e.target && e.target.id === "bTry") return;
    attempt();
  });

  // start immediately
  msg.textContent = "Phase 1…";
  resetPhase();

  // cleanup on end
  const origOnWin = onWin;
  const origOnFail = onFail;
  onWin = () => { document.removeEventListener("keydown", onKey); origOnWin(); };
  onFail = () => { document.removeEventListener("keydown", onKey); origOnFail(); };
}

/* ---------------------------
   End game screen
--------------------------- */
function endGame(){
  // stop rendering if already ended
  save();
  renderTributeTimeline();

  const ending = state.ending || "EXPLORER";
  const title = ending === "HERO" ? "Fin : Héros"
              : ending === "SAGE" ? "Fin : Sage"
              : "Fin : Explorateur";

  const flavor = ending === "HERO"
    ? "Tu as traversé l’épreuve sans détour. Le royaume se souviendra de ta détermination."
    : ending === "SAGE"
      ? "Tes choix ont ouvert des portes invisibles. Le royaume se souviendra de ta lucidité."
      : "Tu as survécu et appris. Le royaume se souviendra de ton instinct d’aventure.";

  endTitle.textContent = title;
  endText.textContent = flavor;

  // summary
  const badges = Object.entries(state.badges).filter(([,v])=>v).map(([k])=>k);
  endSummary.innerHTML = `
    <div class="logLine"><b>Pseudo</b> : ${escapeHtml(state.name)}</div>
    <div class="logLine"><b>Difficulté</b> : ${labelDifficulty(state.difficulty)}</div>
    <div class="logLine"><b>Rubis</b> : ${state.rubies}</div>
    <div class="logLine"><b>Cœurs restants</b> : ${state.hearts}/${state.maxHearts}</div>
    <div class="logLine"><b>Inventaire</b> : ${escapeHtml(state.inventory.join(", ") || "vide")}</div>
    <div class="logLine"><b>Badges</b> : ${escapeHtml(badges.join(" · ") || "aucun")}</div>
  `;

  // journal
  endJournal.innerHTML = "";
  state.journal.slice(-30).forEach(e=>{
    const line = document.createElement("div");
    line.className = "logLine";
    line.innerHTML = `<b>${escapeHtml(e.icon)} ${escapeHtml(e.title)}</b> — ${escapeHtml(e.text)} <span style="opacity:.55">(${escapeHtml(e.ts)})</span>`;
    endJournal.appendChild(line);
  });

  showScreen("end");
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

/* ---------------------------
   Souvenir card export (Canvas -> PNG)
--------------------------- */
function downloadSouvenir(){
  const w = 1200, h = 700;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");

  // bg gradient
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0, "#0b1e2d");
  g.addColorStop(1, "#060a0d");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // glow
  ctx.fillStyle = "rgba(242,201,76,0.08)";
  ctx.beginPath();
  ctx.arc(280, 260, 240, 0, Math.PI*2);
  ctx.fill();

  // frame
  ctx.strokeStyle = "rgba(242,201,76,0.55)";
  ctx.lineWidth = 6;
  roundRect(ctx, 40, 40, w-80, h-80, 24);
  ctx.stroke();

  // title
  ctx.fillStyle = "rgba(242,201,76,0.95)";
  ctx.font = "64px Georgia";
  ctx.fillText("Carte Souvenir", 80, 120);

  // sigil
  ctx.fillStyle = "rgba(242,201,76,0.85)";
  ctx.font = "96px Georgia";
  ctx.fillText("▲", 980, 120);

  // content
  const ending = state.ending || "EXPLORATEUR";
  const endingLabel = ending==="HERO" ? "Héros" : ending==="SAGE" ? "Sage" : "Explorateur";
  const badges = Object.entries(state.badges).filter(([,v])=>v).map(([k])=>k);

  ctx.fillStyle = "rgba(246,241,227,0.95)";
  ctx.font = "44px Georgia";
  ctx.fillText(state.name, 80, 210);

  ctx.fillStyle = "rgba(246,241,227,0.8)";
  ctx.font = "26px Georgia";
  ctx.fillText(`Fin : ${endingLabel}`, 80, 260);
  ctx.fillText(`Rubis : ${state.rubies}`, 80, 300);
  ctx.fillText(`Difficulté : ${labelDifficulty(state.difficulty)}`, 80, 340);
  ctx.fillText(`Cœurs : ${state.hearts}/${state.maxHearts}`, 80, 380);

  ctx.fillStyle = "rgba(246,241,227,0.9)";
  ctx.font = "28px Georgia";
  ctx.fillText("Objets", 640, 220);
  ctx.fillStyle = "rgba(246,241,227,0.75)";
  ctx.font = "22px Georgia";
  wrapText(ctx, state.inventory.join(", ") || "(aucun)", 640, 255, 500, 28);

  ctx.fillStyle = "rgba(246,241,227,0.9)";
  ctx.font = "28px Georgia";
  ctx.fillText("Badges", 640, 340);
  ctx.fillStyle = "rgba(246,241,227,0.75)";
  ctx.font = "22px Georgia";
  wrapText(ctx, badges.length ? badges.join(" · ") : "(aucun)", 640, 375, 500, 28);

  // footer
  ctx.fillStyle = "rgba(246,241,227,0.55)";
  ctx.font = "18px Georgia";
  ctx.fillText("Chroniques du Royaume Ancien — hommage original (noms & textes originaux)", 80, 650);

  const a = document.createElement("a");
  a.download = `souvenir_${state.name.replace(/\s+/g,"_")}.png`;
  a.href = c.toDataURL("image/png");
  a.click();
}

function roundRect(ctx, x, y, w, h, r){
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y, x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x, y+h, rr);
  ctx.arcTo(x, y+h, x, y, rr);
  ctx.arcTo(x, y, x+w, y, rr);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  const words = String(text).split(" ");
  let line = "";
  for(let n=0;n<words.length;n++){
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if(metrics.width > maxWidth && n > 0){
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

/* ---------------------------
   UI wiring
--------------------------- */
document.querySelectorAll(".tab").forEach(b=>{
  b.addEventListener("click", ()=>{
    const target = b.getAttribute("data-screen");
    if(target === "game"){
      if(!hasSave()) { showScreen("home"); return; }
      const loaded = load();
      if(loaded) state = loaded;
      showScreen("game");
      renderScene();
      return;
    }
    showScreen(target);
    if(target === "tribute") renderTributeTimeline();
  });
});

btnStart.addEventListener("click", ()=>{
  state = defaultState();
  state.name = (playerNameEl.value || "Héros").trim().slice(0,18);
  state.difficulty = difficultyEl.value;

  // difficulty tuning
  if(state.difficulty === "easy"){
    state.maxHearts = 6; state.hearts = 6;
  } else if(state.difficulty === "hard"){
    state.maxHearts = 4; state.hearts = 4;
    state.rubies = 0;
  } else {
    state.maxHearts = 5; state.hearts = 5;
  }

  addEvent("Départ", "L’aventure commence.", "▲");
  save();
  showScreen("game");
  renderScene();
});

btnContinue.addEventListener("click", ()=>{
  const loaded = load();
  if(!loaded) return;
  state = loaded;
  showScreen("game");
  renderScene();
});

btnLaunchFromAnniv.addEventListener("click", ()=>{
  showScreen("home");
  // focus start for UX
  setTimeout(()=> btnStart.focus(), 50);
});

btnReset.addEventListener("click", ()=>{
  resetSave();
  state = defaultState();
  showScreen("home");
  renderTributeTimeline();
});

toggleSoundBtn.addEventListener("click", ()=>{
  soundOn = !soundOn;
  toggleSoundBtn.setAttribute("aria-pressed", String(soundOn));
  toggleSoundBtn.textContent = soundOn ? "🔊 Son" : "🔇 Son";
  beep(520,0.04,"sine",0.05);
});

btnSouvenir.addEventListener("click", downloadSouvenir);
btnReplay.addEventListener("click", ()=>{
  resetSave();
  state = defaultState();
  showScreen("home");
});

/* Init continue/resume states */
btnContinue.disabled = !hasSave();
btnResume.disabled = !hasSave();

/* ---------------------------
   Countdown
--------------------------- */
function startCountdown(){
  const target = new Date(ANNIV_TARGET_ISO).getTime();
  setInterval(()=>{
    const d = target - Date.now();
    if(d <= 0){
      countdownEl.textContent = "🎉 Célébration en cours !";
      return;
    }
    const days = Math.floor(d / 86400000);
    const hours = Math.floor((d / 3600000) % 24);
    const mins = Math.floor((d / 60000) % 60);
    countdownEl.textContent = `${days}j ${hours}h ${mins}m`;
  }, 1000);
}
startCountdown();

/* ---------------------------
   Particules (FX canvas)
--------------------------- */
const fx = document.getElementById("fxCanvas");
const fctx = fx.getContext("2d");
let dots = [];

function resizeFx(){
  fx.width = Math.floor(window.innerWidth * devicePixelRatio);
  fx.height = Math.floor(window.innerHeight * devicePixelRatio);
  fx.style.width = window.innerWidth + "px";
  fx.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resizeFx);
resizeFx();

function seedDots(){
  dots = [];
  const count = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 12000));
  for(let i=0;i<count;i++){
    dots.push({
      x: Math.random()*fx.width,
      y: Math.random()*fx.height,
      r: (2 + Math.random()*6)*devicePixelRatio,
      vx: (-0.3 + Math.random()*0.6)*devicePixelRatio,
      vy: (-0.25 + Math.random()*0.5)*devicePixelRatio,
      a: 0.22 + Math.random()*0.35,
      hue: [120,210,45,0][Math.floor(Math.random()*4)] // green/blue/gold/red
    });
  }
}
seedDots();

function fxLoop(){
  fctx.clearRect(0,0,fx.width,fx.height);
  fctx.fillStyle = "rgba(0,0,0,0.10)";
  fctx.fillRect(0,0,fx.width,fx.height);

  for(const d of dots){
    d.x += d.vx;
    d.y += d.vy;

    if(d.x < -50) d.x = fx.width + 50;
    if(d.x > fx.width + 50) d.x = -50;
    if(d.y < -50) d.y = fx.height + 50;
    if(d.y > fx.height + 50) d.y = -50;

    const g = fctx.createRadialGradient(d.x,d.y,0,d.x,d.y,d.r);
    g.addColorStop(0, `hsla(${d.hue},90%,60%,${d.a})`);
    g.addColorStop(1, `hsla(${d.hue},90%,60%,0)`);
    fctx.fillStyle = g;
    fctx.beginPath();
    fctx.arc(d.x,d.y,d.r,0,Math.PI*2);
    fctx.fill();
  }
  requestAnimationFrame(fxLoop);
}
fxLoop();

/* ---------------------------
   Initial render of tribute
--------------------------- */
renderTributeTimeline();

/* If user clicks "Reprendre" from menu on load */
if(hasSave()){
  // keep home active but resume available
  btnResume.disabled = false;
}

/* ========================================================= */
const back = document.getElementById('btnBackToSite');
if (back) {
  back.addEventListener('click', (e) => {
    if (!confirm("Quitter le jeu et revenir au menu du site ?")) e.preventDefault();
  });
}
