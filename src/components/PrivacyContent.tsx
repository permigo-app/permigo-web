'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLang } from '@/contexts/LanguageContext';

const CONTACT = 'ycroitor8096@gmail.com';
const lien = { color: '#4ecdc4' };
const mail = <a href={`mailto:${CONTACT}`} style={lien}>{CONTACT}</a>;

interface Section { titre: string; corps: ReactNode }

const TEXTES: Record<'fr' | 'nl', { retour: string; titre: string; maj: string; sections: Section[] }> = {
  fr: {
    retour: '← Retour',
    titre: 'Politique de confidentialité',
    maj: 'Dernière mise à jour : octobre 2026',
    sections: [
      { titre: '1. Qui sommes-nous ?', corps: <p>MyPermiGo est une application de préparation au permis de conduire théorique belge. Responsable du traitement des données : MyPermiGo — contact : {mail}</p> },
      { titre: '2. Données collectées', corps: <>
        <p className="mb-3">Nous collectons les données suivantes :</p>
        <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
          <li><strong>Adresse e-mail</strong> — pour créer et gérer votre compte.</li>
          <li><strong>Prénom</strong> — pour personnaliser votre expérience.</li>
          <li><strong>Progression pédagogique</strong> — leçons complétées, résultats aux quiz et examens, XP, étoiles obtenues.</li>
          <li><strong>Préférences de personnalisation</strong> — type de voiture, couleur choisie, objectif d&apos;apprentissage.</li>
          <li><strong>Données de paiement</strong> — traitées exclusivement par Stripe (voir section 4). Nous ne stockons aucune donnée bancaire.</li>
          <li><strong>Données techniques</strong> — langue, appareil, interactions avec l&apos;application (à des fins d&apos;amélioration).</li>
        </ul>
      </> },
      { titre: '3. Base légale du traitement', corps: <p>Le traitement est fondé sur l&apos;exécution du contrat (fourniture du service), votre consentement (données optionnelles), et notre intérêt légitime (amélioration de l&apos;application, sécurité).</p> },
      { titre: '4. Sous-traitants et partenaires', corps:
        <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
          <li><strong>Supabase</strong> — hébergement de la base de données et authentification. Données stockées en Union européenne. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={lien}>Politique Supabase</a></li>
          <li><strong>Stripe</strong> — traitement des paiements. Stripe est certifié PCI-DSS. <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" style={lien}>Politique Stripe</a></li>
          <li><strong>Vercel</strong> — hébergement de l&apos;application web et statistiques de fréquentation anonymes, sans cookie.</li>
        </ul> },
      { titre: '5. Durée de conservation', corps: <p>Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, vos données personnelles sont effacées sous 30 jours. Les données de paiement sont conservées par Stripe conformément à leurs obligations légales.</p> },
      { titre: '6. Vos droits (RGPD)', corps: <>
        <p className="mb-3">Conformément au Règlement général sur la protection des données (RGPD), vous disposez des droits suivants :</p>
        <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
          <li><strong>Droit d&apos;accès</strong> — obtenir une copie de vos données.</li>
          <li><strong>Droit de rectification</strong> — corriger des données inexactes.</li>
          <li><strong>Droit à l&apos;effacement</strong> — demander la suppression de votre compte et de vos données.</li>
          <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré.</li>
          <li><strong>Droit d&apos;opposition</strong> — vous opposer à certains traitements.</li>
        </ul>
        <p className="mt-3">Pour exercer ces droits, contactez-nous à {mail}. Nous répondons sous 30 jours.</p>
      </> },
      { titre: '7. Cookies', corps: <p>Nous n&apos;utilisons que des cookies et un stockage local strictement nécessaires au fonctionnement du service : connexion à votre compte, paiement sécurisé (Stripe, uniquement au moment de payer), langue, thème et progression. Ils ne servent ni à la publicité ni au suivi. Pour cette raison, aucune bannière de consentement n&apos;est nécessaire. Nos statistiques de fréquentation (Vercel Analytics) sont anonymes et n&apos;utilisent aucun cookie.</p> },
      { titre: '8. Sécurité', corps: <p>Les communications sont chiffrées via HTTPS/TLS. Les mots de passe sont hachés et ne sont jamais stockés en clair. L&apos;accès aux données est restreint aux personnes qui en ont besoin.</p> },
      { titre: '9. Contact', corps: <>
        <p>Pour toute question relative à la confidentialité de vos données : {mail}</p>
        <p className="mt-2">Vous avez également le droit d&apos;introduire une réclamation auprès de l&apos;Autorité de protection des données belge (APD) : <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" style={lien}>autoriteprotectiondonnees.be</a></p>
      </> },
    ],
  },
  nl: {
    retour: '← Terug',
    titre: 'Privacybeleid',
    maj: 'Laatst bijgewerkt: oktober 2026',
    sections: [
      { titre: '1. Wie zijn wij?', corps: <p>MyPermiGo is een applicatie om je voor te bereiden op het Belgische theoretisch rijexamen. Verwerkingsverantwoordelijke: MyPermiGo — contact: {mail}</p> },
      { titre: '2. Verzamelde gegevens', corps: <>
        <p className="mb-3">Wij verzamelen de volgende gegevens:</p>
        <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
          <li><strong>E-mailadres</strong> — om je account aan te maken en te beheren.</li>
          <li><strong>Voornaam</strong> — om je ervaring te personaliseren.</li>
          <li><strong>Leervoortgang</strong> — voltooide lessen, resultaten van quizzen en examens, XP, behaalde sterren.</li>
          <li><strong>Persoonlijke voorkeuren</strong> — type auto, gekozen kleur, leerdoel.</li>
          <li><strong>Betaalgegevens</strong> — uitsluitend verwerkt door Stripe (zie punt 4). Wij bewaren geen bankgegevens.</li>
          <li><strong>Technische gegevens</strong> — taal, toestel, interacties met de applicatie (om ze te verbeteren).</li>
        </ul>
      </> },
      { titre: '3. Rechtsgrond van de verwerking', corps: <p>De verwerking is gebaseerd op de uitvoering van het contract (levering van de dienst), je toestemming (optionele gegevens) en ons gerechtvaardigd belang (verbetering van de applicatie, veiligheid).</p> },
      { titre: '4. Verwerkers en partners', corps:
        <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
          <li><strong>Supabase</strong> — hosting van de database en authenticatie. Gegevens opgeslagen in de Europese Unie. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={lien}>Privacybeleid Supabase</a></li>
          <li><strong>Stripe</strong> — verwerking van betalingen. Stripe is PCI-DSS-gecertificeerd. <a href="https://stripe.com/nl/privacy" target="_blank" rel="noopener noreferrer" style={lien}>Privacybeleid Stripe</a></li>
          <li><strong>Vercel</strong> — hosting van de webapplicatie en anonieme bezoekersstatistieken, zonder cookies.</li>
        </ul> },
      { titre: '5. Bewaartermijn', corps: <p>Je gegevens worden bewaard zolang je account actief is. Bij verwijdering van je account worden je persoonsgegevens binnen 30 dagen gewist. Betaalgegevens worden door Stripe bewaard volgens hun wettelijke verplichtingen.</p> },
      { titre: '6. Je rechten (AVG)', corps: <>
        <p className="mb-3">Volgens de Algemene Verordening Gegevensbescherming (AVG) heb je de volgende rechten:</p>
        <ul className="flex flex-col gap-2 pl-4" style={{ listStyleType: 'disc' }}>
          <li><strong>Recht op inzage</strong> — een kopie van je gegevens krijgen.</li>
          <li><strong>Recht op rectificatie</strong> — onjuiste gegevens laten verbeteren.</li>
          <li><strong>Recht op wissing</strong> — de verwijdering van je account en gegevens vragen.</li>
          <li><strong>Recht op overdraagbaarheid</strong> — je gegevens in een gestructureerd formaat ontvangen.</li>
          <li><strong>Recht van bezwaar</strong> — bezwaar maken tegen bepaalde verwerkingen.</li>
        </ul>
        <p className="mt-3">Om deze rechten uit te oefenen, contacteer ons via {mail}. Wij antwoorden binnen 30 dagen.</p>
      </> },
      { titre: '7. Cookies', corps: <p>Wij gebruiken alleen cookies en lokale opslag die strikt noodzakelijk zijn voor de werking van de dienst: aanmelding op je account, veilige betaling (Stripe, alleen op het moment van betalen), taal, thema en voortgang. Ze dienen niet voor reclame of tracking. Daarom is geen toestemmingsbanner nodig. Onze bezoekersstatistieken (Vercel Analytics) zijn anoniem en gebruiken geen cookies.</p> },
      { titre: '8. Beveiliging', corps: <p>De communicatie is versleuteld via HTTPS/TLS. Wachtwoorden worden gehasht en nooit in leesbare vorm opgeslagen. De toegang tot de gegevens is beperkt tot de personen die ze nodig hebben.</p> },
      { titre: '9. Contact', corps: <>
        <p>Voor elke vraag over de bescherming van je gegevens: {mail}</p>
        <p className="mt-2">Je hebt ook het recht een klacht in te dienen bij de Belgische Gegevensbeschermingsautoriteit (GBA): <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank" rel="noopener noreferrer" style={lien}>gegevensbeschermingsautoriteit.be</a></p>
      </> },
    ],
  },
};

export default function PrivacyContent() {
  const { lang } = useLang();
  const c = TEXTES[lang === 'nl' ? 'nl' : 'fr'];
  return (
    <div className="max-w-2xl mx-auto px-5 py-12" style={{ minHeight: '100vh' }}>
      <Link href="/" className="text-sm font-bold mb-8 inline-block" style={lien}>{c.retour}</Link>
      <h1 style={{ color: 'var(--text-title)' }} className="text-3xl font-black mb-2">{c.titre}</h1>
      <p className="text-sm mb-10" style={{ color: 'var(--text-hint)' }}>{c.maj}</p>
      <div className="flex flex-col gap-8" style={{ color: 'var(--text-sub)', lineHeight: 1.75 }}>
        {c.sections.map(s => (
          <section key={s.titre}>
            <h2 style={{ color: 'var(--text-title)' }} className="text-lg font-black mb-3">{s.titre}</h2>
            {s.corps}
          </section>
        ))}
      </div>
    </div>
  );
}
