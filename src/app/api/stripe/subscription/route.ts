import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Infos d'abonnement du user connecté : date de renouvellement, montant,
// résiliation programmée. Utilisé pour prévenir avant le prélèvement.
export async function GET(req: Request) {
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

    // Même logique que la résiliation : l'abonnement peut vivre sur un autre
    // customer que celui du profil (anciens checkouts en customer_email)
    const candidateIds: string[] = [];
    if (profile?.stripe_customer_id) candidateIds.push(profile.stripe_customer_id);
    if (user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 10 });
      for (const cust of customers.data) {
        if (!candidateIds.includes(cust.id)) candidateIds.push(cust.id);
      }
    }

    for (const custId of candidateIds) {
      const list = await stripe.subscriptions.list({ customer: custId, status: 'all', limit: 10 });
      const sub = list.data.find(s => ['active', 'trialing', 'past_due'].includes(s.status));
      if (sub) {
        const item = sub.items?.data?.[0];
        const periodEnd = item?.current_period_end
          ?? (sub as unknown as { current_period_end?: number }).current_period_end
          ?? null;
        return NextResponse.json({
          active: true,
          renewalAt: periodEnd,
          amount: item?.price?.unit_amount ?? null,
          currency: item?.price?.currency ?? 'eur',
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });
      }
    }

    return NextResponse.json({ active: false });
  } catch (error) {
    console.error('[Subscription] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
