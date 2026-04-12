import Link from 'next/link';

export const metadata = {
  title: "Conditions Générales d'Utilisation — MyPermiGo",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12" style={{ minHeight: '100vh' }}>
      <Link href="/app" className="text-sm font-bold mb-8 inline-block" style={{ color: '#4ecdc4' }}>
        ← Retour
      </Link>

      <h1 className="text-3xl font-black text-white mb-2">Conditions Générales d&apos;Utilisation</h1>
      <p className="text-sm mb-10" style={{ color: '#5A6B8A' }}>Dernière mise à jour : janvier 2025</p>

      <div className="flex flex-col gap-8" style={{ color: '#d1d5db', lineHeight: 1.75 }}>

        <section>
          <h2 className="text-lg font-black text-white mb-3">1. Présentation du service</h2>
          <p>
            MyPermiGo est une plateforme en ligne de préparation au permis de conduire théorique belge.
            Le service est édité par MyPermiGo — contact : <a href="mailto:ycroitor8096@gmail.com" style={{ color: '#4ecdc4' }}>ycroitor8096@gmail.com</a>
          </p>
          <p className="mt-2">
            En accédant à MyPermiGo, vous acceptez les présentes conditions générales d&apos;utilisation dans leur intégralité.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">2. Accès au service</h2>
          <p className="mb-2">MyPermiGo propose deux niveaux d&apos;accès :</p>
          <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
            <li>
              <strong>Gratuit</strong> — accès au Thème A complet, 1 examen blanc par semaine, 5 sessions Turbo par jour, flashcards.
            </li>
            <li>
              <strong>Premium</strong> — accès à l&apos;intégralité des 9 thèmes (A à I), examens blancs illimités, sessions Turbo illimitées.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">3. Abonnement Premium</h2>

          <h3 className="font-bold text-white mb-2">3.1 Prix</h3>
          <p className="mb-3">
            L&apos;abonnement Premium est proposé au tarif de <strong>7 € / mois</strong> (TTC). Ce prix peut être modifié
            sur notification préalable de 30 jours.
          </p>

          <h3 className="font-bold text-white mb-2">3.2 Essai gratuit</h3>
          <p className="mb-3">
            Un essai gratuit de <strong>7 jours</strong> est proposé aux nouveaux abonnés. Aucune somme n&apos;est
            prélevée pendant cette période. À l&apos;issue de l&apos;essai, l&apos;abonnement est automatiquement converti
            en abonnement payant sauf résiliation avant la fin de la période d&apos;essai.
          </p>

          <h3 className="font-bold text-white mb-2">3.3 Renouvellement et résiliation</h3>
          <p className="mb-3">
            L&apos;abonnement est renouvelé automatiquement chaque mois. Vous pouvez résilier à tout moment depuis
            votre espace client ou en nous contactant à{' '}
            <a href="mailto:ycroitor8096@gmail.com" style={{ color: '#4ecdc4' }}>ycroitor8096@gmail.com</a>.
            La résiliation prend effet à la fin de la période de facturation en cours.
          </p>

          <h3 className="font-bold text-white mb-2">3.4 Remboursement</h3>
          <p>
            Conformément à la législation européenne sur les contrats conclus à distance, vous disposez d&apos;un
            délai de rétractation de <strong>14 jours</strong> à compter de la souscription. Pour exercer ce droit,
            contactez-nous à{' '}
            <a href="mailto:ycroitor8096@gmail.com" style={{ color: '#4ecdc4' }}>ycroitor8096@gmail.com</a>.
            En dehors de ce délai, aucun remboursement partiel ne sera accordé pour une période entamée.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">4. Paiement</h2>
          <p>
            Les paiements sont traités de façon sécurisée par <strong>Stripe</strong>, certifié PCI-DSS.
            MyPermiGo ne stocke aucune donnée bancaire. En cas d&apos;échec de paiement, l&apos;accès Premium
            peut être suspendu jusqu&apos;à régularisation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">5. Utilisation acceptable</h2>
          <p className="mb-3">En utilisant MyPermiGo, vous vous engagez à :</p>
          <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
            <li>Ne pas tenter de contourner les protections techniques (accès non autorisé à du contenu Premium).</li>
            <li>Ne pas reproduire, copier, vendre ou distribuer le contenu pédagogique sans autorisation écrite.</li>
            <li>Ne pas utiliser le service à des fins illégales ou contraires aux bonnes mœurs.</li>
            <li>Ne pas créer de comptes multiples pour abuser des offres d&apos;essai.</li>
            <li>Fournir des informations exactes lors de l&apos;inscription.</li>
          </ul>
          <p className="mt-3">
            Tout manquement à ces règles peut entraîner la suspension immédiate du compte sans remboursement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">6. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu de MyPermiGo (textes, questions, design, logo, mascotte Prof. Gaston,
            code source) est la propriété exclusive de MyPermiGo et est protégé par les lois sur la propriété
            intellectuelle. Toute reproduction non autorisée est interdite.
          </p>
          <p className="mt-2">
            Les questions théoriques sont basées sur les référentiels officiels belges du permis de conduire.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">7. Responsabilité</h2>
          <p>
            MyPermiGo est un outil d&apos;aide à la préparation et ne garantit pas la réussite à l&apos;examen officiel.
            Le contenu pédagogique est fourni à titre informatif et peut contenir des erreurs ou être sujet
            à des mises à jour réglementaires. Nous déclinons toute responsabilité en cas d&apos;échec à l&apos;examen
            du permis de conduire.
          </p>
          <p className="mt-2">
            Nous nous réservons le droit de modifier, suspendre ou interrompre le service à tout moment,
            avec notification préalable lorsque cela est possible.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">8. Modification des CGU</h2>
          <p>
            Nous nous réservons le droit de modifier les présentes CGU. Les utilisateurs seront notifiés
            par e-mail ou via l&apos;application en cas de modification substantielle. La poursuite de
            l&apos;utilisation du service après notification vaut acceptation des nouvelles conditions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">9. Droit applicable</h2>
          <p>
            Les présentes CGU sont régies par le droit belge. En cas de litige, les parties s&apos;engagent
            à chercher une résolution amiable avant tout recours judiciaire. À défaut, les tribunaux
            compétents de Belgique seront saisis.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-white mb-3">10. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU :{' '}
            <a href="mailto:ycroitor8096@gmail.com" style={{ color: '#4ecdc4' }}>ycroitor8096@gmail.com</a>
          </p>
        </section>

      </div>
    </div>
  );
}
