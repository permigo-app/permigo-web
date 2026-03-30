import { NextResponse } from 'next/server';

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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      console.log('[PermiGo] Premium activated for user:', userId);
    }

    if (event.type === 'customer.subscription.deleted') {
      console.log('[PermiGo] Subscription cancelled:', event.data.object.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[PermiGo] Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
