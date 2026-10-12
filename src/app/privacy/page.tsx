import PrivacyContent from '@/components/PrivacyContent';

export const metadata = {
  title: 'Politique de confidentialité — MyPermiGo',
};

// Le texte (FR et NL) vit dans PrivacyContent : il suit la langue choisie
// par l'utilisateur, ce qu'une page serveur ne peut pas lire.
export default function PrivacyPage() {
  return <PrivacyContent />;
}
