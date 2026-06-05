import { useEffect } from 'react';
import { getStreakData } from '@/lib/progressStorage';
import { dispatchStreak } from '@/lib/rewardEvents';

const STREAK_CELEBRATED_KEY = 'streak_celebrated_today';

export function useStreakCelebration() {
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastCelebrated = localStorage.getItem(STREAK_CELEBRATED_KEY);
    if (lastCelebrated === today) return;

    const streak = getStreakData();
    if (streak.currentStreak >= 1) {
      localStorage.setItem(STREAK_CELEBRATED_KEY, today);
      dispatchStreak(streak.currentStreak, streak.currentStreak === 1 && streak.bestStreak > 1);
    }
  }, []);
}
