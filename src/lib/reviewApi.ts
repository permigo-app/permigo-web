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

/** Fetch question IDs ever answered incorrectly (authenticated). Returns [] for guests. */
export async function fetchMistakes(): Promise<string[]> {
  const token = await getToken();
  if (!token) return [];

  try {
    const res = await fetch('/api/reviews/mistakes', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.mistakes ?? [];
  } catch {
    return [];
  }
}
