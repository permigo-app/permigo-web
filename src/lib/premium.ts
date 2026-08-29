'use client';

import { useState, useEffect } from 'react';
import { getActiveLicense } from './license';

const KEY_PREMIUM = 'isPremium';

// Formule d'essai "tout payant" : un seul contenu gratuit (la 1ère leçon du
// thème A, permis B) + un aperçu à usage unique (pas par jour) pour Turbo et
// l'examen blanc. Au-delà, Premium requis. Le permis AM reste entièrement
// gratuit (produit d'appel, décision produit distincte — voir isThemeFree).
export const FREE_LESSON_ID = 'A1';
const TURBO_FREE_LIFETIME_LIMIT = 1;

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
export const FREE_FLASHCARDS_PER_LESSON = 5;

/** Nombre de fiches consultables sans Premium pour une leçon donnée. */
export function flashcardsLimitForLesson(lessonId: string): number {
  if (getActiveLicense() === 'AM') return Infinity; // AM entièrement gratuit
  if (isPremium()) return Infinity;
  if (isLessonFree(lessonId)) return Infinity; // la leçon A1 reste gratuite en entier
  return FREE_FLASHCARDS_PER_LESSON;
}

// ── Turbo : aperçu à usage unique (plus un quota quotidien) ──

export function getTurboLifetimeCount(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem('turbo_count_lifetime');
  return raw ? parseInt(raw, 10) : 0;
}

export function incrementTurboDailyCount(): void {
  if (typeof window === 'undefined') return;
  // AM = illimité : ne consomme jamais l'aperçu gratuit du permis B
  if (getActiveLicense() === 'AM') return;
  localStorage.setItem('turbo_count_lifetime', String(getTurboLifetimeCount() + 1));
}

export function canPlayTurbo(): boolean {
  if (getActiveLicense() === 'AM') return true; // AM : illimité (gratuit)
  if (isPremium()) return true;
  return getTurboLifetimeCount() < TURBO_FREE_LIFETIME_LIMIT;
}

export function turboRemainingToday(): number {
  if (getActiveLicense() === 'AM' || isPremium()) return Infinity;
  return Math.max(0, TURBO_FREE_LIFETIME_LIMIT - getTurboLifetimeCount());
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
