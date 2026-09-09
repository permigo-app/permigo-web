import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';
import { cheapestPlan } from '@/lib/pricing';

// La page /premium est un composant client : elle ne peut pas exporter ses
// propres métadonnées. Ce layout les lui donne — c'est la deuxième page la
// plus utile en recherche après l'accueil, les gens cherchent un prix.
export const metadata: Metadata = {
  title: 'Tarifs Premium',
  description: `Débloque les 1 770 questions du permis théorique belge, les examens blancs et le Turbo illimités. Dès ${cheapestPlan().priceDisplay} par semaine, sans engagement. Toute la théorie reste gratuite.`,
  alternates: { canonical: absoluteUrl('/premium') },
  openGraph: {
    title: 'Tarifs Premium · MyPermiGo',
    description: `Les 1 770 questions, les examens blancs illimités et le Turbo, dès ${cheapestPlan().priceDisplay} par semaine.`,
    url: absoluteUrl('/premium'),
    siteName: 'MyPermiGo',
    locale: 'fr_BE',
    type: 'website',
  },
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
