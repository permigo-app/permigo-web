import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { activatePremiumProfile } from '@/lib/activatePremiumProfile';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('[Webhook] Event received:', event.type);

    const supabase = getServiceClient();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      console.log('[Webhook] checkout.session.completed:', {
        sessionId: session.id,
        userId,
        customer: session.customer,
        metadata: session.metadata,
      });

      if (!userId || userId === 'guest') {
        console.error('[Webhook] userId manquant ou guest — premium non activé');
      } else {
        const result = await activatePremiumProfile(supabase, userId, session.customer as string | null);
        if (!result.ok) {
          console.error('[Webhook] Erreur activation premium:', result.error);
        } else {
          console.log('[Webhook] Premium activé pour:', userId, '— customer:', session.customer);
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      console.log('[Webhook] customer.subscription.deleted — customerId:', customerId);

      // 1. Retrouve le profil par customer id
      let profileId: string | null = null;
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();
      if (data?.id) profileId = data.id;

      // 2. Repli par email — les anciens profils n'ont pas toujours le bon
      //    stripe_customer_id (checkouts historiques en customer_email)
      let email: string | null = null;
      const cust = await stripe.customers.retrieve(customerId);
      if (!cust.deleted) email = cust.email ?? null;

      if (!profileId && email) {
        const { data: usersPage } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const authUser = usersPage?.users.find(u => (u.email ?? '').toLowerCase() === email!.toLowerCase());
        if (authUser) profileId = authUser.id;
      }

      if (!profileId) {
        console.warn('[Webhook] Aucun profil trouvé pour customerId:', customerId, 'email:', email);
      } else {
        // 3. Ne coupe le premium que s'il ne reste AUCUN abonnement en cours
        //    sur les customers de cet email (un doublon peut encore être actif)
        let stillEntitled = false;
        if (email) {
          const customers = await stripe.customers.list({ email, limit: 10 });
          for (const c of customers.data) {
            const subs = await stripe.subscriptions.list({ customer: c.id, status: 'all', limit: 10 });
            if (subs.data.some(s => ['active', 'trialing', 'past_due'].includes(s.status))) {
              stillEntitled = true;
              break;
            }
          }
        }

        if (stillEntitled) {
          console.log('[Webhook] Autre abonnement encore actif — premium conservé pour:', profileId);
        } else {
          const { error: cancelError } = await supabase
            .from('profiles')
            .update({ is_premium: false })
            .eq('id', profileId);

          if (cancelError) {
            console.error('[Webhook] Erreur annulation Supabase:', cancelError.message);
          } else {
            console.log('[Webhook] Premium annulé pour:', profileId);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Erreur:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
