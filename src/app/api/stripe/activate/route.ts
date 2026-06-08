import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const { userId, sessionId } = await req.json();

    let resolvedUserId = userId;

    // Si on a un sessionId Stripe, on récupère le userId depuis les metadata Stripe
    if (sessionId && !resolvedUserId) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      resolvedUserId = session.metadata?.userId;
    }

    if (!resolvedUserId || resolvedUserId === 'guest') {
      return NextResponse.json({ ok: false, reason: 'no userId' });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', resolvedUserId);

    if (error) {
      console.error('[Activate] Supabase error:', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    console.log('[Activate] Premium activé pour:', resolvedUserId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Activate] Error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
