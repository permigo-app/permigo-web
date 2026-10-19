// Lecture vocale des questions avec la synthèse vocale intégrée au navigateur
// (Web Speech API) : gratuite, sans serveur, voix du téléphone de l'utilisateur.

type Lang = 'fr' | 'nl';

const STORAGE_KEY = 'permigo_voice';

export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function getVoiceEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
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

export function stopSpeaking() {
  if (isVoiceSupported()) window.speechSynthesis.cancel();
}

/**
 * Lit les phrases l'une après l'autre. Une phrase = un énoncé : ça marque des
 * pauses naturelles entre la question et chaque réponse, et ça évite que Chrome
 * coupe les textes longs (au-delà d'une quinzaine de secondes).
 */
export function speak(parts: string[], lang: Lang) {
  if (!isVoiceSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const run = () => {
    const voice = pickVoice(lang);
    for (const part of parts) {
      const text = normalize(part, lang);
      if (!text) continue;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang ?? (lang === 'fr' ? 'fr-BE' : 'nl-BE');
      if (voice) u.voice = voice;
      u.rate = 1;
      synth.speak(u);
    }
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
