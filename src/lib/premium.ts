'use client';

import { useState, useEffect } from 'react';
import { getActiveLicense } from './license';

const KEY_PREMIUM = 'isPremium';
const TURBO_DAILY_LIMIT = 3;

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
 * Permis B : thème A gratuit, thèmes B-I premium.
 * Permis AM : TOUT est gratuit (décision produit — l'AM est le produit
 * d'appel vers le B ; l'adoption se mesure via license_events).
 * Le catalogue des panneaux, contenu PARTAGÉ entre permis, ne passe pas par
 * ici : il garde son gating premium propre dans les deux modes.
 */
export function isThemeFree(themeCode: string): boolean {
  if (getActiveLicense() === 'AM') return true;
  return themeCode === 'A';
}

// ── Turbo daily limit ──

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTurboDailyCount(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(`turbo_count_${todayKey()}`);
  return raw ? parseInt(raw, 10) : 0;
}

export function incrementTurboDailyCount(): void {
  if (typeof window === 'undefined') return;
  // AM = illimité : ne consomme jamais le quota quotidien du permis B
  if (getActiveLicense() === 'AM') return;
  const key = `turbo_count_${todayKey()}`;
  const current = getTurboDailyCount();
  localStorage.setItem(key, String(current + 1));
}

export function canPlayTurbo(): boolean {
  if (getActiveLicense() === 'AM') return true; // AM : illimité (gratuit)
  if (isPremium()) return true;
  return getTurboDailyCount() < TURBO_DAILY_LIMIT;
}

export function turboRemainingToday(): number {
  if (getActiveLicense() === 'AM' || isPremium()) return Infinity;
  return Math.max(0, TURBO_DAILY_LIMIT - getTurboDailyCount());
}

// ── Exam daily limit (1/jour) ──

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getLastExamWeek(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`exam_usage_${todayDate()}`);
}

export function recordExamPlayed(): void {
  if (typeof window === 'undefined') return;
  // AM = illimité : un examen AM ne consomme pas l'examen quotidien du permis B
  if (getActiveLicense() === 'AM') return;
  localStorage.setItem(`exam_usage_${todayDate()}`, '1');
}

export function canPlayExam(): boolean {
  if (getActiveLicense() === 'AM') return true; // AM : examens illimités (gratuit)
  if (isPremium()) return true;
  if (typeof window === 'undefined') return true;
  return !localStorage.getItem(`exam_usage_${todayDate()}`);
}

export function daysUntilNextExam(): number {
  return canPlayExam() ? 0 : 1;
}
