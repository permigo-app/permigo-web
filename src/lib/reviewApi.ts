'use client';

import { supabase } from './supabase';

async function getToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

/** Record a question answer for spaced repetition. Fire-and-forget safe. */
export async function recordQuestionReview(
  questionId: string,
  isCorrect: boolean,
  timeSpent: number,
): Promise<void> {
  const token = await getToken();
  if (!token) return; // guest — skip silently

  try {
    const res = await fetch('/api/reviews/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ questionId, isCorrect, timeSpent }),
    });
    if (!res.ok) {
      console.warn('[Reviews] answer record failed:', res.status);
    }
  } catch (e) {
    console.warn('[Reviews] answer record error:', e);
  }
}

/** Fetch due question IDs (authenticated). Returns [] for guests. */
export async function fetchDueReviews(): Promise<{
  question_id: string;
  streak_correct: number;
  difficulty_level: string;
  next_review_at: string;
}[]> {
  const token = await getToken();
  if (!token) return [];

  try {
    const res = await fetch('/api/reviews/due', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.reviews ?? [];
  } catch {
    return [];
  }
}

/** Fetch review stats (authenticated). Returns zeros for guests. */
export async function fetchReviewStats(): Promise<{
  dueCount: number;
  learningCount: number;
  masteredCount: number;
  totalReviewed: number;
}> {
  const token = await getToken();
  if (!token) return { dueCount: 0, learningCount: 0, masteredCount: 0, totalReviewed: 0 };

  try {
    const res = await fetch('/api/reviews/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { dueCount: 0, learningCount: 0, masteredCount: 0, totalReviewed: 0 };
    return await res.json();
  } catch {
    return { dueCount: 0, learningCount: 0, masteredCount: 0, totalReviewed: 0 };
  }
}
