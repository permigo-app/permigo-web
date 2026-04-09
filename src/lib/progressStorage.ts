'use client';

// localStorage wrapper replacing AsyncStorage from React Native

const KEY_STARS = '@progress_stars';
const KEY_THEMES = '@progress_themes';
const KEY_EXAMS = '@progress_exams';
const KEY_QUIZ = 'quizHistory';
const KEY_STREAK = 'streakData';
const KEY_XP = 'xpData';

function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function setItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

// ── Stars ──
export function getStars(lessonId: string): number {
  const raw = getItem(KEY_STARS);
  if (!raw) return 0;
  const obj = JSON.parse(raw) as Record<string, number>;
  return obj[lessonId] ?? 0;
}

export function setStars(lessonId: string, stars: number): void {
  const raw = getItem(KEY_STARS);
  const obj: Record<string, number> = raw ? JSON.parse(raw) : {};
  if (stars > (obj[lessonId] ?? 0)) {
    obj[lessonId] = stars;
    setItem(KEY_STARS, JSON.stringify(obj));
  }
}

export function getAllStars(): Record<string, number> {
  const raw = getItem(KEY_STARS);
  return raw ? JSON.parse(raw) : {};
}

// ── Unlocked themes ──
export function getUnlockedThemes(): string[] {
  // All themes unlocked by default on web
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
}

export function unlockTheme(themeCode: string): void {
  const themes = getUnlockedThemes();
  if (!themes.includes(themeCode)) {
    themes.push(themeCode);
    setItem(KEY_THEMES, JSON.stringify(themes));
  }
}

// ── Exams ──
export function isExamPassed(themeCode: string): boolean {
  const raw = getItem(KEY_EXAMS);
  if (!raw) return false;
  const obj = JSON.parse(raw) as Record<string, boolean>;
  return obj[themeCode] === true;
}

export function setExamPassed(themeCode: string): void {
  const raw = getItem(KEY_EXAMS);
  const obj: Record<string, boolean> = raw ? JSON.parse(raw) : {};
  obj[themeCode] = true;
  setItem(KEY_EXAMS, JSON.stringify(obj));
}

export function getAllExams(): Record<string, boolean> {
  const raw = getItem(KEY_EXAMS);
  return raw ? JSON.parse(raw) : {};
}

// ── Quiz History ──
export interface QuizHistory {
  totalCorrect: number;
  totalAnswers: number;
}

export function getQuizHistory(): QuizHistory {
  const raw = getItem(KEY_QUIZ);
  if (!raw) return { totalCorrect: 0, totalAnswers: 0 };
  return JSON.parse(raw) as QuizHistory;
}

export function updateQuizHistory(correct: number, total: number): void {
  const current = getQuizHistory();
  const updated: QuizHistory = {
    totalCorrect: current.totalCorrect + correct,
    totalAnswers: current.totalAnswers + total,
  };
  setItem(KEY_QUIZ, JSON.stringify(updated));
}

// ── Streak Data ──
export interface StreakData {
  currentStreak: number;
  lastActiveDate: string;
  bestStreak: number;
}

export function getStreakData(): StreakData {
  const raw = getItem(KEY_STREAK);
  if (!raw) return { currentStreak: 0, lastActiveDate: '', bestStreak: 0 };
  return JSON.parse(raw) as StreakData;
}

export function checkAndUpdateStreak(): StreakData {
  const data = getStreakData();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let { currentStreak, bestStreak } = data;
  if (data.lastActiveDate === today) return data;
  if (data.lastActiveDate === yesterday) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }
  bestStreak = Math.max(bestStreak, currentStreak);
  const updated: StreakData = { currentStreak, lastActiveDate: today, bestStreak };
  setItem(KEY_STREAK, JSON.stringify(updated));
  return updated;
}

// ── XP Data ──
export interface XPData {
  totalXP: number;
  level: number;
}

export function getXPData(): XPData {
  const raw = getItem(KEY_XP);
  if (!raw) return { totalXP: 0, level: 1 };
  const data = JSON.parse(raw) as XPData;
  const level = Math.floor(data.totalXP / 100) + 1;
  return { totalXP: data.totalXP, level };
}

export function updateXP(xpToAdd: number): XPData {
  const current = getXPData();
  const totalXP = current.totalXP + xpToAdd;
  const level = Math.floor(totalXP / 100) + 1;
  const updated: XPData = { totalXP, level };
  setItem(KEY_XP, JSON.stringify(updated));
  return updated;
}

// ── Lesson Progress ──
export interface LessonProgress {
  cardsViewed: number;
  total: number;
  quizDone: boolean;
}

function lessonProgressKey(lessonId: string): string {
  return `lessonProgress_${lessonId}`;
}

export function getLessonProgress(lessonId: string): LessonProgress {
  const raw = getItem(lessonProgressKey(lessonId));
  if (!raw) return { cardsViewed: 0, total: 0, quizDone: false };
  return JSON.parse(raw);
}

export function saveLessonCardProgress(lessonId: string, cardsViewed: number, total: number): void {
  const existing = getLessonProgress(lessonId);
  if (cardsViewed > existing.cardsViewed) {
    setItem(lessonProgressKey(lessonId), JSON.stringify({ ...existing, cardsViewed, total }));
  }
}

export function saveLessonQuizDone(lessonId: string): void {
  const existing = getLessonProgress(lessonId);
  setItem(lessonProgressKey(lessonId), JSON.stringify({ ...existing, quizDone: true }));
}

// ── Completed Parties ──
function lessonPartiesDoneKey(lessonId: string): string {
  return `lessonPartiesDone_${lessonId}`;
}

export function getCompletedParties(lessonId: string): number[] {
  const raw = getItem(lessonPartiesDoneKey(lessonId));
  return raw ? JSON.parse(raw) : [];
}

export function markPartieDone(lessonId: string, partieIndex: number): void {
  const done = getCompletedParties(lessonId);
  if (!done.includes(partieIndex)) {
    done.push(partieIndex);
    setItem(lessonPartiesDoneKey(lessonId), JSON.stringify(done));
  }
  setItem(`partie_completed_${lessonId}_p${partieIndex}`, 'true');
}

// ── Lesson ordered completion ──
export function isLessonCompleted(lessonId: string): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(`lesson_completed_${lessonId}`) === 'true') return true;
  // Fallback: stars > 0 means completed ≥ 70%
  return getStars(lessonId) > 0;
}

export function markLessonCompleted(lessonId: string): void {
  setItem(`lesson_completed_${lessonId}`, 'true');
}

export function isPartieCompleted(lessonId: string, partieIdx: number): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(`partie_completed_${lessonId}_p${partieIdx}`) === 'true') return true;
  return getCompletedParties(lessonId).includes(partieIdx);
}

// ── Survival best score ──
export function getSurvivalBest(): number {
  const raw = getItem('survie_best_score');
  return raw ? Number(raw) : 0;
}

export function setSurvivalBest(score: number): void {
  const current = getSurvivalBest();
  if (score > current) {
    setItem('survie_best_score', String(score));
  }
}

// ── Turbo best scores (per mode) ──
export function getTurboBest(mode: '3min' | '5min' | 'survie'): number {
  const raw = getItem(`turbo_best_${mode}`);
  return raw ? Number(raw) : 0;
}

export function setTurboBest(mode: '3min' | '5min' | 'survie', score: number): void {
  const current = getTurboBest(mode);
  if (score > current) {
    setItem(`turbo_best_${mode}`, String(score));
  }
}

// ── Turbo session history ──
export interface TurboSession {
  date: string;
  mode: '3min' | '5min' | 'survie';
  score: number;
  total: number;
}

export function getTurboHistory(): TurboSession[] {
  const raw = getItem('turbo_history');
  return raw ? JSON.parse(raw) : [];
}

export function addTurboSession(session: TurboSession): void {
  const history = getTurboHistory();
  history.unshift(session);
  if (history.length > 20) history.length = 20;
  setItem('turbo_history', JSON.stringify(history));
}

// ── Turbo all-time stats ──
export interface TurboAllTimeStats {
  games3min: number;
  games5min: number;
  gamesSurvie: number;
  timeSeconds: number;
}

export function getTurboAllTime(): TurboAllTimeStats {
  const raw = getItem('turbo_alltime');
  if (raw) return JSON.parse(raw);
  return { games3min: 0, games5min: 0, gamesSurvie: 0, timeSeconds: 0 };
}

export function addTurboAllTime(mode: '3min' | '5min' | 'survie', timeSeconds: number): void {
  const current = getTurboAllTime();
  if (mode === '3min') current.games3min += 1;
  else if (mode === '5min') current.games5min += 1;
  else current.gamesSurvie += 1;
  current.timeSeconds += timeSeconds;
  setItem('turbo_alltime', JSON.stringify(current));
}

// ── Study time tracking (seconds) ──
const KEY_STUDY_TIME = '@study_time';

export function getStudyTime(): number {
  const raw = getItem(KEY_STUDY_TIME);
  return raw ? Number(raw) : 0;
}

export function addStudyTime(seconds: number): void {
  if (seconds <= 0) return;
  const current = getStudyTime();
  setItem(KEY_STUDY_TIME, String(current + seconds));
}

export function formatStudyTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${String(minutes).padStart(2, '0')}`;
}

// ── Reset all progress ──
export function resetAllProgress(): void {
  if (typeof window === 'undefined') return;
  const keys = Object.keys(localStorage);
  keys.forEach(k => {
    if (k.startsWith('@progress') || k.startsWith('lessonProgress_') || k.startsWith('lessonPartiesDone_') ||
        k === KEY_QUIZ || k === KEY_STREAK || k === KEY_XP || k === KEY_STUDY_TIME || k === 'survie_best_score') {
      localStorage.removeItem(k);
    }
  });
}

// ── Sync all progress to Supabase ──
export async function syncAllToSupabase(uid: string): Promise<void> {
  const { syncProgressToSupabase } = await import('./supabaseUser');
  await syncProgressToSupabase(uid, {
    stars: getAllStars(),
    themes: getUnlockedThemes(),
    exams: getAllExams(),
    survivalBest: getSurvivalBest(),
    quizHistory: getQuizHistory(),
    streakData: getStreakData(),
    xpData: getXPData(),
  });
}
