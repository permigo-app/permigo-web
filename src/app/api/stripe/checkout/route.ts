import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Service role preferred; anon key is sufficient for auth.getUser() token verification
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  console.log('[Stripe] Supabase url present:', !!url, '— service key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY, '— using anon fallback:', !process.env.SUPABASE_SERVICE_ROLE_KEY);
  return createClient(url, key);
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

  // Récupère userId depuis le token Supabase côté serveur (pas depuis le body client)
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    console.error('[Stripe] No auth token provided');
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  let userId: string;
  let email: string | undefined;

  try {
    const supabase = getServiceClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('[Stripe] Token invalide:', authError?.message);
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    userId = user.id;
    email = user.email ?? undefined;
    console.log('[Stripe] Authenticated userId:', userId, 'email:', email);
  } catch (authErr) {
    console.error('[Stripe] Auth check failed:', authErr);
    return NextResponse.json({ error: 'Erreur authentification' }, { status: 500 });
  }

  try {
    const supabase = getServiceClient();
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    let existingCustomerId: string | null = null;

    // 1. Vérifie Supabase
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, is_premium')
        .eq('id', userId)
        .single();

      if (profile?.is_premium) {
        console.log('[Stripe] Blocked via Supabase: user already premium:', userId);
        return NextResponse.json({ error: 'already_subscribed' }, { status: 400 });
      }

      existingCustomerId = profile?.stripe_customer_id ?? null;
    } catch (profileErr) {
      console.warn('[Stripe] Profile check failed:', profileErr);
    }

    // 2. Vérifie Stripe directement (protection double-facturation)
    if (existingCustomerId) {
      const existing = await stripe.subscriptions.list({
        customer: existingCustomerId,
        status: 'all',
        limit: 10,
      });
      const activeOrTrial = existing.data.filter(s =>
        ['active', 'trialing', 'past_due'].includes(s.status)
      );
      if (activeOrTrial.length > 0) {
        console.log('[Stripe] Blocked via Stripe: active subscription exists for customer:', existingCustomerId, 'statuses:', activeOrTrial.map(s => s.status));
        // Sync Supabase au cas où
        await supabase.from('profiles').update({ is_premium: true }).eq('id', userId);
        return NextResponse.json({ error: 'already_subscribed' }, { status: 400 });
      }
    } else {
      // Pas de customerId en base — cherche par email dans Stripe
      if (email) {
        const customers = await stripe.customers.list({ email, limit: 5 });
        for (const cust of customers.data) {
          const subs = await stripe.subscriptions.list({ customer: cust.id, status: 'all', limit: 5 });
          const activeOrTrial = subs.data.filter(s => ['active', 'trialing', 'past_due'].includes(s.status));
          if (activeOrTrial.length > 0) {
            console.log('[Stripe] Blocked via Stripe email search: found active sub for', email, 'customer:', cust.id);
            await supabase.from('profiles').update({ is_premium: true, stripe_customer_id: cust.id }).eq('id', userId);
            return NextResponse.json({ error: 'already_subscribed' }, { status: 400 });
          }
          if (!existingCustomerId) existingCustomerId = cust.id;
        }
      }
    }

    console.log('[Stripe] Creating session — userId:', userId, 'existingCustomer:', existingCustomerId);

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
      metadata: { userId },
    });

    console.log('[Stripe] Session created:', session.id, '— userId in metadata:', userId);
    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[Stripe] Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
