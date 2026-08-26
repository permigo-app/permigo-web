import type { Metadata } from 'next';
import LandingContent from '@/components/LandingContent';

export const metadata: Metadata = {
  title: 'MyPermiGo — Permis Théorique Belge Gratuit & Complet',
  description:
    'Prépare ton permis de conduire théorique belge avec MyPermiGo. 2286 questions officielles, 9 thèmes, mode Turbo, examen blanc et panneaux. Gratuit, en français et en néerlandais.',
  keywords: [
    'mypermigo', 'permis théorique belge', 'code de la route belgique',
    'examen théorique permis belgique', 'préparation permis belge',
    'questions permis belge', 'permis théorique gratuit', 'rijbewijs theorie belgie',
  ].join(', '),
  openGraph: {
    title: 'MyPermiGo — Permis Théorique Belge',
    description: 'Prépare ton permis belge à ton rythme. 2286 questions officielles, gratuit.',
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
    'Application web gratuite pour préparer le permis théorique belge. 2286 questions officielles, mode Turbo, examen blanc, panneaux de signalisation.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
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
