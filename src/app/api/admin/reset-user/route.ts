import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ZERO_PROGRESS = {
  stars: {},
  unlocked_themes: ['A'],
  exams: {},
  survival_best: 0,
  quiz_history: { totalCorrect: 0, totalAnswers: 0 },
  streak_data: { currentStreak: 0, lastActiveDate: '', bestStreak: 0 },
  xp_data: { totalXP: 0, level: 1 },
  is_premium: false,
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await supabase
    .from('profiles')
    .update(ZERO_PROGRESS)
    .eq('id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, reset: ZERO_PROGRESS });
}
