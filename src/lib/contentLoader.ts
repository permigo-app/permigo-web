import type { LocalTheme, LocalLesson, LocalQuestion } from './lessonData';
import { getActiveLicense } from './license';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NlThemeContent = Record<string, any>;

// Cache par permis + code thème ("B:A", "AM:A"…)
const nlCache: Record<string, NlThemeContent | null> = {};

async function loadNl(code: string): Promise<NlThemeContent | null> {
  const lic = getActiveLicense();
  const cacheKey = lic + ':' + code;
  if (cacheKey in nlCache) return nlCache[cacheKey];
  try {
    let mod: { default: NlThemeContent };
    if (lic === 'AM') {
      switch (code) {
        case 'A': mod = await import('../locales/content/nl/am/theme_A_nl.json'); break;
        case 'B': mod = await import('../locales/content/nl/am/theme_B_nl.json'); break;
        case 'C': mod = await import('../locales/content/nl/am/theme_C_nl.json'); break;
        case 'D': mod = await import('../locales/content/nl/am/theme_D_nl.json'); break;
        case 'E': mod = await import('../locales/content/nl/am/theme_E_nl.json'); break;
        case 'F': mod = await import('../locales/content/nl/am/theme_F_nl.json'); break;
        default: nlCache[cacheKey] = null; return null;
      }
      nlCache[cacheKey] = mod.default;
      return nlCache[cacheKey];
    }
    switch (code) {
      case 'A': mod = await import('../locales/content/nl/theme_A_nl.json'); break;
      case 'B': mod = await import('../locales/content/nl/theme_B_nl.json'); break;
      case 'C': mod = await import('../locales/content/nl/theme_C_nl.json'); break;
      case 'D': mod = await import('../locales/content/nl/theme_D_nl.json'); break;
      case 'E': mod = await import('../locales/content/nl/theme_E_nl.json'); break;
      case 'F': mod = await import('../locales/content/nl/theme_F_nl.json'); break;
      case 'G': mod = await import('../locales/content/nl/theme_G_nl.json'); break;
      case 'H': mod = await import('../locales/content/nl/theme_H_nl.json'); break;
      case 'I': mod = await import('../locales/content/nl/theme_I_nl.json'); break;
      default: nlCache[cacheKey] = null; return null;
    }
    nlCache[cacheKey] = mod.default;
    return nlCache[cacheKey];
  } catch {
    nlCache[cacheKey] = null;
    return null;
  }
}

export async function localizeTheme(frTheme: LocalTheme, lang: 'fr' | 'nl'): Promise<LocalTheme> {
  if (lang === 'fr') return frTheme;

  const nl = await loadNl(frTheme.theme);
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

    const nlQMap = new Map<string, NlThemeContent>(
      (nlLesson.questions ?? []).map(
        (q: NlThemeContent) => [q.id as string, q] as [string, NlThemeContent]
      )
    );
    const localizedQuestions: LocalQuestion[] = frLesson.questions.map(q => {
      const nlQ = nlQMap.get(q.id);
      if (!nlQ || !nlQ['question']) return q;
      return {
        ...q,
        question: nlQ['question'] as string,
        choices: nlQ['choices'] as [string, string, string, string],
        ...(nlQ['explanation'] ? { explanation: nlQ['explanation'] as string } : {}),
      };
    });

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
