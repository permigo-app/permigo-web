import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const supabase = getServiceClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Token invalide' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 404 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Cherche actif + trial
    const [active, trialing] = await Promise.all([
      stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: 'active', limit: 5 }),
      stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: 'trialing', limit: 5 }),
    ]);

    const subs = [...active.data, ...trialing.data];

    if (subs.length === 0) {
      return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 404 });
    }

    // Annule tous (gère les doublons éventuels)
    for (const sub of subs) {
      if (sub.status === 'trialing') {
        // Trial : annulation immédiate
        await stripe.subscriptions.cancel(sub.id);
        console.log('[Cancel] Trial annulé immédiatement:', sub.id);
      } else {
        // Actif : annule à la fin de la période
        await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
        console.log('[Cancel] Abonnement marqué cancel_at_period_end:', sub.id);
      }
    }

    console.log('[Cancel] Abonnement(s) annulé(s) pour:', user.email, '— nb:', subs.length);
    return NextResponse.json({ success: true, cancelled: subs.length });

  } catch (error) {
    console.error('[Cancel] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
