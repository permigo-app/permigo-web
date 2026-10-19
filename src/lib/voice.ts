// Lecture vocale des questions avec la synthèse vocale intégrée au navigateur
// (Web Speech API) : gratuite, sans serveur, voix du téléphone de l'utilisateur.

type Lang = 'fr' | 'nl';

const STORAGE_KEY = 'permigo_voice';

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** Activée par défaut : seul un « off » explicite de l'utilisateur la coupe. */
export function getVoiceEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

/**
 * Les navigateurs (iPhone surtout) refusent de parler tant que l'utilisateur
 * n'a pas touché la page. Au tout premier toucher, on prononce un énoncé muet :
 * la voix est alors débloquée pour toute la visite, et les questions peuvent
 * être lues automatiquement.
 */
let debloquee = false;
let installee = false;
// Lecture refusée faute de geste (page ouverte directement, sans clic) :
// on la rejoue au premier toucher.
let enAttente: { parts: string[]; lang: Lang } | null = null;

export function installVoiceUnlock() {
  if (!isVoiceSupported() || installee) return;
  installee = true;
  window.addEventListener('pointerdown', () => {
    if (!debloquee) {
      debloquee = true;
      try {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      } catch {
        // sans conséquence : la lecture pourra quand même être relancée à la main
      }
    }
    if (enAttente) {
      const { parts, lang } = enAttente;
      enAttente = null;
      speak(parts, lang);
    }
  }, { capture: true });
}

/** Voix installées sur l'appareil pour cette langue (vide tant que la liste n'est pas chargée). */
export function voicesFor(lang: Lang): SpeechSynthesisVoice[] {
  if (!isVoiceSupported()) return [];
  return window.speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(lang));
}

/** Appelle `cb` quand la liste des voix est connue (immédiatement si elle l'est déjà). */
export function onVoicesReady(cb: () => void): () => void {
  if (!isVoiceSupported()) return () => {};
  const synth = window.speechSynthesis;
  if (synth.getVoices().length > 0) cb();
  synth.addEventListener('voiceschanged', cb);
  return () => synth.removeEventListener('voiceschanged', cb);
}

export function setVoiceEnabled(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    // ignoré : le choix vaut pour cette visite
  }
}

/**
 * Meilleure voix disponible pour la langue : accent belge d'abord (fr-BE, nl-BE),
 * puis n'importe quelle variante, en préférant les voix « naturelles » / réseau,
 * nettement moins robotiques que les voix locales de base.
 */
function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const sameLang = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(lang));
  if (sameLang.length === 0) return null;
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0;
    if (v.lang.toLowerCase().replace('_', '-') === `${lang}-be`) s += 4;
    if (/natural|neural|online|enhanced|premium|google/i.test(v.name)) s += 3;
    if (!v.localService) s += 1;
    return s;
  };
  return [...sameLang].sort((a, b) => score(b) - score(a))[0];
}

/** Rend les abréviations prononçables (sinon « km/h » est lu lettre par lettre). */
function normalize(text: string, lang: Lang): string {
  const fr = lang === 'fr';
  return text
    .replace(/km\/h|km\/u/gi, fr ? 'kilomètres heure' : 'kilometer per uur')
    .replace(/‰/g, fr ? ' pour mille' : ' promille')
    .replace(/\bmg\/l\b/gi, fr ? 'milligrammes par litre' : 'milligram per liter')
    .replace(/[«»"“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Numéro de la lecture en cours : une lecture coupée par la suivante ne doit
// pas signaler sa « fin » (elle débloquerait le chrono trop tôt).
let lectureCourante = 0;

export function stopSpeaking() {
  lectureCourante++;
  enAttente = null;
  if (isVoiceSupported()) window.speechSynthesis.cancel();
}

/**
 * Lit les phrases l'une après l'autre. Une phrase = un énoncé : ça marque des
 * pauses naturelles entre la question et chaque réponse, et ça évite que Chrome
 * coupe les textes longs (au-delà d'une quinzaine de secondes).
 *
 * `onDone` est appelé une seule fois, quand la lecture est terminée — ou ne
 * peut pas avoir lieu (voix bloquée, pas de voix). Garde-fou : si le navigateur
 * ne signale jamais la fin, on l'appelle quand même après une durée estimée,
 * pour que le chrono de l'examen ne reste jamais bloqué.
 */
export function speak(parts: string[], lang: Lang, onDone?: () => void) {
  const id = ++lectureCourante;
  let fini = false;
  const terminer = () => {
    if (fini) return;
    fini = true;
    if (id === lectureCourante) onDone?.();
  };
  if (!isVoiceSupported()) { terminer(); return; }
  const synth = window.speechSynthesis;
  synth.cancel();
  const textes = parts.map(p => normalize(p, lang)).filter(Boolean);
  if (textes.length === 0) { terminer(); return; }
  // ~80 ms par caractère à vitesse normale, + 3 s de marge, plafonné à 30 s
  const dureeMax = Math.min(30000, textes.join(' ').length * 80 + 3000);
  setTimeout(terminer, dureeMax);
  enAttente = null;
  const run = () => {
    if (id !== lectureCourante) return; // déjà remplacée par une autre lecture
    const voice = pickVoice(lang);
    // Aucune voix pour cette langue (ex. pas de voix néerlandaise dans Windows) :
    // on se tait plutôt que de lire du néerlandais avec une voix française.
    if (!voice && synth.getVoices().length > 0) { terminer(); return; }
    textes.forEach((text, i) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang ?? (lang === 'fr' ? 'fr-BE' : 'nl-BE');
      if (voice) u.voice = voice;
      u.rate = 1;
      if (i === textes.length - 1) u.onend = terminer;
      u.onerror = (e: SpeechSynthesisErrorEvent) => {
        // Refusée faute de clic sur la page : rejouée au premier toucher
        if (e.error === 'not-allowed' && id === lectureCourante) enAttente = { parts, lang };
        terminer(); // bloquée ou interrompue : on n'attend pas
      };
      synth.speak(u);
    });
  };
  // Les voix se chargent en différé sur certains navigateurs (Chrome).
  if (synth.getVoices().length === 0) {
    let done = false;
    const once = () => { if (!done) { done = true; run(); } };
    synth.addEventListener('voiceschanged', once, { once: true });
    setTimeout(once, 400);
  } else {
    run();
  }
}
