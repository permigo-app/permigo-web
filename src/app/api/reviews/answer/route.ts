import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateNextReview, type DifficultyLevel } from '@/lib/spacedRepetition';

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = makeClient(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { questionId, isCorrect, timeSpent } = await req.json();
  if (!questionId) return NextResponse.json({ error: 'questionId required' }, { status: 400 });

  // Get current record if it exists
  const { data: existing } = await supabase
    .from('question_reviews')
    .select('streak_correct, total_attempts, total_correct, difficulty_level')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .maybeSingle();

  const currentStreak = existing?.streak_correct ?? 0;
  const currentDifficulty = (existing?.difficulty_level ?? 'new') as DifficultyLevel;
  const totalAttempts = (existing?.total_attempts ?? 0) + 1;
  const totalCorrect = (existing?.total_correct ?? 0) + (isCorrect ? 1 : 0);

  const result = calculateNextReview({
    isCorrect,
    timeSpent: timeSpent ?? 0,
    currentStreak,
    currentDifficulty,
  });

  const now = new Date().toISOString();

  const { error } = await supabase
    .from('question_reviews')
    .upsert({
      user_id: user.id,
      question_id: questionId,
      last_answered_at: now,
      next_review_at: result.nextReviewAt.toISOString(),
      streak_correct: result.newStreak,
      total_attempts: totalAttempts,
      total_correct: totalCorrect,
      difficulty_level: result.newDifficulty,
      updated_at: now,
    }, { onConflict: 'user_id,question_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    newDifficulty: result.newDifficulty,
    newStreak: result.newStreak,
    nextReviewAt: result.nextReviewAt.toISOString(),
    intervalDays: result.intervalDays,
  });
}
