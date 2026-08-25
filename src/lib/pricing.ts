// Source unique de vérité pour les formules Premium — prix, durée, libellés.
// Tout le reste du code (page /premium, PremiumGate, profil, CGU, checkout)
// doit lire ces valeurs plutôt que d'écrire un prix en dur quelque part.
//
// Le Price ID Stripe réel de chaque formule vit côté serveur uniquement
// (variables d'env STRIPE_PRICE_ID_*), jamais exposé au client.

export type PlanId = 'weekly' | 'biweekly' | 'monthly';

export interface PricingPlan {
  id: PlanId;
  durationDays: number;
  priceEuros: number;
  priceDisplay: string;
  labelFr: string;
  labelNl: string;
  periodFr: string;
  periodNl: string;
  badgeFr?: string;
  badgeNl?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'weekly',
    durationDays: 7,
    priceEuros: 4.99,
    priceDisplay: '4,99€',
    labelFr: '1 semaine',
    labelNl: '1 week',
    periodFr: '/semaine',
    periodNl: '/week',
  },
  {
    id: 'biweekly',
    durationDays: 14,
    priceEuros: 7.99,
    priceDisplay: '7,99€',
    labelFr: '2 semaines',
    labelNl: '2 weken',
    periodFr: '/2 semaines',
    periodNl: '/2 weken',
  },
  {
    id: 'monthly',
    durationDays: 30,
    priceEuros: 12.99,
    priceDisplay: '12,99€',
    labelFr: '1 mois',
    labelNl: '1 maand',
    periodFr: '/mois',
    periodNl: '/maand',
    badgeFr: 'Meilleur rapport',
    badgeNl: 'Beste deal',
  },
];

export const DEFAULT_PLAN: PlanId = 'monthly';

export function getPlan(id: string | null | undefined): PricingPlan | undefined {
  return PRICING_PLANS.find(p => p.id === id);
}

export function cheapestPlan(): PricingPlan {
  return PRICING_PLANS.reduce((min, p) => (p.priceEuros < min.priceEuros ? p : min), PRICING_PLANS[0]);
}
