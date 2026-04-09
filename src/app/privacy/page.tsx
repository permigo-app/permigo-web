import Link from 'next/link';

export const metadata = {
  title: 'Politique de confidentialité — MyPermiGo',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12" style={{ minHeight: '100vh' }}>
      <Link href="/" className="text-sm font-bold mb-8 inline-block" style={{ color: '#4ecdc4' }}>
        ← Retour
      </Link>

      <h1 className="text-3xl font-black text-white mb-2">Politique de confidentialité</h1>
      <p className="text-sm mb-10" style={{ color: '#5A6B8A' }}>Dernière mise à jour : janvier 2025</p>

      <div className="flex flex-col gap-8" style={{ color: '#d1d5db', lineHeight: 1.75 }}>

        <section>
          <h2 className="text-lg font-black text-white mb-3">1. Qui sommes-nous ?</h2>
          <p>
            MyPermiGo est une application de préparation au permis de conduire théorique belge.
            Responsable du traitement des données : MyPermiGo — contact :{' '}
            <a href="mailto:ycroitor8096@gmail.com" style={{ color: '#4ecdc4' }}>ycroitor8096@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">2. Données collectées</h2>
          <p className="mb-3">Nous collectons les données suivantes :</p>
          <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
            <li><strong>Adresse e-mail</strong> — pour créer et gérer votre compte.</li>
            <li><strong>Prénom</strong> — pour personnaliser votre expérience.</li>
            <li><strong>Progression pédagogique</strong> — leçons complétées, résultats aux quiz et examens, XP, étoiles obtenues.</li>
            <li><strong>Préférences de personnalisation</strong> — type de voiture, couleur choisie, objectif d'apprentissage.</li>
            <li><strong>Données de paiement</strong> — traitées exclusivement par Stripe (voir section 4). Nous ne stockons aucune donnée bancaire.</li>
            <li><strong>Données techniques</strong> — langue, appareil, interactions avec l'application (à des fins d'amélioration).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">3. Base légale du traitement</h2>
          <p>
            Le traitement est fondé sur l'exécution du contrat (fourniture du service), votre consentement (données
            optionnelles), et notre intérêt légitime (amélioration de l'application, sécurité).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">4. Sous-traitants et partenaires</h2>
          <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
            <li>
              <strong>Supabase</strong> — hébergement de la base de données et authentification. Données stockées en Union Européenne.{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#4ecdc4' }}>Politique Supabase</a>
            </li>
            <li>
              <strong>Stripe</strong> — traitement des paiements. Stripe est certifié PCI-DSS.{' '}
              <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#4ecdc4' }}>Politique Stripe</a>
            </li>
            <li>
              <strong>Vercel</strong> — hébergement de l'application web. Données traitées en conformité avec le RGPD.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">5. Durée de conservation</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte,
            vos données personnelles sont effacées sous 30 jours. Les données de paiement sont conservées
            par Stripe conformément à leurs obligations légales.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">6. Vos droits (RGPD)</h2>
          <p className="mb-3">Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
          <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
            <li><strong>Droit d'accès</strong> — obtenir une copie de vos données.</li>
            <li><strong>Droit de rectification</strong> — corriger des données inexactes.</li>
            <li><strong>Droit à l'effacement</strong> — demander la suppression de votre compte et de vos données.</li>
            <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré.</li>
            <li><strong>Droit d'opposition</strong> — vous opposer à certains traitements.</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:ycroitor8096@gmail.com" style={{ color: '#4ecdc4' }}>ycroitor8096@gmail.com</a>.
            Nous répondons sous 30 jours.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">7. Cookies</h2>
          <p>
            Nous utilisons des cookies strictement nécessaires au fonctionnement du service (authentification, préférences de langue).
            Nous utilisons également des cookies tiers via iubenda pour la gestion du consentement.
            Vous pouvez gérer vos préférences via la bannière de consentement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">8. Sécurité</h2>
          <p>
            Les communications sont chiffrées via HTTPS/TLS. Les mots de passe sont hachés et ne sont jamais stockés en clair.
            L'accès aux données est restreint aux membres de l'équipe qui en ont besoin.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">9. Contact</h2>
          <p>
            Pour toute question relative à la confidentialité de vos données :{' '}
            <a href="mailto:ycroitor8096@gmail.com" style={{ color: '#4ecdc4' }}>ycroitor8096@gmail.com</a>
          </p>
          <p className="mt-2">
            Vous avez également le droit d'introduire une réclamation auprès de l'Autorité de protection des données belge (APD) :{' '}
            <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" style={{ color: '#4ecdc4' }}>
              autoriteprotectiondonnees.be
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
