'use client';

const KEY_PREMIUM = 'isPremium';
const TURBO_DAILY_LIMIT = 5;

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

// ── Exam weekly limit ──

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD of Monday
}

export function getLastExamWeek(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('last_exam_week');
}

export function recordExamPlayed(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('last_exam_week', getWeekStart(new Date()));
}

export function canPlayExam(): boolean {
  if (isPremium()) return true;
  const lastWeek = getLastExamWeek();
  if (!lastWeek) return true;
  return lastWeek !== getWeekStart(new Date());
}

export function daysUntilNextExam(): number {
  const lastWeek = getLastExamWeek();
  if (!lastWeek) return 0;
  const nextMonday = new Date(lastWeek);
  nextMonday.setDate(nextMonday.getDate() + 7);
  const diff = Math.ceil((nextMonday.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}
