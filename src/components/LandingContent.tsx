'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

type Lang = 'fr' | 'nl';

const UI: Record<Lang, {
  login: string;
  register: string;
  heroBadge: string;
  heroTitle1: string;
  heroAccent: string;
  heroTitle2: string;
  heroSub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaSub: string;
  statQ: string;
  statThemes: string;
  statLang: string;
  statTrial: string;
  s1Title: string;
  s1Sub: string;
  s2Title: string;
  s2Sub: string;
  s3Title: string;
  s4Title: string;
  premiumTitle: string;
  premiumSub: string;
  premiumPrice: string;
  premiumMonth: string;
  premiumAfter: string;
  premiumItems: string[];
  premiumCta: string;
  premiumNoCommit: string;
  privacy: string;
  cookies: string;
  terms: string;
}> = {
  fr: {
    login: 'Se connecter',
    register: 'Essayer gratuitement',
    heroBadge: 'Application officielle belge',
    heroTitle1: 'Réussis ton ',
    heroAccent: 'permis théorique',
    heroTitle2: ' belge',
    heroSub: "Apprends avec 2286 questions officielles, entraîne-toi à ton rythme et suis ta progression avec une appli pensée pour les Belges.",
    ctaPrimary: 'Commencer gratuitement →',
    ctaSecondary: 'Se connecter',
    ctaSub: '7 jours gratuits — sans carte bancaire',
    statQ: 'questions officielles',
    statThemes: 'thèmes de conduite',
    statLang: 'Bilingue FR / NL',
    statTrial: 'Essai gratuit',
    s1Title: 'Apprends plus vite',
    s1Sub: 'Des leçons structurées et des quiz interactifs pour maîtriser chaque règle du code belge.',
    s2Title: "Entraîne-toi comme à l'examen",
    s2Sub: "Des modes d'entraînement qui reproduisent les conditions réelles de l'examen théorique belge.",
    s3Title: 'Suis ta progression',
    s4Title: 'Pensé pour la Belgique',
    premiumTitle: 'Prêt à décrocher ton permis ?',
    premiumSub: 'Accès complet à toutes les fonctionnalités',
    premiumPrice: '7€',
    premiumMonth: '/mois',
    premiumAfter: "après l'essai gratuit de 7 jours",
    premiumItems: [
      'Accès à tous les thèmes (9 thèmes, 2286 questions)',
      'Examens blancs illimités',
      'Mode Turbo — entraînement rapide',
      'Révision intelligente (répétition espacée)',
      'Statistiques détaillées et badges',
      'Support FR et NL complet',
    ],
    premiumCta: 'Commencer gratuitement →',
    premiumNoCommit: 'Sans engagement — annule à tout moment',
    privacy: 'Politique de confidentialité',
    cookies: 'Cookies',
    terms: 'CGU',
  },
  nl: {
    login: 'Inloggen',
    register: 'Gratis proberen',
    heroBadge: 'Belgische officiële applicatie',
    heroTitle1: 'Slaag voor je ',
    heroAccent: 'theoretisch rijexamen',
    heroTitle2: ' in België',
    heroSub: 'Leer met 2286 officiële vragen, oefen op jouw tempo en volg je voortgang met een app gemaakt voor Belgen.',
    ctaPrimary: 'Gratis starten →',
    ctaSecondary: 'Inloggen',
    ctaSub: '7 dagen gratis — geen bankkaart nodig',
    statQ: 'officiële vragen',
    statThemes: "rijthema's",
    statLang: 'Tweetalig FR / NL',
    statTrial: 'Gratis proefperiode',
    s1Title: 'Leer sneller',
    s1Sub: 'Gestructureerde lessen en interactieve quizzen om elke regel van het Belgisch rijbewijs te beheersen.',
    s2Title: 'Oefen zoals op het examen',
    s2Sub: 'Trainingsmodi die de reële omstandigheden van het Belgisch theoretisch rijexamen nabootsen.',
    s3Title: 'Volg je voortgang',
    s4Title: 'Gemaakt voor België',
    premiumTitle: 'Klaar om je rijbewijs te halen?',
    premiumSub: 'Volledige toegang tot alle functies',
    premiumPrice: '7€',
    premiumMonth: '/maand',
    premiumAfter: 'na de gratis proefperiode van 7 dagen',
    premiumItems: [
      "Toegang tot alle thema's (9 thema's, 2286 vragen)",
      'Onbeperkte oefenexamens',
      'Turbomodus — snelle training',
      'Slimme herhaling (gespreide herhaling)',
      'Gedetailleerde statistieken en badges',
      'Volledige FR en NL ondersteuning',
    ],
    premiumCta: 'Gratis starten →',
    premiumNoCommit: 'Zonder verplichting — annuleer wanneer je wilt',
    privacy: 'Privacybeleid',
    cookies: 'Cookies',
    terms: 'Algemene voorwaarden',
  },
};

type FeatureItem = { emoji: string; titleFr: string; descFr: string; titleNl: string; descNl: string };

const FEATURES_S1: FeatureItem[] = [
  {
    emoji: '🎯',
    titleFr: 'Questions par thème',
    descFr: 'Maîtrise chaque thème du code belge : priorités, panneaux, alcool, autoroute et bien plus.',
    titleNl: 'Vragen per thema',
    descNl: "Beheers elk thema van het Belgisch rijbewijs: voorrang, borden, alcohol, snelweg en meer.",
  },
  {
    emoji: '🚦',
    titleFr: 'Panneaux de signalisation',
    descFr: "Tous les panneaux belges avec images officielles et explications claires pour chaque panneau.",
    titleNl: 'Verkeersborden',
    descNl: "Alle Belgische verkeersborden met officiële afbeeldingen en duidelijke uitleg.",
  },
  {
    emoji: '💡',
    titleFr: 'Explications claires',
    descFr: "Chaque question ratée vient avec une explication simple pour que tu comprennes vraiment la règle.",
    titleNl: 'Duidelijke uitleg',
    descNl: "Elk fout antwoord bevat een eenvoudige uitleg zodat je de regel echt begrijpt.",
  },
];

const FEATURES_S2: FeatureItem[] = [
  {
    emoji: '📝',
    titleFr: 'Examen blanc',
    descFr: "50 questions, même format que l'examen officiel belge. Valide ta progression régulièrement.",
    titleNl: 'Oefenexamen',
    descNl: "50 vragen, zelfde formaat als het officiële Belgische examen. Valideer regelmatig je voortgang.",
  },
  {
    emoji: '⚡',
    titleFr: 'Mode Turbo',
    descFr: "Questions à la chaîne pour entraîner tes réflexes. Parfait pour une révision rapide avant l'examen.",
    titleNl: 'Turbomodus',
    descNl: "Vragen achter elkaar om je reflexen te trainen. Ideaal voor snelle herhaling voor het examen.",
  },
  {
    emoji: '🧠',
    titleFr: 'Révision intelligente',
    descFr: "L'algorithme de répétition espacée te rappelle les questions que tu rates le plus souvent.",
    titleNl: 'Slimme herhaling',
    descNl: "Het algoritme voor gespreide herhaling herinnert je aan de vragen die je het vaakst fout hebt.",
  },
];

const FEATURES_S3: FeatureItem[] = [
  {
    emoji: '📊',
    titleFr: 'Niveau & XP',
    descFr: "Gagne de l'expérience à chaque bonne réponse et monte de niveau au fil de ta progression.",
    titleNl: 'Niveau & XP',
    descNl: "Verdien ervaringspunten bij elk juist antwoord en stijg in niveau naarmate je vordert.",
  },
  {
    emoji: '🏆',
    titleFr: 'Badges & récompenses',
    descFr: "Débloque des badges en atteignant tes objectifs. Motivation garantie jusqu'à l'examen.",
    titleNl: 'Badges & beloningen',
    descNl: "Ontgrendel badges door je doelen te bereiken. Gegarandeerde motivatie tot aan het examen.",
  },
  {
    emoji: '⭐',
    titleFr: 'Étoiles par leçon',
    descFr: "Obtiens 1, 2 ou 3 étoiles sur chaque leçon. Reviens sur les leçons ratées pour progresser.",
    titleNl: 'Sterren per les',
    descNl: "Behaal 1, 2 of 3 sterren per les. Keer terug naar mislukte lessen om te verbeteren.",
  },
];

const FEATURES_S4: FeatureItem[] = [
  {
    emoji: '🇧🇪',
    titleFr: 'FR & NL complets',
    descFr: "L'application complète disponible en français et en néerlandais. Bascule à tout moment.",
    titleNl: 'Volledig FR & NL',
    descNl: "De volledige applicatie beschikbaar in het Frans en het Nederlands. Wissel op elk moment.",
  },
  {
    emoji: '🚗',
    titleFr: 'Réglementation belge',
    descFr: "Contenu aligné sur les règles officielles du code de la route belge. Mis à jour régulièrement.",
    titleNl: 'Belgische regelgeving',
    descNl: "Inhoud afgestemd op de officiële Belgische verkeersregels. Regelmatig bijgewerkt.",
  },
];

function FeatureCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div
      className="reveal rounded-[22px] p-7 flex flex-col gap-3 transition-all duration-300"
      style={{
        background: 'var(--card-primary)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
      }}
    >
      <span className="text-4xl">{emoji}</span>
      <h3 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
    </div>
  );
}

export default function LandingContent() {
  const { lang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const s = UI[lang];

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'Nunito, sans-serif', minHeight: '100vh' }}>

      {/* ── STICKY HEADER ── */}
      <header
        className="sticky top-0 z-50 px-5 lg:px-8"
        style={{ background: 'var(--bg-blur)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-screen-xl mx-auto h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <span className="text-xl font-black flex-shrink-0" style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            My<span style={{ color: 'var(--brand)' }}>Permi</span>Go
          </span>

          {/* Right actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            <LanguageSwitcher />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'var(--card-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              title={theme === 'night' ? 'Mode jour' : 'Mode nuit'}
            >
              {theme === 'night' ? '☀️' : '🌙'}
            </button>

            {/* Login — hidden on small screens */}
            <Link
              href="/login"
              className="hidden sm:flex items-center px-4 py-2 rounded-full text-sm font-bold press-scale"
              style={{ border: '1.5px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'transparent', textDecoration: 'none' }}
            >
              {s.login}
            </Link>

            {/* Register CTA — hidden on mobile */}
            <Link
              href="/auth"
              className="hidden sm:flex items-center px-4 py-2 rounded-full text-sm font-black press-scale"
              style={{ background: 'var(--brand)', color: 'var(--bg-primary)', textDecoration: 'none' }}
            >
              {s.register}
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="px-5 lg:px-8 py-14 lg:py-20">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div
              className="inline-block px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
              style={{ background: 'rgba(78,205,196,0.12)', color: 'var(--brand)' }}
            >
              {s.heroBadge}
            </div>

            {/* H1 */}
            <h1
              className="font-black leading-tight mb-5"
              style={{ fontSize: 'clamp(34px, 5.5vw, 62px)', color: 'var(--text-primary)' }}
            >
              {s.heroTitle1}<span style={{ color: 'var(--brand)' }}>{s.heroAccent}</span>{s.heroTitle2}
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg leading-relaxed mb-8 mx-auto lg:mx-0"
              style={{ color: 'var(--text-secondary)', maxWidth: 540 }}
            >
              {s.heroSub}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-5">
              <Link
                href="/auth"
                className="px-7 py-4 rounded-full font-black text-base press-scale btn-glow-teal text-center"
                style={{ background: 'var(--brand)', color: 'var(--bg-primary)', textDecoration: 'none' }}
              >
                {s.ctaPrimary}
              </Link>
              <Link
                href="/login"
                className="px-7 py-4 rounded-full font-bold text-base press-scale text-center"
                style={{ border: '1.5px solid var(--border-subtle)', color: 'var(--text-secondary)', background: 'transparent', textDecoration: 'none' }}
              >
                {s.ctaSecondary}
              </Link>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-disabled)' }}>{s.ctaSub}</p>
          </div>

          {/* Right: phone mockup (CSS-only placeholder) */}
          {/* To replace with a real screenshot: put an <Image> inside .phone-screen */}
          {/* Placeholder image path: /images/app-screenshot.png (add to public/images/) */}
          <div className="flex-shrink-0 flex justify-center">
            <div className="relative" style={{ width: 260, height: 520 }}>
              {/* Phone shell */}
              <div
                className="w-full h-full rounded-[40px] relative overflow-hidden"
                style={{
                  background: 'var(--card-primary)',
                  border: '2px solid var(--border-subtle)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
                }}
              >
                {/* Notch */}
                <div
                  className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 rounded-full z-10"
                  style={{ background: 'var(--bg-primary)' }}
                />
                {/* Fake app UI screen */}
                <div className="absolute inset-0 pt-14 px-4 pb-6 flex flex-col gap-3">
                  {/* Header bar */}
                  <div className="h-7 rounded-xl" style={{ background: 'var(--bg-secondary)' }} />
                  {/* Progress bar */}
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                    <div className="h-full rounded-full" style={{ width: '68%', background: 'var(--brand)' }} />
                  </div>
                  {/* Question card */}
                  <div
                    className="rounded-2xl p-4 flex-1 flex flex-col justify-between"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="h-3 rounded-full" style={{ background: 'var(--border-subtle)', width: '90%' }} />
                      <div className="h-3 rounded-full" style={{ background: 'var(--border-subtle)', width: '75%' }} />
                      <div className="h-3 rounded-full" style={{ background: 'var(--border-subtle)', width: '60%' }} />
                    </div>
                    {/* Answer options */}
                    <div className="flex flex-col gap-2 mt-3">
                      {[true, false, false].map((correct, i) => (
                        <div
                          key={i}
                          className="h-10 rounded-xl flex items-center px-3 gap-2"
                          style={{
                            background: correct ? 'rgba(46,204,113,0.15)' : 'var(--card-primary)',
                            border: correct ? '1.5px solid var(--success)' : '1px solid var(--border-subtle)',
                          }}
                        >
                          <div
                            className="w-6 h-6 rounded-md flex-shrink-0"
                            style={{ background: correct ? 'var(--success)' : 'var(--border-subtle)' }}
                          />
                          <div className="h-2.5 flex-1 rounded-full" style={{ background: 'var(--border-subtle)' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Bottom button */}
                  <div className="h-11 rounded-2xl" style={{ background: 'var(--brand)' }} />
                </div>
              </div>
              {/* Glow under phone */}
              <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full blur-2xl opacity-25"
                style={{ width: 200, height: 60, background: 'var(--brand)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section
        className="reveal px-5 lg:px-8 py-8"
        style={{ background: 'var(--card-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: '2286', label: s.statQ },
            { value: '9', label: s.statThemes },
            { value: 'FR / NL', label: s.statLang },
            { value: '7j', label: s.statTrial },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black mb-1" style={{ color: 'var(--brand)' }}>{stat.value}</div>
              <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 1 : APPRENDS PLUS VITE ── */}
      <section className="px-5 lg:px-8 py-16 lg:py-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="reveal text-3xl lg:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
              {s.s1Title}
            </h2>
            <p className="reveal text-base lg:text-lg mx-auto" style={{ color: 'var(--text-secondary)', maxWidth: 560 }}>
              {s.s1Sub}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES_S1.map(f => (
              <FeatureCard
                key={f.titleFr}
                emoji={f.emoji}
                title={lang === 'fr' ? f.titleFr : f.titleNl}
                desc={lang === 'fr' ? f.descFr : f.descNl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2 : ENTRAÎNE-TOI ── */}
      <section className="px-5 lg:px-8 py-16 lg:py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="reveal text-3xl lg:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
              {s.s2Title}
            </h2>
            <p className="reveal text-base lg:text-lg mx-auto" style={{ color: 'var(--text-secondary)', maxWidth: 560 }}>
              {s.s2Sub}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES_S2.map(f => (
              <FeatureCard
                key={f.titleFr}
                emoji={f.emoji}
                title={lang === 'fr' ? f.titleFr : f.titleNl}
                desc={lang === 'fr' ? f.descFr : f.descNl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 : PROGRESSION ── */}
      <section className="px-5 lg:px-8 py-16 lg:py-20">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="reveal text-3xl lg:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
              {s.s3Title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES_S3.map(f => (
              <FeatureCard
                key={f.titleFr}
                emoji={f.emoji}
                title={lang === 'fr' ? f.titleFr : f.titleNl}
                desc={lang === 'fr' ? f.descFr : f.descNl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4 : BELGIQUE ── */}
      <section className="px-5 lg:px-8 py-16 lg:py-20" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="reveal text-3xl lg:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
              {s.s4Title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {FEATURES_S4.map(f => (
              <FeatureCard
                key={f.titleFr}
                emoji={f.emoji}
                title={lang === 'fr' ? f.titleFr : f.titleNl}
                desc={lang === 'fr' ? f.descFr : f.descNl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIUM CTA ── */}
      <section className="px-5 lg:px-8 py-16 lg:py-20">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="reveal text-3xl lg:text-4xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            {s.premiumTitle}
          </h2>
          <p className="reveal text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
            {s.premiumSub}
          </p>

          <div
            className="reveal rounded-3xl p-8 lg:p-10"
            style={{ background: 'var(--card-primary)', border: '2px solid var(--premium)' }}
          >
            {/* Price */}
            <div className="mb-1">
              <span className="text-5xl font-black" style={{ color: 'var(--premium)' }}>{s.premiumPrice}</span>
              <span className="text-lg font-semibold ml-1" style={{ color: 'var(--text-secondary)' }}>{s.premiumMonth}</span>
            </div>
            <p className="text-sm mb-8" style={{ color: 'var(--text-disabled)' }}>{s.premiumAfter}</p>

            {/* Benefits list */}
            <ul className="text-left mb-8 flex flex-col gap-3" style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
              {s.premiumItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-black flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/auth"
              className="block w-full py-4 rounded-2xl font-black text-base press-scale text-center"
              style={{ background: 'var(--premium)', color: '#0a0e2a', textDecoration: 'none' }}
            >
              {s.premiumCta}
            </Link>
            <p className="mt-4 text-xs font-bold" style={{ color: 'var(--text-disabled)' }}>{s.premiumNoCommit}</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="px-5 lg:px-8 py-6"
        style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <span className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
              My<span style={{ color: 'var(--brand)' }}>Permi</span>Go
            </span>

            {/* Links */}
            <div
              className="flex items-center gap-4 flex-wrap justify-center text-xs"
              style={{ color: 'var(--text-disabled)' }}
            >
              <span>© 2025-2026 MyPermiGo</span>
              <a
                href="https://www.iubenda.com/privacy-policy/43486445"
                target="_blank"
                rel="noopener"
                style={{ color: 'var(--text-disabled)', textDecoration: 'none' }}
              >
                {s.privacy}
              </a>
              <a
                href="https://www.iubenda.com/privacy-policy/43486445/cookie-policy"
                target="_blank"
                rel="noopener"
                style={{ color: 'var(--text-disabled)', textDecoration: 'none' }}
              >
                {s.cookies}
              </a>
              <Link href="/terms" style={{ color: 'var(--text-disabled)', textDecoration: 'none' }}>
                {s.terms}
              </Link>
            </div>

            {/* Lang + theme toggle */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'var(--card-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                title={theme === 'night' ? 'Mode jour' : 'Mode nuit'}
              >
                {theme === 'night' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
