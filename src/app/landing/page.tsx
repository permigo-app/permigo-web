import type { Metadata } from 'next';
import LandingContent from '@/components/LandingContent';

export const metadata: Metadata = {
  title: 'MyPermiGo — Prépare ton Permis Théorique Belge en Mode Jeu',
  description:
    'Prépare ton examen théorique belge avec 2286 questions officielles. Gamifié, interactif, disponible en français et néerlandais. Essai gratuit 7 jours, 7€/mois.',
  keywords: 'permis belge, code de la route belgique, examen théorique belgique, theorie rijbewijs belgie',
  openGraph: {
    title: 'MyPermiGo — Permis Théorique Belge en Mode Jeu',
    description: "Prépare ton permis belge en t'amusant. 2286 questions officielles, FR + NL.",
    url: 'https://mypermigo.be/landing',
    siteName: 'MyPermiGo',
    locale: 'fr_BE',
    type: 'website',
  },
};

export default function LandingPage() {
  return <LandingContent />;
}
