'use client';

import { BADGES } from './constants';
import { getAllStars, getStreakData, getQuizHistory, getXPData, getUnlockedThemes, getAllExams, getSurvivalBest } from './progressStorage';

export function getUnlockedBadges(): string[] {
  const unlocked: string[] = [];
  const stars = getAllStars();
  const streak = getStreakData();
  const quiz = getQuizHistory();
  const xp = getXPData();
  const themes = getUnlockedThemes();
  const exams = getAllExams();
  const survivalBest = getSurvivalBest();

  const completedLessons = Object.values(stars).filter(s => s > 0).length;
  const hasAnyPerfect = Object.values(stars).some(s => s === 3);
  const accuracy = quiz.totalAnswers > 0 ? quiz.totalCorrect / quiz.totalAnswers : 0;
  const passedExams = Object.values(exams).filter(Boolean).length;

  // Progression
  if (completedLessons >= 1) unlocked.push('first_step');
  if (completedLessons >= 5) unlocked.push('on_fire');
  if (completedLessons >= 15) unlocked.push('bookworm');
  if (completedLessons >= 40) unlocked.push('champion');

  // Régularité
  if (streak.bestStreak >= 3) unlocked.push('habit');
  if (streak.bestStreak >= 7) unlocked.push('devoted');
  if (streak.bestStreak >= 30) unlocked.push('legend');

  // Précision
  if (hasAnyPerfect) unlocked.push('perfectionist');
  if (accuracy >= 0.8 && quiz.totalAnswers >= 10) unlocked.push('sharpshooter');
  if (accuracy >= 0.9 && quiz.totalAnswers >= 20) unlocked.push('road_king');

  // Examens
  if (exams['A']) unlocked.push('graduate');
  if (passedExams >= 3) unlocked.push('honors');
  if (passedExams >= 8) unlocked.push('major');

  // Survie
  if (survivalBest >= 10) unlocked.push('survivor');
  if (survivalBest >= 20) unlocked.push('pilot');
  if (survivalBest >= 30) unlocked.push('invincible');

  // Exploration
  if (themes.length >= 3) unlocked.push('explorer');
  if (themes.length >= 5) unlocked.push('unlocker');
  if (themes.length >= 9) unlocked.push('traveler');

  // Niveaux
  if (xp.level >= 5) unlocked.push('level5');
  if (xp.level >= 10) unlocked.push('level10');
  if (xp.level >= 20) unlocked.push('level20');

  return unlocked;
}

export function getBadgeById(id: string) {
  return BADGES.find(b => b.id === id);
}
