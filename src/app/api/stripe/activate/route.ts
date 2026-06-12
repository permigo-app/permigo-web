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
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ ok: false, reason: 'sessionId requis' }, { status: 400 });
    }

    // Le userId vient des metadata Stripe, jamais du client — sinon n'importe qui
    // pourrait s'activer premium sans payer
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 'no_payment_required' = abonnement avec période d'essai (0€ au checkout)
    const paid = session.status === 'complete' &&
      (session.payment_status === 'paid' || session.payment_status === 'no_payment_required');

    if (!paid) {
      console.warn('[Activate] Session non payée:', sessionId, session.status, session.payment_status);
      return NextResponse.json({ ok: false, reason: 'session non payée' }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    if (!userId || userId === 'guest') {
      return NextResponse.json({ ok: false, reason: 'no userId' });
    }

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const supabase = getSupabase();

    // update() ne signale pas l'absence de ligne (0 rows = succès) — on vérifie
    // le nombre de lignes touchées et on crée le profil s'il n'existe pas
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({
        is_premium: true,
        ...(customerId ? { stripe_customer_id: customerId } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id');

    if (error) {
      console.error('[Activate] Supabase error:', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (!updated || updated.length === 0) {
      console.warn('[Activate] Aucun profil pour', userId, '— création');
      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        is_premium: true,
        ...(customerId ? { stripe_customer_id: customerId } : {}),
      });
      if (insertError) {
        console.error('[Activate] Insert error:', insertError.message);
        return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
      }
    }

    console.log('[Activate] Premium activé pour:', userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Activate] Error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
