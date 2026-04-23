export type DifficultyLevel = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface ReviewResult {
  nextReviewAt: Date;
  newDifficulty: DifficultyLevel;
  newStreak: number;
  intervalDays: number;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function calculateNextReview(params: {
  isCorrect: boolean;
  timeSpent: number;
  currentStreak: number;
  currentDifficulty: DifficultyLevel;
}): ReviewResult {
  const { isCorrect, timeSpent, currentStreak } = params;
  const now = new Date();

  if (!isCorrect) {
    return {
      nextReviewAt: addDays(now, 1),
      newDifficulty: 'learning',
      newStreak: 0,
      intervalDays: 1,
    };
  }

  const newStreak = currentStreak + 1;

  // Slow correct answer (>15s) — still needs reinforcement
  if (timeSpent > 15) {
    return {
      nextReviewAt: addDays(now, 3),
      newDifficulty: newStreak >= 2 ? 'reviewing' : 'learning',
      newStreak,
      intervalDays: 3,
    };
  }

  // Fast correct answer
  if (newStreak < 3) {
    return {
      nextReviewAt: addDays(now, 7),
      newDifficulty: 'reviewing',
      newStreak,
      intervalDays: 7,
    };
  }

  return {
    nextReviewAt: addDays(now, 30),
    newDifficulty: 'mastered',
    newStreak,
    intervalDays: 30,
  };
}
