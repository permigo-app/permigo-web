'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CarSVG, { getCarTypes, CAR_COLORS } from '@/components/CarSVG';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const TOTAL_STEPS = 5;

const GOALS = [
  { key: 'soon',  icon: '🎯', label: 'Passer mon permis bientôt',   sub: 'Mode intensif, je suis prêt(e)' },
  { key: 'relax', icon: '📚', label: 'Réviser tranquillement',        sub: 'À mon rythme, sans pression' },
  { key: 'fun',   icon: '🎮', label: "M'amuser en apprenant",         sub: 'Le jeu avant tout' },
];

const CAR_TYPE_OPTIONS = getCarTypes();

const PILLS = [
  '2286 questions officielles',
  'Gamifié & interactif',
  'FR + NL',
  'Examen blanc',
];

const CAR_EMOJIS: Record<string, string> = {
  berline:   '🚗',
  suv:       '🚙',
  sportive:  '🏎️',
  mini:      '🚕',
  van:       '🚐',
  pickup:    '🚚',
};

const GASTON_MESSAGES: Record<number, string> = {
  1: 'Bienvenue ! Je suis Prof. Gaston, ton guide vers le permis belge. 🎓',
  2: 'Dis-moi ton prénom, je personnaliserai tout pour toi !',
  3: 'Choisis bien, cette voiture te suivra tout au long du parcours !',
  4: "Je m'adapte à ton rythme, promis !",
  5: 'Tout est prêt ! En route vers le permis !',
};

const goalLabels: Record<string, string> = {
  soon:  'Passer mon permis bientôt',
  relax: 'Réviser tranquillement',
  fun:   "M'amuser en apprenant",
};

// SVG body différent selon le type de voiture
function CarBodySVG({ type, color }: { type: string; color: string }) {
  const c = color;
  const glass = '#a8d8f0';
  switch (type) {
    case 'suv':
      return <>
        {/* SUV — cabine large et haute */}
        <rect x="12" y="60" width="176" height="42" rx="9" fill={c} />
        <path d="M28 60 Q30 20 100 18 Q170 20 172 60 Z" fill={c} />
        <path d="M106 22 Q162 24 170 58 L106 58 Z" fill={glass} opacity="0.85" />
        <path d="M94 22 Q38 24 30 58 L94 58 Z" fill={glass} opacity="0.85" />
        <rect x="94" y="20" width="12" height="38" fill={c} />
        <rect x="12" y="90" width="176" height="5" rx="2" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="178" cy="72" rx="10" ry="7" fill="#FFD700" /><ellipse cx="178" cy="72" rx="6" ry="4" fill="#fff" opacity="0.5" />
        <ellipse cx="22" cy="72" rx="9" ry="6" fill="#e74c3c" />
        <circle cx="50" cy="102" r="17" fill="#222" /><circle cx="50" cy="102" r="10" fill="#555" /><circle cx="50" cy="102" r="4" fill="#333" />
        <circle cx="150" cy="102" r="17" fill="#222" /><circle cx="150" cy="102" r="10" fill="#555" /><circle cx="150" cy="102" r="4" fill="#333" />
      </>;
    case 'sportive':
      return <>
        {/* Sportive — basse et allongée */}
        <rect x="5" y="70" width="190" height="33" rx="12" fill={c} />
        <path d="M60 70 Q72 46 105 44 Q138 46 148 70 Z" fill={c} />
        {/* Capot long avant */}
        <path d="M148 70 L190 68 L190 82 L148 82 Z" fill={c} />
        <path d="M110 47 Q137 47 146 69 L110 69 Z" fill={glass} opacity="0.85" />
        <path d="M100 47 Q73 47 64 69 L100 69 Z" fill={glass} opacity="0.85" />
        <rect x="100" y="45" width="10" height="24" fill={c} />
        <rect x="5" y="93" width="190" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="184" cy="76" rx="9" ry="5" fill="#FFD700" /><ellipse cx="184" cy="76" rx="5" ry="3" fill="#fff" opacity="0.5" />
        <ellipse cx="18" cy="78" rx="7" ry="5" fill="#e74c3c" />
        <circle cx="44" cy="103" r="15" fill="#222" /><circle cx="44" cy="103" r="8" fill="#555" /><circle cx="44" cy="103" r="3" fill="#333" />
        <circle cx="155" cy="103" r="15" fill="#222" /><circle cx="155" cy="103" r="8" fill="#555" /><circle cx="155" cy="103" r="3" fill="#333" />
      </>;
    case 'mini':
      return <>
        {/* Mini — courte et ronde */}
        <rect x="28" y="64" width="144" height="38" rx="14" fill={c} />
        <path d="M58 64 Q68 34 100 32 Q132 34 142 64 Z" fill={c} />
        <path d="M103 36 Q130 36 140 63 L103 63 Z" fill={glass} opacity="0.85" />
        <path d="M97 36 Q70 36 60 63 L97 63 Z" fill={glass} opacity="0.85" />
        <rect x="97" y="34" width="6" height="29" fill={c} />
        <rect x="28" y="92" width="144" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="164" cy="74" rx="8" ry="6" fill="#FFD700" /><ellipse cx="164" cy="74" rx="5" ry="3" fill="#fff" opacity="0.5" />
        <ellipse cx="36" cy="74" rx="7" ry="5" fill="#e74c3c" />
        <circle cx="58" cy="102" r="15" fill="#222" /><circle cx="58" cy="102" r="8" fill="#555" /><circle cx="58" cy="102" r="3" fill="#333" />
        <circle cx="142" cy="102" r="15" fill="#222" /><circle cx="142" cy="102" r="8" fill="#555" /><circle cx="142" cy="102" r="3" fill="#333" />
      </>;
    case 'van':
      return <>
        {/* Van — grand et carré */}
        <rect x="14" y="38" width="170" height="64" rx="8" fill={c} />
        {/* Pare-brise avant */}
        <path d="M152 42 Q180 44 182 65 L152 65 Z" fill={glass} opacity="0.85" />
        {/* Vitres latérales */}
        <rect x="18" y="44" width="42" height="26" rx="4" fill={glass} opacity="0.75" />
        <rect x="68" y="44" width="42" height="26" rx="4" fill={glass} opacity="0.75" />
        <rect x="118" y="44" width="28" height="26" rx="4" fill={glass} opacity="0.75" />
        <rect x="14" y="92" width="170" height="5" rx="2" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="180" cy="74" rx="9" ry="7" fill="#FFD700" /><ellipse cx="180" cy="74" rx="5" ry="4" fill="#fff" opacity="0.5" />
        <ellipse cx="18" cy="74" rx="8" ry="6" fill="#e74c3c" />
        <circle cx="46" cy="102" r="16" fill="#222" /><circle cx="46" cy="102" r="9" fill="#555" /><circle cx="46" cy="102" r="4" fill="#333" />
        <circle cx="154" cy="102" r="16" fill="#222" /><circle cx="154" cy="102" r="9" fill="#555" /><circle cx="154" cy="102" r="4" fill="#333" />
      </>;
    case 'pickup':
      return <>
        {/* Pick-up — cabine + plateau arrière */}
        {/* Plateau */}
        <rect x="10" y="68" width="80" height="34" rx="5" fill={c} />
        {/* Bords plateau */}
        <rect x="10" y="56" width="5" height="14" rx="2" fill={c} />
        <rect x="85" y="56" width="5" height="14" rx="2" fill={c} />
        <rect x="10" y="56" width="80" height="5" rx="2" fill={c} />
        {/* Cabine */}
        <rect x="90" y="54" width="100" height="48" rx="9" fill={c} />
        <path d="M148 58 Q182 58 188 74 L148 74 Z" fill={glass} opacity="0.85" />
        <path d="M142 58 Q108 58 94 74 L142 74 Z" fill={glass} opacity="0.85" />
        <rect x="142" y="56" width="8" height="18" fill={c} />
        <rect x="10" y="92" width="180" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="183" cy="72" rx="9" ry="6" fill="#FFD700" /><ellipse cx="183" cy="72" rx="5" ry="3" fill="#fff" opacity="0.5" />
        <ellipse cx="14" cy="78" rx="7" ry="5" fill="#e74c3c" />
        <circle cx="36" cy="102" r="16" fill="#222" /><circle cx="36" cy="102" r="9" fill="#555" /><circle cx="36" cy="102" r="4" fill="#333" />
        <circle cx="158" cy="102" r="16" fill="#222" /><circle cx="158" cy="102" r="9" fill="#555" /><circle cx="158" cy="102" r="4" fill="#333" />
      </>;
    default: // berline
      return <>
        {/* Berline — standard */}
        <rect x="10" y="60" width="180" height="42" rx="10" fill={c} />
        <path d="M50 60 Q60 28 100 26 Q140 28 150 60 Z" fill={c} />
        <path d="M103 30 Q135 30 148 58 L103 58 Z" fill={glass} opacity="0.85" />
        <path d="M97 30 Q65 30 52 58 L97 58 Z" fill={glass} opacity="0.85" />
        <rect x="98" y="30" width="4" height="28" fill={c} />
        <rect x="10" y="92" width="180" height="5" rx="2" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="178" cy="72" rx="10" ry="7" fill="#FFD700" /><ellipse cx="178" cy="72" rx="6" ry="4" fill="#fff" opacity="0.5" />
        <ellipse cx="22" cy="72" rx="9" ry="6" fill="#e74c3c" />
        <circle cx="52" cy="102" r="16" fill="#222" /><circle cx="52" cy="102" r="9" fill="#555" /><circle cx="52" cy="102" r="4" fill="#333" />
        <circle cx="148" cy="102" r="16" fill="#222" /><circle cx="148" cy="102" r="9" fill="#555" /><circle cx="148" cy="102" r="4" fill="#333" />
        <rect x="87" y="73" width="26" height="5" rx="2.5" fill="rgba(255,255,255,0.25)" />
      </>;
  }
}

// Convert hex color to HSL hue (0-360)
function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === r)      h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else                h = (r - g) / d + 4;
  return Math.round(h * 60 + 360) % 360;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { signUp, user } = useAuth();
  const { t } = useLang();

  const [step, setStep]                   = useState(1);
  const [name, setName]                   = useState('');
  const [email]                           = useState('');
  const [password]                        = useState('');
  const [selectedCarType, setSelectedCarType] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [goal, setGoal]                   = useState<string | null>(null);
  const [saving, setSaving]               = useState(false);
  const [authError, setAuthError]         = useState('');
  const [fade, setFade]                   = useState(true);
  const [mounted, setMounted]             = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('@onboarding_done') === 'true') router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      if (localStorage.getItem('@onboarding_done') === 'true') router.replace('/');
    }
  }, [user, router]);

  if (!mounted) return <div className="min-h-screen" style={{ background: '#0a0e2a' }} />;

  const goTo = (next: number) => {
    setFade(false);
    setTimeout(() => { setStep(next); setAuthError(''); setFade(true); }, 150);
  };
  const goNext = () => goTo(step + 1);
  const goBack = () => { if (step > 1) goTo(step - 1); };

  const handleFinish = async () => {
    if (saving) return;
    setSaving(true);
    setAuthError('');

    const carType  = selectedCarType || 'berline';
    const carColor = selectedColor   || '#1E88E5';
    const profile  = {
      name:      name.trim() || t('pilote'),
      carColor,
      carType,
      objective: goal ?? 'relax',
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));

    if (email.trim() && password.trim()) {
      const result = await signUp(email.trim().toLowerCase(), password, profile.name);
      if (result.error) {
        setAuthError(result.error);
        setSaving(false);
        return;
      }
    }

    localStorage.setItem('@onboarding_done', 'true');
    setSaving(false);
    router.push('/');
  };

  const cyanBtn = {
    background: '#4ecdc4',
    color: '#0a0e2a',
    boxShadow: '0 4px 20px rgba(78,205,196,0.4)',
  };
  const disabledBtn = {
    background: 'rgba(255,255,255,0.06)',
    color: '#5A6B8A',
    boxShadow: 'none',
  };

  const carType      = selectedCarType || 'berline';
  const carColor     = selectedColor   || '#4ecdc4';
  const carStep3Ready = !!selectedCarType && !!selectedColor;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: '#0a0e2a' }}>

      {/* Language switcher */}
      <div className="fixed top-5 right-5 z-[110]">
        <LanguageSwitcher />
      </div>

      {/* Back button */}
      {step >= 2 && step <= 4 && (
        <button
          onClick={goBack}
          className="fixed top-5 left-5 z-[110] w-10 h-10 rounded-full flex items-center justify-center press-scale"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
        >
          ←
        </button>
      )}

      {/* Progress bar — thin segments */}
      {step >= 2 && (
        <div className="fixed top-0 left-0 right-0 z-[110] flex gap-1 p-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-300"
              style={{
                height: 3,
                background: i + 1 <= step ? '#4ecdc4' : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div
        className={`w-full max-w-[480px] mx-auto flex flex-col items-center px-6 pt-16 pb-28 transition-opacity duration-150 ${fade ? 'opacity-100' : 'opacity-0'}`}
        style={{ minHeight: '100vh' }}
      >

        {/* ═══ Gaston + bulle — partagé sur tous les écrans ═══ */}
        <div className="flex items-center justify-center gap-6 w-full mb-6">
          <Image
            src="/images/gaston.png"
            width={120} height={120}
            alt="Prof. Gaston"
            className="gaston-float"
            style={{ objectFit: 'contain', flexShrink: 0 }}
          />
          <div style={{
            background: '#1a2040',
            border: '1.5px solid rgba(78,205,196,0.3)',
            borderRadius: '16px 16px 16px 0',
            padding: '16px 20px',
            fontSize: 15,
            color: 'white',
            lineHeight: 1.55,
            fontWeight: 600,
            maxWidth: 280,
          }}>
            {GASTON_MESSAGES[step]}
          </div>
        </div>

        {/* ═══════════ STEP 1 — Accueil ═══════════ */}
        {step === 1 && (
          <>
            {/* Eyebrow */}
            <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: 'rgba(78,205,196,0.7)' }}>
              Belgique • FR + NL
            </p>

            <h1 className="text-[38px] font-black text-white text-center leading-tight mb-3" style={{ letterSpacing: '-0.5px' }}>
              Ton permis,<br />
              <span style={{ color: '#4ecdc4' }}>en mode jeu</span>
            </h1>

            <p className="text-sm text-center mb-7" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 340 }}>
              2286 questions officielles belges. Progresse leçon par leçon, gagne des XP, décroche ton permis.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {PILLS.map(pill => (
                <span key={pill} className="px-3 py-1.5 rounded-full text-xs font-black" style={{
                  background: 'rgba(78,205,196,0.1)',
                  border: '1px solid rgba(78,205,196,0.3)',
                  color: '#4ecdc4',
                }}>
                  {pill}
                </span>
              ))}
            </div>

            <button
              onClick={goNext}
              className="w-full py-4 rounded-2xl font-black text-lg press-scale mb-3"
              style={cyanBtn}
            >
              C&apos;est parti ! 🚀
            </button>

            <button onClick={() => router.push('/login')} className="py-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              J&apos;ai déjà un compte
            </button>
          </>
        )}

        {/* ═══════════ STEP 2 — Prénom ═══════════ */}
        {step === 2 && (
          <>
            <span className="text-[64px] mb-5 block">👋</span>
            <h2 className="text-3xl font-black text-white text-center mb-2">
              Comment tu t&apos;appelles ?
            </h2>
            <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
              On va personnaliser ton expérience
            </p>

            <input
              type="text"
              placeholder="Ton prénom..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) goNext(); }}
              maxLength={25}
              autoFocus
              className="w-full rounded-2xl px-5 py-5 text-[24px] font-black text-white text-center mb-6 focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: name.trim() ? '2px solid #4ecdc4' : '2px solid rgba(255,255,255,0.1)',
                caretColor: '#4ecdc4',
              }}
            />

            <button
              onClick={() => name.trim() && goNext()}
              disabled={!name.trim()}
              className="w-full py-4 rounded-2xl font-black text-lg press-scale disabled:opacity-30"
              style={name.trim() ? cyanBtn : disabledBtn}
            >
              Continuer →
            </button>
          </>
        )}

        {/* ═══════════ STEP 3 — Voiture + Couleur (fusionnés) ═══════════ */}
        {step === 3 && (
          <>
            <h2 className="text-3xl font-black text-white text-center mb-1">
              Choisis ta voiture !
            </h2>
            <p className="text-sm text-center mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Elle t&apos;accompagnera tout au long de ton apprentissage
            </p>

            {/* Live preview — SVG voiture avec couleur directe */}
            <div className="relative flex items-center justify-center mb-4" style={{ width: 220, height: 130 }}>
              {/* glow derrière */}
              <div className="absolute rounded-full" style={{
                width: 180, height: 90,
                background: `radial-gradient(circle, ${carColor}55 0%, transparent 70%)`,
                filter: 'blur(22px)',
              }} />
              <svg
                width="200" height="120"
                viewBox="0 0 200 120"
                className="relative z-10"
                style={{
                  opacity: selectedCarType ? 1 : 0.25,
                  transition: 'opacity 0.2s',
                  filter: `drop-shadow(0 4px 12px ${carColor}88)`,
                }}
              >
                <CarBodySVG type={carType} color={carColor} />
              </svg>
            </div>

            {/* Color palette (only when car selected) */}
            {selectedCarType && (
              <div className="flex flex-wrap justify-center gap-2.5 mb-5">
                {CAR_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className="w-9 h-9 rounded-full press-scale transition-all"
                    style={{
                      background: c.id,
                      border: selectedColor === c.id ? '3px solid white' : '2px solid transparent',
                      boxShadow: selectedColor === c.id ? `0 0 10px ${c.id}99` : 'none',
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            )}

            {/* Car grid 3x2 */}
            <div className="grid grid-cols-3 gap-2.5 w-full mb-6">
              {CAR_TYPE_OPTIONS.map(car => {
                const isSelected = selectedCarType === car.id;
                return (
                  <button
                    key={car.id}
                    onClick={() => setSelectedCarType(car.id)}
                    className="rounded-2xl p-3 flex flex-col items-center transition-all duration-150 press-scale relative"
                    style={{
                      background: isSelected ? 'rgba(78,205,196,0.15)' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? '2px solid #4ecdc4' : '2px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <span className="text-3xl mb-1">{CAR_EMOJIS[car.id] || '🚗'}</span>
                    <span className="text-[11px] font-bold" style={{ color: isSelected ? '#4ecdc4' : 'rgba(255,255,255,0.5)' }}>
                      {car.label}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 text-[10px] font-black" style={{ color: '#4ecdc4' }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => carStep3Ready && goNext()}
              disabled={!carStep3Ready}
              className="w-full py-4 rounded-2xl font-black text-lg press-scale disabled:opacity-30"
              style={carStep3Ready ? cyanBtn : disabledBtn}
            >
              {carStep3Ready ? "C'est ma voiture →" : selectedCarType ? 'Choisis une couleur' : 'Choisis une voiture'}
            </button>
          </>
        )}

        {/* ═══════════ STEP 4 — Objectif ═══════════ */}
        {step === 4 && (
          <>
            <span className="text-[60px] mb-4 block">🏁</span>
            <h2 className="text-3xl font-black text-white text-center mb-2">
              Ton objectif ?
            </h2>
            <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Pour personnaliser ton parcours
            </p>

            <div className="w-full flex flex-col gap-3 mb-6">
              {GOALS.map(g => {
                const isSelected = goal === g.key;
                return (
                  <button
                    key={g.key}
                    onClick={() => setGoal(g.key)}
                    className="flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-150 press-scale"
                    style={{
                      background: isSelected ? 'rgba(78,205,196,0.12)' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? '2px solid #4ecdc4' : '2px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <span className="text-[36px]">{g.icon}</span>
                    <div className="flex-1">
                      <p className="text-[15px] font-black" style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                        {g.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{g.sub}</p>
                    </div>
                    {isSelected && <span className="text-xl font-black" style={{ color: '#4ecdc4' }}>✓</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goal && goNext()}
              disabled={!goal}
              className="w-full py-4 rounded-2xl font-black text-lg press-scale disabled:opacity-30"
              style={goal ? cyanBtn : disabledBtn}
            >
              C&apos;est mon objectif →
            </button>
          </>
        )}

        {/* ═══════════ STEP 5 — C'est parti ! ═══════════ */}
        {step === 5 && (
          <>
            {/* Confetti-style emojis */}
            <div className="relative w-full flex justify-center mb-6" style={{ height: 60 }}>
              {['🎉', '⭐', '🏆', '✨', '🎊', '💫'].map((e, i) => (
                <span
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${10 + i * 16}%`,
                    top: `${i % 2 === 0 ? 0 : 20}px`,
                    animation: `star-twinkle ${1 + i * 0.2}s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                >
                  {e}
                </span>
              ))}
            </div>

            <h2 className="text-4xl font-black text-white text-center mb-2">
              {name.trim() ? `C'est parti, ${name.trim()} !` : "C'est parti !"}
            </h2>
            <p className="text-sm text-center mb-7" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Ton aventure commence maintenant 🚀
            </p>

            {/* Recap summary — 3 cards côte à côte */}
            <div className="w-full flex justify-center gap-4 mb-6">
              {/* Card 1 — Pilote */}
              <div className="flex-1 flex flex-col items-center rounded-2xl p-5 text-center" style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(78,205,196,0.2)',
              }}>
                <span className="text-3xl mb-2">👤</span>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#5A6B8A' }}>Pilote</p>
                <p className="text-sm font-black text-white leading-tight">{name.trim() || '—'}</p>
              </div>
              {/* Card 2 — Voiture */}
              <div className="flex-1 flex flex-col items-center rounded-2xl p-5 text-center" style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(78,205,196,0.2)',
              }}>
                <svg width="64" height="38" viewBox="0 0 200 120" className="mb-2" style={{ filter: `drop-shadow(0 2px 6px ${carColor}88)` }}>
                  <rect x="10" y="60" width="180" height="42" rx="10" fill={carColor} />
                  <path d="M50 60 Q60 28 100 26 Q140 28 150 60 Z" fill={carColor} />
                  <path d="M103 30 Q135 30 148 58 L103 58 Z" fill="#a8d8f0" opacity="0.85" />
                  <path d="M97 30 Q65 30 52 58 L97 58 Z" fill="#a8d8f0" opacity="0.85" />
                  <rect x="98" y="30" width="4" height="28" fill={carColor} />
                  <ellipse cx="178" cy="72" rx="10" ry="7" fill="#FFD700" />
                  <ellipse cx="22" cy="72" rx="9" ry="6" fill="#e74c3c" />
                  <circle cx="52" cy="102" r="16" fill="#222" /><circle cx="52" cy="102" r="9" fill="#555" />
                  <circle cx="148" cy="102" r="16" fill="#222" /><circle cx="148" cy="102" r="9" fill="#555" />
                </svg>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#5A6B8A' }}>Voiture</p>
                <p className="text-sm font-black text-white leading-tight">
                  {CAR_TYPE_OPTIONS.find(c => c.id === selectedCarType)?.label || '—'}
                  {selectedColor && (
                    <><br /><span style={{ color: '#4ecdc4', fontSize: 10 }}>{CAR_COLORS.find(c => c.id === selectedColor)?.label}</span></>
                  )}
                </p>
              </div>
              {/* Card 3 — Objectif */}
              <div className="flex-1 flex flex-col items-center rounded-2xl p-5 text-center" style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(78,205,196,0.2)',
              }}>
                <span className="text-3xl mb-2">{GOALS.find(g => g.key === goal)?.icon || '🎯'}</span>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#5A6B8A' }}>Objectif</p>
                <p className="text-sm font-black text-white leading-tight">{goal ? goalLabels[goal] : '—'}</p>
              </div>
            </div>

            {authError && (
              <div className="w-full rounded-xl p-3 mb-4" style={{ background: 'rgba(255,80,80,0.12)', borderLeft: '3px solid #FF5050' }}>
                <p className="text-sm font-semibold" style={{ color: '#FF8080' }}>{authError}</p>
              </div>
            )}

            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full py-4 rounded-2xl font-black text-lg press-scale disabled:opacity-50"
              style={cyanBtn}
            >
              {saving ? 'Chargement…' : "Commencer l'aventure 🏁"}
            </button>
          </>
        )}

      </div>


    </div>
  );
}
