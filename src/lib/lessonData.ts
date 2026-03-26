import themeA from '../data/theme_A.json';
import themeB from '../data/theme_B.json';
import themeC from '../data/theme_C.json';
import themeD from '../data/theme_D.json';
import themeE from '../data/theme_E.json';
import themeF from '../data/theme_F.json';
import themeG from '../data/theme_G.json';
import themeH from '../data/theme_H.json';
import themeI from '../data/theme_I.json';

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

const THEMES: Record<string, LocalTheme> = {
  A: themeA as LocalTheme,
  B: themeB as LocalTheme,
  C: themeC as LocalTheme,
  D: themeD as LocalTheme,
  E: themeE as LocalTheme,
  F: themeF as LocalTheme,
  G: themeG as LocalTheme,
  H: themeH as LocalTheme,
  I: themeI as LocalTheme,
};

export const THEME_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

export function getThemeData(code: string): LocalTheme | null {
  return THEMES[code] ?? null;
}

export function getLessonData(lessonId: string): LocalLesson | null {
  const needle = (lessonId || '').toUpperCase();
  for (const theme of Object.values(THEMES)) {
    const lesson = theme.lessons.find((l) => l.id.toUpperCase() === needle);
    if (lesson) return lesson;
  }
  return null;
}

export function getThemeForLesson(lessonId: string): LocalTheme | null {
  const needle = (lessonId || '').toUpperCase();
  for (const theme of Object.values(THEMES)) {
    if (theme.lessons.some((l) => l.id.toUpperCase() === needle)) return theme;
  }
  return null;
}

export function getExamQuestions(themeCode: string, count: number = 20): LocalQuestion[] {
  const allQuestions: LocalQuestion[] = [];
  if (themeCode === 'FINAL') {
    for (const theme of Object.values(THEMES)) {
      for (const lesson of theme.lessons) {
        allQuestions.push(...lesson.questions);
      }
    }
  } else {
    const theme = THEMES[themeCode];
    if (!theme) return [];
    for (const lesson of theme.lessons) {
      allQuestions.push(...lesson.questions);
    }
  }
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }
  return allQuestions.slice(0, Math.min(count, allQuestions.length));
}

export function getAllQuestions(): LocalQuestion[] {
  const all: LocalQuestion[] = [];
  for (const theme of Object.values(THEMES)) {
    for (const lesson of theme.lessons) {
      all.push(...lesson.questions);
    }
  }
  return all;
}

export function getNextThemeCode(code: string): string | null {
  const idx = THEME_ORDER.indexOf(code);
  if (idx < 0 || idx >= THEME_ORDER.length - 1) return null;
  return THEME_ORDER[idx + 1];
}
