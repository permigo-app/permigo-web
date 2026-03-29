import type { LocalTheme, LocalLesson, LocalQuestion } from './lessonData';

// ── NL translation content structure ──
interface NlCard {
  id: string;
  title: string;
  content: string;
  explanation_simple?: string;
}

interface NlQuestion {
  id: string;
  question: string;
  choices: string[];
  explanation?: string;
}

interface NlPartie {
  id: string;
  title: string;
}

interface NlLesson {
  id: string;
  title: string;
  parties: NlPartie[];
  cards: NlCard[];
  questions: NlQuestion[];
}

interface NlThemeContent {
  theme_title: string;
  lessons: NlLesson[];
}

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
 * Apply NL translations over a FR theme, keeping all structural fields (correct, emoji, etc.)
 */
export function localizeTheme(frTheme: LocalTheme, lang: 'fr' | 'nl'): LocalTheme {
  if (lang === 'fr') return frTheme;

  const nl = NL_CONTENT[frTheme.theme];
  if (!nl) return frTheme; // fallback FR

  const localizedLessons = frTheme.lessons.map(frLesson => {
    const nlLesson = nl.lessons.find(l => l.id === frLesson.id);
    if (!nlLesson) return frLesson; // fallback FR

    // Build card lookup by id
    const nlCardMap = new Map(nlLesson.cards.map(c => [c.id, c]));
    // Build partie lookup by index-based id
    const nlPartieMap = new Map(nlLesson.parties.map(p => [p.id, p]));
    // Build question lookup by id
    const nlQMap = new Map(nlLesson.questions.map(q => [q.id, q]));

    const localizedTheory = frLesson.theory.map((partie, pi) => {
      const partieId = `${frLesson.id}_partie_${pi}`;
      const nlPartie = nlPartieMap.get(partieId);

      const localizedCards = partie.cards.map((card, ci) => {
        const cardId = `${frLesson.id}_p${pi}_c${ci}`;
        const nlCard = nlCardMap.get(cardId);
        if (!nlCard) return card; // fallback FR
        return {
          ...card,
          title: nlCard.title,
          content: nlCard.content,
          ...(nlCard.explanation_simple ? { explanation_simple: nlCard.explanation_simple } : {}),
        };
      });

      return {
        ...partie,
        title: nlPartie?.title ?? partie.title,
        cards: localizedCards,
      };
    });

    const localizedQuestions: LocalQuestion[] = frLesson.questions.map(q => {
      const nlQ = nlQMap.get(q.id);
      if (!nlQ) return q; // fallback FR
      return {
        ...q,
        question: nlQ.question,
        choices: nlQ.choices as [string, string, string, string],
        ...(nlQ.explanation ? { explanation: nlQ.explanation } : {}),
      };
    });

    return {
      ...frLesson,
      title: nlLesson.title,
      theory: localizedTheory,
      questions: localizedQuestions,
    } as LocalLesson;
  });

  return {
    ...frTheme,
    title: nl.theme_title,
    lessons: localizedLessons,
  };
}
