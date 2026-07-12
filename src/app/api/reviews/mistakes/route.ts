import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function makeClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
}

// Questions déjà répondues au moins une fois de travers, quel que soit le
// score depuis — c'est la banque d'erreurs de l'utilisateur, distincte de
// la révision espacée (qui inclut aussi les questions correctes "dues").
export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = makeClient(token);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('question_reviews')
    .select('question_id, total_attempts, total_correct')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mistakes = (data ?? []).filter(r => (r.total_correct ?? 0) < (r.total_attempts ?? 0));

  return NextResponse.json({ mistakes: mistakes.map(m => m.question_id) });
}
