import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
  const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;

  if (!STRIPE_SECRET_KEY) {
    console.error('[Stripe] STRIPE_SECRET_KEY is not set');
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY manquante' }, { status: 500 });
  }
  if (!STRIPE_PRICE_ID) {
    console.error('[Stripe] STRIPE_PRICE_ID is not set');
    return NextResponse.json({ error: 'STRIPE_PRICE_ID manquante' }, { status: 500 });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const { userId, email } = await req.json();

    let existingCustomerId: string | null = null;

    if (userId && userId !== 'guest') {
      const supabase = getServiceClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, is_premium')
        .eq('id', userId)
        .single();

      if (profile?.is_premium) {
        console.log('[Stripe] Blocked: user already premium:', userId);
        return NextResponse.json(
          { error: 'already_subscribed' },
          { status: 400 }
        );
      }

      existingCustomerId = profile?.stripe_customer_id ?? null;
    }

    console.log('[Stripe] Creating session for userId:', userId, 'existingCustomer:', existingCustomerId);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${NEXT_PUBLIC_URL || 'https://mypermigo.be'}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${NEXT_PUBLIC_URL || 'https://mypermigo.be'}/premium`,
      ...(existingCustomerId
        ? { customer: existingCustomerId }
        : { customer_email: email || undefined }),
      subscription_data: { trial_period_days: 2 },
      metadata: { userId: userId || 'guest' },
    });

    console.log('[Stripe] Session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Stripe] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
