// Quiz des panneaux : UNE question par panneau du catalogue.
//
// Principe voulu côté produit : si une catégorie contient 25 panneaux, le quiz
// pose 25 questions « Que signifie ce panneau ? » — une par panneau, aucune
// oubliée. Les questions sont donc DÉRIVÉES de signsData (source unique de
// vérité, déjà traduite FR/NL) au lieu d'être écrites à la main : impossible
// qu'un panneau ajouté au catalogue reste sans question.

import { getSignsByCategory, getAllSignsLocalized, type SignDef } from './signsData';

export interface SignQuizQuestion {
  /** Code du panneau (sert aussi de clé React et d'identifiant de progression) */
  code: string;
  /** Libellés proposés, déjà mélangés */
  choices: string[];
  /** Index de la bonne réponse dans `choices` */
  correct: number;
}

type Lang = 'fr' | 'nl';

const CHOICES_PER_QUESTION = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Réponse = le nom COMPLET du panneau, exactement tel qu'il est écrit dans le
 * catalogue. Ne surtout pas couper la parenthèse : chez plusieurs panneaux
 * belges c'est elle qui distingue une variante d'une autre — « Interdit aux
 * marchandises dangereuses (variante) » (C24a) devient sinon impossible à
 * différencier de C24, et « Chemin séparé piétons / cyclistes (côtés inversés) »
 * (D9b) de D9a. Le quiz doit poser le panneau tel qu'il est appris.
 */
function label(sign: SignDef): string {
  return sign.name.trim();
}

/**
 * Construit le quiz d'une catégorie : une question par panneau.
 *
 * Les distracteurs sont pris en priorité dans la MÊME catégorie (plus
 * plausibles, donc plus formateurs), puis complétés avec d'autres catégories si
 * elle est trop petite. On déduplique par libellé : plusieurs panneaux belges
 * partagent le même intitulé (B15a…B15g par ex.) et proposer deux fois la même
 * réponse rendrait la question insoluble.
 */
export function buildSignQuiz(catId: string, lang: Lang): SignQuizQuestion[] {
  const signs = getSignsByCategory(catId, lang);
  if (signs.length === 0) return [];

  // Réservoir de repli : tous les autres panneaux du site
  const all = getAllSignsLocalized(lang);
  const fallbackLabels: string[] = [];
  for (const [id, list] of Object.entries(all)) {
    if (id === catId) continue;
    for (const s of list) fallbackLabels.push(label(s));
  }

  const sameCatLabels = signs.map(label);

  const questions = signs.map(sign => {
    const answer = label(sign);

    // Distracteurs de la même catégorie, dédupliqués et jamais égaux à la réponse
    const pool = Array.from(new Set(sameCatLabels.filter(l => l !== answer)));
    let distractors = shuffle(pool).slice(0, CHOICES_PER_QUESTION - 1);

    // Catégorie trop petite (ou trop d'homonymes) : on complète ailleurs
    if (distractors.length < CHOICES_PER_QUESTION - 1) {
      const taken = new Set([answer, ...distractors]);
      const extra = shuffle(Array.from(new Set(fallbackLabels.filter(l => !taken.has(l)))));
      distractors = distractors.concat(extra.slice(0, CHOICES_PER_QUESTION - 1 - distractors.length));
    }

    const choices = shuffle([answer, ...distractors]);
    return {
      code: sign.code,
      choices,
      correct: choices.indexOf(answer),
    };
  });

  return shuffle(questions);
}

/**
 * Anciennes URLs de quiz (?cat=BC, ?cat=SOL) : le quiz utilise désormais les
 * mêmes identifiants que le catalogue des panneaux. On redirige les vieux liens
 * plutôt que de les laisser tomber sur une page vide.
 */
export const LEGACY_QUIZ_CAT: Record<string, string> = {
  BC: 'C',
  SOL: 'LIGNE',
};
