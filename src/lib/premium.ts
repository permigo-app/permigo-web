'use client';

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
}

/** Theme A is always free. Themes B-I require premium. */
export function isThemeFree(themeCode: string): boolean {
  return themeCode === 'A';
}

// ── Turbo daily limit ──

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function getTurboDailyCount(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(`turbo_count_${todayKey()}`);
  return raw ? parseInt(raw, 10) : 0;
}

export function incrementTurboDailyCount(): void {
  if (typeof window === 'undefined') return;
  const key = `turbo_count_${todayKey()}`;
  const current = getTurboDailyCount();
  localStorage.setItem(key, String(current + 1));
}

export function canPlayTurbo(): boolean {
  if (isPremium()) return true;
  return getTurboDailyCount() < TURBO_DAILY_LIMIT;
}

export function turboRemainingToday(): number {
  if (isPremium()) return Infinity;
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
  localStorage.setItem(`exam_usage_${todayDate()}`, '1');
}

export function canPlayExam(): boolean {
  if (isPremium()) return true;
  if (typeof window === 'undefined') return true;
  return !localStorage.getItem(`exam_usage_${todayDate()}`);
}

export function daysUntilNextExam(): number {
  return canPlayExam() ? 0 : 1;
}
