'use client';

import { useState, useEffect } from 'react';
import { getActiveLicense } from './license';

const KEY_PREMIUM = 'isPremium';

// MODÈLE : « gratuit pour apprendre, payant pour s'entraîner ».
//
//   Gratuit  — toute la théorie des 9 thèmes (cartes + fiches flash), tout le
//              catalogue des panneaux, la banque d'erreurs, le quiz de la
//              leçon A1, une session Turbo PAR JOUR, un examen blanc à vie.
//   Premium  — les 1 770 questions des leçons, les examens illimités, le Turbo
//              illimité, le quiz des 10 catégories de panneaux.
//
// C'est le découpage des concurrents belges, qui offrent tous leur cours et
// facturent l'entraînement. Le permis AM, lui, reste entièrement gratuit
// (produit d'appel — voir isThemeFree).
export const FREE_LESSON_ID = 'A1';

// Turbo : un essai PAR JOUR et non un seul à vie. Un essai à vie se consomme
// et ne donne plus jamais de raison de revenir ; un quota quotidien installe
// l'habitude, et c'est l'habitude qui finit par convertir.
const TURBO_FREE_PER_DAY = 1;

export function isPremium(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY_PREMIUM) === 'true';
}

export function setPremium(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem(KEY_PREMIUM, 'true');
  } else {
    localStorage.removeItem(KEY_PREMIUM);
  }
  window.dispatchEvent(new Event('premiumStatusChanged'));
}

export function useIsPremium(): boolean {
  const [premium, setPremiumState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEY_PREMIUM) === 'true';
  });

  useEffect(() => {
    const sync = () => setPremiumState(localStorage.getItem(KEY_PREMIUM) === 'true');
    window.addEventListener('premiumStatusChanged', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('premiumStatusChanged', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return premium;
}

/**
 * Permis B : plus aucun thème entier n'est gratuit — seule la 1ère leçon du
 * thème A l'est (voir isLessonFree). Cette fonction ne sert plus qu'à
 * l'exception permis AM.
 * Permis AM : TOUT est gratuit (décision produit — l'AM est le produit
 * d'appel vers le B ; l'adoption se mesure via license_events).
 * Le catalogue des panneaux, contenu PARTAGÉ entre permis, ne passe pas par
 * ici : il garde son gating premium propre dans les deux modes.
 */
export function isThemeFree(themeCode: string): boolean {
  return getActiveLicense() === 'AM';
}

/** Seule la toute première leçon (A1) reste consultable sans Premium — un aperçu, pas un thème entier. */
export function isLessonFree(lessonId: string): boolean {
  if (getActiveLicense() === 'AM') return true;
  return lessonId === FREE_LESSON_ID;
}

// ── Flashcards : aperçu de 5 fiches par leçon ──

/**
 * Le mode flash n'est plus verrouillé en bloc : un utilisateur gratuit voit les
 * 5 premières fiches de CHAQUE leçon, puis la porte Premium. Objectif produit :
 * qu'il sache à quoi ressemble une fiche avant de payer.
 */
// Les fiches flash SONT la théorie, sous une autre forme. Depuis que le cours
// est gratuit dans les 9 thèmes, les limiter serait incohérent : on garde la
// constante pour l'affichage éventuel, mais la limite ne s'applique plus.
export const FREE_FLASHCARDS_PER_LESSON = Infinity;

/** Nombre de fiches consultables sans Premium pour une leçon donnée. */
export function flashcardsLimitForLesson(lessonId: string): number {
  if (getActiveLicense() === 'AM') return Infinity; // AM entièrement gratuit
  if (isPremium()) return Infinity;
  if (isLessonFree(lessonId)) return Infinity; // la leçon A1 reste gratuite en entier
  return FREE_FLASHCARDS_PER_LESSON;
}

// ── Turbo : aperçu à usage unique (plus un quota quotidien) ──

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // AAAA-MM-JJ, remis à zéro chaque nuit
}

/** Nombre de parties Turbo jouées aujourd'hui (0 si on a changé de jour). */
export function getTurboLifetimeCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('turbo_count_day');
    if (!raw) return 0;
    const { day, n } = JSON.parse(raw);
    return day === todayKey() ? (n || 0) : 0;
  } catch {
    return 0;
  }
}

export function incrementTurboDailyCount(): void {
  if (typeof window === 'undefined') return;
  // AM = illimité : ne consomme jamais le quota du permis B
  if (getActiveLicense() === 'AM') return;
  localStorage.setItem('turbo_count_day', JSON.stringify({ day: todayKey(), n: getTurboLifetimeCount() + 1 }));
}

export function canPlayTurbo(): boolean {
  if (getActiveLicense() === 'AM') return true; // AM : illimité (gratuit)
  if (isPremium()) return true;
  return getTurboLifetimeCount() < TURBO_FREE_PER_DAY;
}

export function turboRemainingToday(): number {
  if (getActiveLicense() === 'AM' || isPremium()) return Infinity;
  return Math.max(0, TURBO_FREE_PER_DAY - getTurboLifetimeCount());
}

// ── Examen blanc : 1 essai gratuit à vie (plus un quota quotidien) ──

export function recordExamPlayed(): void {
  if (typeof window === 'undefined') return;
  // AM = illimité : un examen AM ne consomme pas l'essai gratuit du permis B
  if (getActiveLicense() === 'AM') return;
  localStorage.setItem('exam_usage_lifetime', '1');
}

export function canPlayExam(): boolean {
  if (getActiveLicense() === 'AM') return true; // AM : examens illimités (gratuit)
  if (isPremium()) return true;
  if (typeof window === 'undefined') return true;
  return !localStorage.getItem('exam_usage_lifetime');
}
