'use client';

import { BADGES } from './constants';
import { getAllStars, getStreakData, getQuizHistory, getXPData, getAllExams, getTurboAllTime } from './progressStorage';
import { THEME_ORDER } from './lessonData';

export function getUnlockedBadges(): string[] {
  if (typeof window === 'undefined') return [];

  // VIP users get all badges unlocked
  if (localStorage.getItem('permigo_vip') === 'true') {
    return BADGES.map(b => b.id);
  }

  const unlocked: string[] = [];
  const stars = getAllStars();
  const streak = getStreakData();
  const quiz = getQuizHistory();
  const xp = getXPData();
  const exams = getAllExams();
  const turbo = getTurboAllTime();

  const completedLessons = Object.values(stars).filter(s => s > 0).length;
  const hasAnyPerfect = Object.values(stars).some(s => s === 3);
  const accuracy = quiz.totalAnswers > 0 ? quiz.totalCorrect / quiz.totalAnswers : 0;
  const passedExams = Object.values(exams).filter(Boolean).length;

  // Count themes where at least 1 lesson has been completed (stars > 0) — real data only
  const themesWithProgress = THEME_ORDER.filter(code => {
    const themeKeys = Object.keys(stars).filter(k => k.startsWith(code) && (stars[k] ?? 0) > 0);
    return themeKeys.length > 0;
  });
  const themesUnlocked = themesWithProgress.length;

  // Survie: number of survie games played (not best score)
  const survieGames = turbo.gamesSurvie;

  // Progression
  if (completedLessons >= 1)  unlocked.push('first_step');
  if (completedLessons >= 5)  unlocked.push('on_fire');
  if (completedLessons >= 15) unlocked.push('bookworm');
  if (completedLessons >= 40) unlocked.push('champion');

  // Régularité
  if (streak.bestStreak >= 3)  unlocked.push('habit');
  if (streak.bestStreak >= 7)  unlocked.push('devoted');
  if (streak.bestStreak >= 30) unlocked.push('legend');

  // Précision
  if (hasAnyPerfect)                                     unlocked.push('perfectionist');
  if (accuracy >= 0.8 && quiz.totalAnswers >= 10)        unlocked.push('sharpshooter');
  if (accuracy >= 0.9 && quiz.totalAnswers >= 20)        unlocked.push('road_king');

  // Examens
  if (exams['A'])           unlocked.push('graduate');
  if (passedExams >= 3)     unlocked.push('honors');
  if (passedExams >= 8)     unlocked.push('major');

  // Survie (games played, not best score)
  if (survieGames >= 10) unlocked.push('survivor');
  if (survieGames >= 20) unlocked.push('pilot');
  if (survieGames >= 30) unlocked.push('invincible');

  // Exploration (themes with real lesson progress)
  if (themesUnlocked >= 3) unlocked.push('explorer');
  if (themesUnlocked >= 5) unlocked.push('unlocker');
  if (themesUnlocked >= 9) unlocked.push('traveler');

  // Niveaux
  if (xp.level >= 5)  unlocked.push('level5');
  if (xp.level >= 10) unlocked.push('level10');
  if (xp.level >= 20) unlocked.push('level20');

  return unlocked;
}

export function getBadgeById(id: string) {
  return BADGES.find(b => b.id === id);
}
