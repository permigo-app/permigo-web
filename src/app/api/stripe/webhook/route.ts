import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
        // update() ne signale pas l'absence de ligne (0 rows = succès) — on vérifie
        // le nombre de lignes touchées et on crée le profil s'il n'existe pas
        const { data: updated, error: updateError } = await supabase
          .from('profiles')
          .update({
            is_premium: true,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select('id');

        if (updateError) {
          console.error('[Webhook] Erreur Supabase update:', updateError.message);
        } else if (!updated || updated.length === 0) {
          console.warn('[Webhook] Aucun profil pour', userId, '— création');
          const { error: insertError } = await supabase.from('profiles').insert({
            id: userId,
            is_premium: true,
            stripe_customer_id: session.customer as string,
          });
          if (insertError) {
            console.error('[Webhook] Erreur Supabase insert:', insertError.message);
          } else {
            console.log('[Webhook] Premium activé (profil créé) pour:', userId);
          }
        } else {
          console.log('[Webhook] Premium activé pour:', userId, '— customer:', session.customer);
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      console.log('[Webhook] customer.subscription.deleted — customerId:', customerId);

      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (data?.id) {
        const { error: cancelError } = await supabase
          .from('profiles')
          .update({ is_premium: false })
          .eq('id', data.id);

        if (cancelError) {
          console.error('[Webhook] Erreur annulation Supabase:', cancelError.message);
        } else {
          console.log('[Webhook] Premium annulé pour:', data.id);
        }
      } else {
        console.warn('[Webhook] Aucun profil trouvé pour customerId:', customerId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Erreur:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
