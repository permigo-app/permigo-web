import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId || userId === 'guest') {
      return NextResponse.json({ ok: false, reason: 'no userId' });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', userId);

    if (error) {
      console.error('[Activate] Supabase error:', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    console.log('[Activate] Premium activé pour:', userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Activate] Error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
