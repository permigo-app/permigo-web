import type { LocalTheme, LocalLesson, LocalQuestion } from './lessonData';

// ── NL content has same structure as FR (full translated files) ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NlThemeContent = Record<string, any>;

// ── Static imports for NL content ──
import nlA from '../locales/content/nl/theme_A_nl.json';
import nlB from '../locales/content/nl/theme_B_nl.json';
import nlC from '../locales/content/nl/theme_C_nl.json';
import nlD from '../locales/content/nl/theme_D_nl.json';
import nlE from '../locales/content/nl/theme_E_nl.json';
import nlF from '../locales/content/nl/theme_F_nl.json';
import nlG from '../locales/content/nl/theme_G_nl.json';
import nlH from '../locales/content/nl/theme_H_nl.json';
import nlI from '../locales/content/nl/theme_I_nl.json';

const NL_CONTENT: Record<string, NlThemeContent> = {
  A: nlA, B: nlB, C: nlC, D: nlD, E: nlE, F: nlF, G: nlG, H: nlH, I: nlI,
};

/**
 * Apply NL translations over a FR theme.
 * NL files mirror the FR structure: lessons[].theory[].cards[]
 * Cards are matched by position (index). Questions fall back to FR.
 */
export function localizeTheme(frTheme: LocalTheme, lang: 'fr' | 'nl'): LocalTheme {
  if (lang === 'fr') return frTheme;

  const nl = NL_CONTENT[frTheme.theme];
  if (!nl) return frTheme;

  const localizedLessons = frTheme.lessons.map(frLesson => {
    const nlLesson = (nl.lessons ?? []).find((l: NlThemeContent) => l.id === frLesson.id);
    if (!nlLesson) return frLesson;

    const localizedTheory = frLesson.theory.map((partie, pi) => {
      const nlPartie = nlLesson.theory?.[pi];

      const localizedCards = partie.cards.map((card, ci) => {
        const nlCard = nlPartie?.cards?.[ci];
        if (!nlCard) return card;
        return {
          ...card,
          title: nlCard.title ?? card.title,
          content: nlCard.content ?? card.content,
          ...(nlCard.explanation_simple ? { explanation_simple: nlCard.explanation_simple } : {}),
        };
      });

      return {
        ...partie,
        title: nlPartie?.title ?? partie.title,
        cards: localizedCards,
      };
    });

    // Questions: use FR (NL files keep FR questions as-is)
    const localizedQuestions: LocalQuestion[] = frLesson.questions;

    return {
      ...frLesson,
      title: nlLesson.title ?? frLesson.title,
      theory: localizedTheory,
      questions: localizedQuestions,
    } as LocalLesson;
  });

  return {
    ...frTheme,
    title: nl.title ?? frTheme.title,
    lessons: localizedLessons,
  };
}
