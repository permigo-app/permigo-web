import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID;
  const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;

  console.log('[Stripe] ENV check:', {
    hasSecretKey: !!STRIPE_SECRET_KEY,
    secretKeyPrefix: STRIPE_SECRET_KEY ? STRIPE_SECRET_KEY.slice(0, 7) : 'MISSING',
    hasPriceId: !!STRIPE_PRICE_ID,
    priceId: STRIPE_PRICE_ID || 'MISSING',
    baseUrl: NEXT_PUBLIC_URL || 'MISSING',
  });

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

    console.log('[Stripe] Creating session for userId:', userId, 'email:', email);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL || 'https://mypermigo.be'}/premium/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || 'https://mypermigo.be'}/premium`,
      customer_email: email || undefined,
      subscription_data: { trial_period_days: 7 },
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
