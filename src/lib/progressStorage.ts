'use client';

// localStorage wrapper replacing AsyncStorage from React Native
//
// Multi-permis : les clés de progression (étoiles, examens, leçons…) sont
// préfixées par permis via scopedKey — le B garde ses clés historiques sans
// préfixe. XP, streak, temps d'étude et panneaux maîtrisés restent GLOBAUX
// au compte (partagés entre permis), comme le streak Duolingo.

import { scopedKey } from './license';

const KEY_STARS = '@progress_stars';
const KEY_THEMES = '@progress_themes';
const KEY_EXAMS = '@progress_exams';
const KEY_QUIZ = 'quizHistory';
const KEY_STREAK = 'streakData';
const KEY_XP = 'xpData';

// Clés scopées au permis actif
function getItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(scopedKey(key));
}

function setItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(scopedKey(key), value);
}

// Clés globales au compte (jamais préfixées) — et lectures/écritures des
// données B brutes pour la synchro Supabase, quel que soit le permis actif
function getItemGlobal(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function setItemGlobal(key: string, value: string): void {
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
  try {
    const stored = getItem(KEY_THEMES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Par défaut : tous les thèmes débloqués (version web gratuite)
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  } catch {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  }
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
  const raw = getItemGlobal(KEY_STREAK);
  if (!raw) return { currentStreak: 0, lastActiveDate: '', bestStreak: 0 };
  return JSON.parse(raw) as StreakData;
}

export function checkAndUpdateStreak(): StreakData {
  const data = getStreakData();
  // No prior activity — initialise le streak au premier passage
  if (!data.lastActiveDate) {
    const today = new Date().toISOString().split('T')[0];
    const fresh = { ...data, lastActiveDate: today, currentStreak: 1, bestStreak: Math.max(1, data.bestStreak || 0) };
    setItemGlobal(KEY_STREAK, JSON.stringify(fresh));
    return fresh;
  }
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
  setItemGlobal(KEY_STREAK, JSON.stringify(updated));
  return updated;
}

// ── XP Data ──
export interface XPData {
  totalXP: number;
  level: number;
}

// ── Niveau depuis XP total : niveau(N) = (N-1)² × 30 ──────────
// Inverse : Math.floor(Math.sqrt(totalXP / 30)) + 1
// Seuils clés : niv.5 = 480 XP, niv.10 = 2 430 XP, niv.20 = 10 830 XP
function calcLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 30)) + 1;
}

export function getXPData(): XPData {
  const raw = getItemGlobal(KEY_XP);
  if (!raw) return { totalXP: 0, level: 1 };
  const data = JSON.parse(raw) as XPData;
  return { totalXP: data.totalXP, level: calcLevel(data.totalXP) };
}

export function updateXP(xpToAdd: number): XPData & { prevLevel: number } {
  const current = getXPData();
  const prevLevel = current.level;
  const totalXP = current.totalXP + xpToAdd;
  const level = calcLevel(totalXP);
  const updated: XPData = { totalXP, level };
  setItemGlobal(KEY_XP, JSON.stringify(updated));
  return { ...updated, prevLevel };
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

/** Toutes les parties complétées, tous lessonId confondus — pour la synchro Supabase. */
export function getAllCompletedParties(): Record<string, number[]> {
  if (typeof window === 'undefined') return {};
  // Préfixe scopé : sous B = 'lessonPartiesDone_' (les clés AM::… ne matchent pas) ;
  // sous AM = 'AM::lessonPartiesDone_'
  const prefix = scopedKey('lessonPartiesDone_');
  const result: Record<string, number[]> = {};
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(prefix)) continue;
    const lessonId = key.slice(prefix.length);
    try {
      const arr = JSON.parse(localStorage.getItem(key) ?? '[]');
      if (Array.isArray(arr) && arr.length > 0) result[lessonId] = arr;
    } catch {
      // ignore malformed entries
    }
  }
  return result;
}

/** Réécrit les parties complétées reçues de Supabase dans localStorage (une clé par leçon). */
export function applyCompletedPartiesFromRemote(remote: Record<string, number[]>): void {
  if (typeof window === 'undefined' || !remote) return;
  // Les colonnes Supabase contiennent la progression du permis B :
  // on écrit les clés B brutes, quel que soit le permis actif.
  for (const [lessonId, indices] of Object.entries(remote)) {
    if (Array.isArray(indices) && indices.length > 0) {
      setItemGlobal(lessonPartiesDoneKey(lessonId), JSON.stringify(indices));
    }
  }
}

// ── Panneaux maîtrisés (flashcards) ──
// Même clé que PanneauxFlashPanel — ici uniquement pour la synchro Supabase.
export function getPanneauxMastered(): Record<string, boolean> {
  const raw = getItemGlobal('panneaux_mastered');
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function applyPanneauxMasteredFromRemote(remote: Record<string, boolean>): void {
  if (typeof window === 'undefined' || !remote || Object.keys(remote).length === 0) return;
  // Fusion (union) avec le local : la maîtrise déjà acquise sur cet appareil
  // ne doit pas être perdue si le remote est plus pauvre.
  const merged = { ...getPanneauxMastered(), ...remote };
  setItemGlobal('panneaux_mastered', JSON.stringify(merged));
}

// ── Lesson ordered completion ──
export function isLessonCompleted(lessonId: string): boolean {
  if (typeof window === 'undefined') return false;
  if (getItem(`lesson_completed_${lessonId}`) === 'true') return true;
  // Fallback: stars > 0 means completed ≥ 70%
  return getStars(lessonId) > 0;
}

export function markLessonCompleted(lessonId: string): void {
  setItem(`lesson_completed_${lessonId}`, 'true');
}

export function isPartieCompleted(lessonId: string, partieIdx: number): boolean {
  if (typeof window === 'undefined') return false;
  if (getItem(`partie_completed_${lessonId}_p${partieIdx}`) === 'true') return true;
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
  const raw = getItemGlobal(KEY_STUDY_TIME);
  return raw ? Number(raw) : 0;
}

export function addStudyTime(seconds: number): void {
  if (seconds <= 0) return;
  const current = getStudyTime();
  setItemGlobal(KEY_STUDY_TIME, String(current + seconds));
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
  // Scopé au permis actif (sous B, scopedKey('') = '' → clés historiques),
  // plus les clés globales au compte (XP, streak, temps d'étude, panneaux)
  const pre = scopedKey('');
  const keys = Object.keys(localStorage);
  keys.forEach(k => {
    if (k.startsWith(pre + '@progress') || k.startsWith(pre + 'lessonProgress_') || k.startsWith(pre + 'lessonPartiesDone_') ||
        k.startsWith(pre + 'lesson_completed_') || k.startsWith(pre + 'partie_completed_') ||
        k === pre + KEY_QUIZ || k === pre + 'survie_best_score' ||
        k === KEY_STREAK || k === KEY_XP || k === KEY_STUDY_TIME ||
        k === 'panneaux_mastered') {
      localStorage.removeItem(k);
    }
  });
}

// ── Sync all progress to Supabase ──
// Les colonnes du profil (stars, exams, unlocked_themes…) contiennent la
// progression du PERMIS B. On lit donc les clés B brutes (sans préfixe),
// quel que soit le permis actif — sinon un utilisateur en mode AM écraserait
// ses colonnes B avec sa progression AM. La progression AM aura ses propres
// colonnes lors de la migration multi-permis (mission AM-5).
function rawJson<T>(key: string, fallback: T): T {
  const raw = getItemGlobal(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function getAllCompletedPartiesB(): Record<string, number[]> {
  if (typeof window === 'undefined') return {};
  const prefix = 'lessonPartiesDone_';
  const result: Record<string, number[]> = {};
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(prefix)) continue;
    const arr = rawJson<number[]>(key, []);
    if (Array.isArray(arr) && arr.length > 0) result[key.slice(prefix.length)] = arr;
  }
  return result;
}

export async function syncAllToSupabase(uid: string): Promise<void> {
  const { syncProgressToSupabase } = await import('./supabaseUser');
  await syncProgressToSupabase(uid, {
    stars: rawJson<Record<string, number>>(KEY_STARS, {}),
    themes: rawJson<string[]>(KEY_THEMES, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']),
    exams: rawJson<Record<string, boolean>>(KEY_EXAMS, {}),
    survivalBest: Number(getItemGlobal('survie_best_score') ?? 0),
    quizHistory: rawJson<QuizHistory>(KEY_QUIZ, { totalCorrect: 0, totalAnswers: 0 }),
    streakData: getStreakData(),
    xpData: getXPData(),
    lessonPartiesDone: getAllCompletedPartiesB(),
    panneauxMastered: getPanneauxMastered(),
  });
}

// ── Progression AM (clés AM::…) — synchro vers la colonne `progress_am` ──
// Lecture/écriture par clés brutes préfixées : fonctionne quel que soit le
// permis actif (ex. synchro au login alors que l'utilisateur est en mode B).

const AM = 'AM::';

function amJson<T>(key: string, fallback: T): T {
  const raw = getItemGlobal(AM + key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function getAmProgressSnapshot(): import('./supabaseUser').AmProgress {
  const parties: Record<string, number[]> = {};
  if (typeof window !== 'undefined') {
    const prefix = AM + 'lessonPartiesDone_';
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(prefix)) continue;
      try {
        const arr = JSON.parse(localStorage.getItem(key) ?? '[]');
        if (Array.isArray(arr) && arr.length > 0) parties[key.slice(prefix.length)] = arr;
      } catch { /* entrée corrompue ignorée */ }
    }
  }
  return {
    stars: amJson<Record<string, number>>(KEY_STARS, {}),
    exams: amJson<Record<string, boolean>>(KEY_EXAMS, {}),
    lessonPartiesDone: parties,
    quizHistory: amJson<QuizHistory>(KEY_QUIZ, { totalCorrect: 0, totalAnswers: 0 }),
    survivalBest: Number(getItemGlobal(AM + 'survie_best_score') ?? 0),
  };
}

/** Fusionne la progression AM distante dans le localStorage (le meilleur des deux gagne). */
export function applyAmProgressFromRemote(remote: Partial<import('./supabaseUser').AmProgress> | null): void {
  if (typeof window === 'undefined' || !remote) return;
  const local = getAmProgressSnapshot();

  const stars = { ...local.stars };
  for (const [k, v] of Object.entries(remote.stars ?? {})) stars[k] = Math.max(stars[k] ?? 0, v);
  setItemGlobal(AM + KEY_STARS, JSON.stringify(stars));

  const exams = { ...local.exams };
  for (const [k, v] of Object.entries(remote.exams ?? {})) if (v) exams[k] = true;
  setItemGlobal(AM + KEY_EXAMS, JSON.stringify(exams));

  for (const [lessonId, indices] of Object.entries(remote.lessonPartiesDone ?? {})) {
    if (!Array.isArray(indices) || indices.length === 0) continue;
    const merged = Array.from(new Set([...(local.lessonPartiesDone[lessonId] ?? []), ...indices]));
    setItemGlobal(AM + 'lessonPartiesDone_' + lessonId, JSON.stringify(merged));
  }

  const rq = remote.quizHistory;
  if (rq && rq.totalAnswers > local.quizHistory.totalAnswers) {
    setItemGlobal(AM + KEY_QUIZ, JSON.stringify(rq));
  }

  if ((remote.survivalBest ?? 0) > local.survivalBest) {
    setItemGlobal(AM + 'survie_best_score', String(remote.survivalBest));
  }
}

/** Pousse la progression AM locale vers Supabase (update isolé, jamais bloquant). */
export async function syncAmToSupabase(uid: string): Promise<void> {
  const { syncAmProgressToSupabase } = await import('./supabaseUser');
  await syncAmProgressToSupabase(uid, getAmProgressSnapshot());
}
