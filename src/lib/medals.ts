// Paliers de médailles par thème et de trophées globaux.
// Bronze 25% / Argent 50% / Or 100% des leçons — Diamant = examen réussi.

export type Tier = 'none' | 'bronze' | 'argent' | 'or' | 'diamant';

export const TIER_ORDER: Tier[] = ['bronze', 'argent', 'or', 'diamant'];

export const TIER_COLORS: Record<Exclude<Tier, 'none'>, { main: string; ribbon: string }> = {
  bronze:  { main: '#C98850', ribbon: '#A56B3A' },
  argent:  { main: '#B8C2D0', ribbon: '#8A96A8' },
  or:      { main: '#E4B84C', ribbon: '#C29A2E' },
  diamant: { main: '#7DD3FC', ribbon: '#38BDF8' },
};

export const TIER_PCT: Record<'bronze' | 'argent' | 'or', number> = {
  bronze: 25,
  argent: 50,
  or: 100,
};

/** Palier atteint pour un thème (ou le global) selon la progression + examen. */
export function computeTier(completed: number, total: number, examPassed: boolean): Tier {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  if (pct >= 100 && examPassed) return 'diamant';
  if (pct >= 100) return 'or';
  if (pct >= 50) return 'argent';
  if (pct >= 25) return 'bronze';
  return 'none';
}

/**
 * Parties faites/totales d'une leçon. Les médailles progressent par PARTIE
 * (unité fine) et non par leçon entière — sinon un thème de 2 leçons saute
 * de 0% à 50% d'un coup.
 *
 * Les parties enregistrées font foi. Le flag « leçon terminée » (et son
 * repli étoiles) ne sert de secours QUE pour les leçons à une seule partie,
 * où le suivi par partie n'a jamais existé — jamais pour une leçon à
 * plusieurs parties. Sinon, dès que `lessonPartiesDone_*` est vide pour
 * n'importe quelle raison (rien fait ici, ou simplement pas encore
 * synchronisé depuis un autre appareil — Supabase ne transporte que le
 * score global, pas le détail par partie), la leçon entière réapparaît
 * faussement validée à 100 % au lieu de 0 %.
 */
export function countThemeParts(
  lessonId: string,
  partsInLesson: number,
  isLessonCompleted: (id: string) => boolean,
  getCompletedParties: (id: string) => number[],
): { done: number; total: number } {
  const total = Math.max(1, partsInLesson);
  const partiesDone = getCompletedParties(lessonId).length;
  const canFallBackToLegacyFlag = total <= 1;
  const done = partiesDone > 0
    ? Math.min(total, partiesDone)
    : (canFallBackToLegacyFlag && isLessonCompleted(lessonId) ? total : 0);
  return { done, total };
}

/** Une leçon est réellement terminée quand toutes ses parties le sont
 * (même règle d'auto-guérison que countThemeParts). */
export function lessonEffectivelyCompleted(
  lessonId: string,
  partsInLesson: number,
  isLessonCompleted: (id: string) => boolean,
  getCompletedParties: (id: string) => number[],
): boolean {
  const { done, total } = countThemeParts(lessonId, partsInLesson, isLessonCompleted, getCompletedParties);
  return done >= total;
}
