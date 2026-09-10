// Dynamic imports — each theme is loaded on demand and cached.
// No static imports at module level to avoid bundling all 4.3MB at startup.

export interface LocalTheoryCard {
  type: 'card';
  title: string;
  content: string;
  emoji: string;
  explanation_simple?: string;
  image?: string;
  signs?: string[];
}

export interface LocalQuestion {
  id: string;
  question: string;
  /** 2 ou 3 propositions a l affichage (format examen belge). Les JSON en
   *  contiennent encore 4 : la reduction se fait a la lecture. */
  choices: string[];
  correct: number;
  explanation: string;
  theoryCardIndex?: number;
  sign?: string;
  /** Illustration de la situation (photo/rendu), chemin sous /public — ex. /images/questions/A1_Q3.webp */
  image?: string;
  // Matière "éliminatoire" à l'examen GOCA (infraction 3e/4e degré, vitesse) :
  // à l'examen blanc, une erreur sur ces questions coûte 5 points au lieu de 1
  severe?: boolean;
}

export interface LocalPartie {
  title: string;
  cards: LocalTheoryCard[];
}

export interface LocalLesson {
  id: string;
  title: string;
  theory: LocalPartie[];
  questions: LocalQuestion[];
}

export interface LocalTheme {
  theme: string;
  city: string;
  title: string;
  lessons: LocalLesson[];
}

// Ordre des thèmes du permis B (permis historique)
export const THEME_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
// Ordre des thèmes du permis AM — squelette, complété lors de la rédaction (AM-2)
export const AM_THEME_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'];

import { getActiveLicense } from './license';

/** Ordre des thèmes du permis actif. Sous B : identique à THEME_ORDER. */
export function getThemeOrder(): string[] {
  return getActiveLicense() === 'AM' ? AM_THEME_ORDER : THEME_ORDER;
}

// Cache par permis + code thème ("B:A", "AM:A"…)
const themeCache: Record<string, LocalTheme> = {};

async function loadTheme(code: string): Promise<LocalTheme | null> {
  const lic = getActiveLicense();
  const cacheKey = lic + ':' + code;
  if (themeCache[cacheKey]) return themeCache[cacheKey];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mod: { default: any };
    if (lic === 'AM') {
      // Contenu du permis AM — dans src/data/am/ (rédigé en mission AM-2)
      switch (code) {
        case 'A': mod = await import('../data/am/theme_A.json'); break;
        case 'B': mod = await import('../data/am/theme_B.json'); break;
        case 'C': mod = await import('../data/am/theme_C.json'); break;
        case 'D': mod = await import('../data/am/theme_D.json'); break;
        case 'E': mod = await import('../data/am/theme_E.json'); break;
        case 'F': mod = await import('../data/am/theme_F.json'); break;
        default: return null;
      }
    } else {
      switch (code) {
        case 'A': mod = await import('../data/theme_A.json'); break;
        case 'B': mod = await import('../data/theme_B.json'); break;
        case 'C': mod = await import('../data/theme_C.json'); break;
        case 'D': mod = await import('../data/theme_D.json'); break;
        case 'E': mod = await import('../data/theme_E.json'); break;
        case 'F': mod = await import('../data/theme_F.json'); break;
        case 'G': mod = await import('../data/theme_G.json'); break;
        case 'H': mod = await import('../data/theme_H.json'); break;
        case 'I': mod = await import('../data/theme_I.json'); break;
        default: return null;
      }
    }
    themeCache[cacheKey] = mod.default as LocalTheme;
    return themeCache[cacheKey];
  } catch {
    return null;
  }
}

export async function getThemeData(code: string): Promise<LocalTheme | null> {
  const t = await loadTheme(code);
  return t ? reduceTheme(t) : null;
}

export async function getLessonData(lessonId: string): Promise<LocalLesson | null> {
  const needle = (lessonId || '').toUpperCase();
  const themeCode = needle.charAt(0);
  if (getThemeOrder().includes(themeCode)) {
    const theme = await loadTheme(themeCode);
    if (theme) {
      const lesson = theme.lessons.find(l => l.id.toUpperCase() === needle);
      if (lesson) return reduceLesson(lesson);
    }
  }
  return null;
}

export async function getThemeForLesson(lessonId: string): Promise<LocalTheme | null> {
  const needle = (lessonId || '').toUpperCase();
  const themeCode = needle.charAt(0);
  if (getThemeOrder().includes(themeCode)) {
    const theme = await loadTheme(themeCode);
    if (theme && theme.lessons.some(l => l.id.toUpperCase() === needle)) return reduceTheme(theme);
  }
  return null;
}

export async function getExamQuestions(themeCode: string, count: number = 20): Promise<LocalQuestion[]> {
  const allQuestions: LocalQuestion[] = [];
  if (themeCode === 'FINAL') {
    const themes = await Promise.all(getThemeOrder().map(code => loadTheme(code)));
    for (const theme of themes) {
      if (!theme) continue;
      for (const lesson of theme.lessons) allQuestions.push(...lesson.questions);
    }
  } else {
    const theme = await loadTheme(themeCode);
    if (!theme) return [];
    for (const lesson of theme.lessons) allQuestions.push(...lesson.questions);
  }
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }
  return allQuestions.slice(0, Math.min(count, allQuestions.length)).map(reduceQuestion);
}

export async function getAllQuestions(): Promise<LocalQuestion[]> {
  const all: LocalQuestion[] = [];
  const themes = await Promise.all(getThemeOrder().map(code => loadTheme(code)));
  for (const theme of themes) {
    if (!theme) continue;
    for (const lesson of theme.lessons) all.push(...lesson.questions);
  }
  return all.map(reduceQuestion);
}

/**
 * Nombre de propositions affichées. L'examen officiel belge en présente 2 ou 3,
 * jamais 4 : on s'aligne sur 3. Les données gardent leurs 4 propositions —
 * on en tire la bonne + 2 mauvaises au hasard, ce qui a l'avantage de varier
 * d'une session à l'autre plutôt que de servir toujours les mêmes distracteurs.
 */
export const CHOICES_SHOWN = 3;

/**
 * Tirage déterministe, semé par l'identifiant de la question.
 *
 * Le hasard pur serait un piège : la même question apparaît dans la leçon,
 * en révision et dans la banque d'erreurs. Avec Math.random(), elle
 * montrerait trois propositions différentes à chaque fois — l'utilisateur
 * croirait avoir affaire à une autre question, et une réponse mémorisée
 * comme « la deuxième » ne voudrait plus rien dire.
 * Semé par l'id, un même énoncé garde toujours les mêmes propositions,
 * dans le même ordre, en français comme en néerlandais.
 */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mélange les propositions, en garde CHOICES_SHOWN, et renvoie le nouvel index correct. */
export function shuffleChoices(q: LocalQuestion): { choices: string[]; correct: number } {
  const rnd = seededRandom(q.id);
  const wrong = q.choices
    .map((_, i) => i)
    .filter(i => i !== q.correct);

  // Fisher-Yates sur les mauvaises réponses (un sort() aléatoire n'est PAS uniforme)
  for (let i = wrong.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
  }

  const kept = [q.correct, ...wrong.slice(0, Math.max(0, CHOICES_SHOWN - 1))];
  for (let i = kept.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [kept[i], kept[j]] = [kept[j], kept[i]];
  }

  return {
    choices: kept.map(i => q.choices[i]),
    correct: kept.indexOf(q.correct),
  };
}

/**
 * Ramène une question au format de l'examen belge : 3 propositions au maximum.
 * Une question volontairement écrite en oui/non (2 propositions) est laissée
 * telle quelle — on ne complète jamais pour atteindre un quota.
 */
export function reduceQuestion(q: LocalQuestion): LocalQuestion {
  // A partir de 3 propositions on melange aussi : sans ca, une question ecrite
  // avec sa bonne reponse en premier la garderait en premiere position a vie.
  if (!Array.isArray(q.choices) || q.choices.length <= 2) return q;
  const { choices, correct } = shuffleChoices(q);
  return { ...q, choices: choices, correct };
}

function reduceLesson(l: LocalLesson): LocalLesson {
  return { ...l, questions: l.questions.map(reduceQuestion) };
}

function reduceTheme(t: LocalTheme): LocalTheme {
  return { ...t, lessons: t.lessons.map(reduceLesson) };
}

export function getNextThemeCode(code: string): string | null {
  const order = getThemeOrder();
  const idx = order.indexOf(code);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

// ── Language-aware wrappers ──
import { localizeTheme } from './contentLoader';

export type Lang = 'fr' | 'nl';

export async function getThemeDataLocalized(code: string, lang: Lang): Promise<LocalTheme | null> {
  const theme = await loadTheme(code);
  if (!theme) return null;
  return reduceTheme(await localizeTheme(theme, lang));
}

export async function getLessonDataLocalized(lessonId: string, lang: Lang): Promise<LocalLesson | null> {
  const needle = (lessonId || '').toUpperCase();
  const themeCode = needle.charAt(0);
  if (getThemeOrder().includes(themeCode)) {
    const theme = await loadTheme(themeCode);
    if (theme) {
      const idx = theme.lessons.findIndex(l => l.id.toUpperCase() === needle);
      if (idx >= 0) {
        const localized = await localizeTheme(theme, lang);
        return reduceLesson(localized.lessons[idx]);
      }
    }
  }
  return null;
}

export async function getThemeForLessonLocalized(lessonId: string, lang: Lang): Promise<LocalTheme | null> {
  const needle = (lessonId || '').toUpperCase();
  const themeCode = needle.charAt(0);
  if (getThemeOrder().includes(themeCode)) {
    const theme = await loadTheme(themeCode);
    if (theme && theme.lessons.some(l => l.id.toUpperCase() === needle)) {
      return reduceTheme(await localizeTheme(theme, lang));
    }
  }
  return null;
}

export async function getExamQuestionsLocalized(themeCode: string, lang: Lang, count: number = 20): Promise<LocalQuestion[]> {
  const allQuestions: LocalQuestion[] = [];
  if (themeCode === 'FINAL') {
    const locs = await Promise.all(getThemeOrder().map(code => getThemeDataLocalized(code, lang)));
    for (const loc of locs) {
      if (!loc) continue;
      for (const lesson of loc.lessons) allQuestions.push(...lesson.questions);
    }
  } else {
    const theme = await loadTheme(themeCode);
    if (!theme) return [];
    const loc = await localizeTheme(theme, lang);
    for (const lesson of loc.lessons) allQuestions.push(...lesson.questions);
  }
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }
  return allQuestions.slice(0, Math.min(count, allQuestions.length)).map(reduceQuestion);
}

export async function getAllQuestionsLocalized(lang: Lang): Promise<LocalQuestion[]> {
  const all: LocalQuestion[] = [];
  const locs = await Promise.all(getThemeOrder().map(code => getThemeDataLocalized(code, lang)));
  for (const loc of locs) {
    if (!loc) continue;
    for (const lesson of loc.lessons) all.push(...lesson.questions);
  }
  return all;
}

export async function getAllQuestionsLocalizedFlat(lang: Lang): Promise<LocalQuestion[]> {
  return getAllQuestionsLocalized(lang);
}

export async function getQuestionById(id: string, lang: Lang = 'fr'): Promise<LocalQuestion | null> {
  // Chemin rapide : la 1re lettre de l'id est le code du thème (ids permis B)
  const themeCode = (id || '').charAt(0);
  if (getThemeOrder().includes(themeCode)) {
    const theme = await getThemeDataLocalized(themeCode, lang);
    if (theme) {
      for (const lesson of theme.lessons) {
        const q = lesson.questions.find(q => q.id === id);
        if (q) return q;
      }
    }
  }
  // Repli : balayage de tous les thèmes du permis actif (ids préfixés "AM_"…).
  // Un id d'un autre permis reste introuvable — c'est voulu : la banque
  // d'erreurs est commune au compte, chaque permis ne résout que ses ids.
  for (const code of getThemeOrder()) {
    if (code === themeCode) continue;
    const theme = await getThemeDataLocalized(code, lang);
    if (!theme) continue;
    for (const lesson of theme.lessons) {
      const q = lesson.questions.find(q => q.id === id);
      if (q) return q;
    }
  }
  return null;
}
