import type { Metadata } from 'next';
import LandingContent from '@/components/LandingContent';

export const metadata: Metadata = {
  title: 'MyPermiGo · Permis Théorique Belge, essai gratuit',
  description:
    'Prépare ton permis de conduire théorique belge avec MyPermiGo. 1770 questions officielles, 9 thèmes, mode Turbo, examen blanc et panneaux. Commence gratuitement, Premium dès 4,99€/semaine. FR et NL.',
  keywords: [
    'mypermigo', 'permis théorique belge', 'code de la route belgique',
    'examen théorique permis belgique', 'préparation permis belge',
    'questions permis belge', 'permis théorique gratuit', 'rijbewijs theorie belgie',
  ].join(', '),
  openGraph: {
    title: 'MyPermiGo · Permis Théorique Belge',
    description: 'Prépare ton permis belge à ton rythme. 1770 questions officielles, essai gratuit puis Premium dès 4,99€/semaine.',
    url: 'https://mypermigo.be',
    siteName: 'MyPermiGo',
    locale: 'fr_BE',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mypermigo.be',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'MyPermiGo',
  url: 'https://mypermigo.be',
  description:
    'Application web pour préparer le permis théorique belge : 1770 questions officielles, mode Turbo, examen blanc, panneaux de signalisation. Contenu gratuit à l\'essai, abonnement Premium pour tout débloquer.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  // Freemium : une partie du contenu est gratuite, le reste est sur abonnement.
  // Les prix viennent de src/lib/pricing.ts (source unique de vérité).
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '0',
    highPrice: '12.99',
    offerCount: 4,
  },
  inLanguage: ['fr', 'nl'],
  audience: { '@type': 'Audience', audienceType: 'Conducteurs en formation' },
};

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingContent />
    </>
  );
}
