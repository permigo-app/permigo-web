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
  choices: [string, string, string, string];
  correct: number;
  explanation: string;
  theoryCardIndex?: number;
  sign?: string;
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

export const THEME_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

const themeCache: Record<string, LocalTheme> = {};

async function loadTheme(code: string): Promise<LocalTheme | null> {
  if (themeCache[code]) return themeCache[code];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mod: { default: any };
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
    themeCache[code] = mod.default as LocalTheme;
    return themeCache[code];
  } catch {
    return null;
  }
}

export async function getThemeData(code: string): Promise<LocalTheme | null> {
  return loadTheme(code);
}

export async function getLessonData(lessonId: string): Promise<LocalLesson | null> {
  const needle = (lessonId || '').toUpperCase();
  const themeCode = needle.charAt(0);
  if (THEME_ORDER.includes(themeCode)) {
    const theme = await loadTheme(themeCode);
    if (theme) {
      const lesson = theme.lessons.find(l => l.id.toUpperCase() === needle);
      if (lesson) return lesson;
    }
  }
  return null;
}

export async function getThemeForLesson(lessonId: string): Promise<LocalTheme | null> {
  const needle = (lessonId || '').toUpperCase();
  const themeCode = needle.charAt(0);
  if (THEME_ORDER.includes(themeCode)) {
    const theme = await loadTheme(themeCode);
    if (theme && theme.lessons.some(l => l.id.toUpperCase() === needle)) return theme;
  }
  return null;
}

export async function getExamQuestions(themeCode: string, count: number = 20): Promise<LocalQuestion[]> {
  const allQuestions: LocalQuestion[] = [];
  if (themeCode === 'FINAL') {
    for (const code of THEME_ORDER) {
      const theme = await loadTheme(code);
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
  return allQuestions.slice(0, Math.min(count, allQuestions.length));
}

export async function getAllQuestions(): Promise<LocalQuestion[]> {
  const all: LocalQuestion[] = [];
  for (const code of THEME_ORDER) {
    const theme = await loadTheme(code);
    if (!theme) continue;
    for (const lesson of theme.lessons) all.push(...lesson.questions);
  }
  return all;
}

/** Shuffle choices and return new choices array + new correct index */
export function shuffleChoices(q: LocalQuestion): { choices: string[]; correct: number } {
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const choices = indices.map(i => q.choices[i]);
  const correct = indices.indexOf(q.correct);
  return { choices, correct };
}

export function getNextThemeCode(code: string): string | null {
  const idx = THEME_ORDER.indexOf(code);
  if (idx < 0 || idx >= THEME_ORDER.length - 1) return null;
  return THEME_ORDER[idx + 1];
}

// ── Language-aware wrappers ──
import { localizeTheme } from './contentLoader';

export type Lang = 'fr' | 'nl';

export async function getThemeDataLocalized(code: string, lang: Lang): Promise<LocalTheme | null> {
  const theme = await loadTheme(code);
  if (!theme) return null;
  return localizeTheme(theme, lang);
}

export async function getLessonDataLocalized(lessonId: string, lang: Lang): Promise<LocalLesson | null> {
  const needle = (lessonId || '').toUpperCase();
  const themeCode = needle.charAt(0);
  if (THEME_ORDER.includes(themeCode)) {
    const theme = await loadTheme(themeCode);
    if (theme) {
      const idx = theme.lessons.findIndex(l => l.id.toUpperCase() === needle);
      if (idx >= 0) {
        const localized = await localizeTheme(theme, lang);
        return localized.lessons[idx];
      }
    }
  }
  return null;
}

export async function getThemeForLessonLocalized(lessonId: string, lang: Lang): Promise<LocalTheme | null> {
  const needle = (lessonId || '').toUpperCase();
  const themeCode = needle.charAt(0);
  if (THEME_ORDER.includes(themeCode)) {
    const theme = await loadTheme(themeCode);
    if (theme && theme.lessons.some(l => l.id.toUpperCase() === needle)) {
      return localizeTheme(theme, lang);
    }
  }
  return null;
}

export async function getExamQuestionsLocalized(themeCode: string, lang: Lang, count: number = 20): Promise<LocalQuestion[]> {
  const allQuestions: LocalQuestion[] = [];
  if (themeCode === 'FINAL') {
    for (const code of THEME_ORDER) {
      const theme = await loadTheme(code);
      if (!theme) continue;
      const loc = await localizeTheme(theme, lang);
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
  return allQuestions.slice(0, Math.min(count, allQuestions.length));
}

export async function getAllQuestionsLocalized(lang: Lang): Promise<LocalQuestion[]> {
  const all: LocalQuestion[] = [];
  for (const code of THEME_ORDER) {
    const theme = await loadTheme(code);
    if (!theme) continue;
    const loc = await localizeTheme(theme, lang);
    for (const lesson of loc.lessons) all.push(...lesson.questions);
  }
  return all;
}

export async function getAllQuestionsLocalizedFlat(lang: Lang): Promise<LocalQuestion[]> {
  return getAllQuestionsLocalized(lang);
}

export async function getQuestionById(id: string, lang: Lang = 'fr'): Promise<LocalQuestion | null> {
  const themeCode = (id || '').charAt(0);
  if (THEME_ORDER.includes(themeCode)) {
    const theme = await getThemeDataLocalized(themeCode, lang);
    if (theme) {
      for (const lesson of theme.lessons) {
        const q = lesson.questions.find(q => q.id === id);
        if (q) return q;
      }
    }
  }
  return null;
}
