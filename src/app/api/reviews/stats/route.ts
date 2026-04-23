import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = makeClient(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('question_reviews')
    .select('difficulty_level, next_review_at')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];
  const dueCount = rows.filter(r => r.next_review_at <= now).length;
  const learningCount = rows.filter(r => r.difficulty_level === 'learning' || r.difficulty_level === 'new').length;
  const masteredCount = rows.filter(r => r.difficulty_level === 'mastered').length;
  const totalReviewed = rows.length;

  return NextResponse.json({ dueCount, learningCount, masteredCount, totalReviewed });
}
