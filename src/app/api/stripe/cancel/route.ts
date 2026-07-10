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

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // L'abonnement peut vivre sur un autre customer que celui du profil
    // (les anciens checkouts en customer_email créaient un customer par paiement)
    // → on cherche sur le customer du profil ET tous ceux qui partagent l'email
    const candidateIds: string[] = [];
    if (profile?.stripe_customer_id) candidateIds.push(profile.stripe_customer_id);
    if (user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 10 });
      for (const cust of customers.data) {
        if (!candidateIds.includes(cust.id)) candidateIds.push(cust.id);
      }
    }

    if (candidateIds.length === 0) {
      return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 404 });
    }

    const subs = [];
    for (const custId of candidateIds) {
      const list = await stripe.subscriptions.list({ customer: custId, status: 'all', limit: 10 });
      subs.push(...list.data.filter(s => ['active', 'trialing', 'past_due'].includes(s.status)));
    }

    if (subs.length === 0) {
      return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 404 });
    }

    // Annule tous (gère les doublons éventuels)
    let keepsAccessUntilPeriodEnd = false;
    for (const sub of subs) {
      if (sub.status === 'trialing') {
        // Trial : annulation immédiate
        await stripe.subscriptions.cancel(sub.id);
        console.log('[Cancel] Trial annulé immédiatement:', sub.id);
      } else {
        // Actif : annule à la fin de la période
        await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
        keepsAccessUntilPeriodEnd = true;
        console.log('[Cancel] Abonnement marqué cancel_at_period_end:', sub.id);
      }
    }

    // Trial annulé immédiatement = plus aucun accès ; en prod le webhook
    // subscription.deleted le fait aussi, mais en local il ne tourne pas
    if (!keepsAccessUntilPeriodEnd) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_premium: false })
        .eq('id', user.id);
      if (updateError) console.error('[Cancel] Erreur maj is_premium:', updateError.message);
    }

    console.log('[Cancel] Abonnement(s) annulé(s) pour:', user.email, '— nb:', subs.length);
    return NextResponse.json({ success: true, cancelled: subs.length });

  } catch (error) {
    console.error('[Cancel] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
