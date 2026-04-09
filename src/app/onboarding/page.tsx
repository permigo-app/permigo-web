'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCarTypes, CAR_COLORS } from '@/components/CarSVG';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const TOTAL_STEPS = 5;

const CAR_TYPE_OPTIONS = getCarTypes();

const CAR_EMOJIS: Record<string, string> = {
  berline:   '🚗',
  suv:       '🚙',
  sportive:  '🏎️',
  mini:      '🚕',
  van:       '🚐',
  pickup:    '🚚',
};


const CAR_SVGS: Record<string, (color: string, w?: number, h?: number) => React.ReactElement> = {
  berline: (color, w = 200, h = 100) => (
    <svg viewBox="0 0 200 100" width={w} height={h}>
      <rect x="20" y="45" width="160" height="40" rx="8" fill={color}/>
      <ellipse cx="100" cy="45" rx="55" ry="22" fill={color}/>
      <rect x="35" y="28" width="130" height="25" rx="10" fill={color}/>
      <rect x="45" y="31" width="45" height="18" rx="4" fill="#a8d8f0" opacity="0.8"/>
      <rect x="95" y="31" width="45" height="18" rx="4" fill="#a8d8f0" opacity="0.8"/>
      <circle cx="55" cy="82" r="14" fill="#222"/><circle cx="55" cy="82" r="6" fill="#555"/>
      <circle cx="145" cy="82" r="14" fill="#222"/><circle cx="145" cy="82" r="6" fill="#555"/>
      <rect x="20" y="52" width="14" height="8" rx="3" fill="#FFD700"/>
      <rect x="166" y="52" width="14" height="8" rx="3" fill="#FFD700"/>
    </svg>
  ),
  suv: (color, w = 200, h = 100) => (
    <svg viewBox="0 0 200 100" width={w} height={h}>
      <rect x="15" y="30" width="170" height="52" rx="8" fill={color}/>
      <rect x="25" y="15" width="150" height="25" rx="6" fill={color}/>
      <rect x="32" y="18" width="55" height="18" rx="3" fill="#a8d8f0" opacity="0.8"/>
      <rect x="93" y="18" width="55" height="18" rx="3" fill="#a8d8f0" opacity="0.8"/>
      <circle cx="50" cy="82" r="16" fill="#222"/><circle cx="50" cy="82" r="7" fill="#555"/>
      <circle cx="150" cy="82" r="16" fill="#222"/><circle cx="150" cy="82" r="7" fill="#555"/>
      <rect x="15" y="38" width="14" height="10" rx="3" fill="#FFD700"/>
      <rect x="171" y="38" width="14" height="10" rx="3" fill="#FFD700"/>
    </svg>
  ),
  sportive: (color, w = 200, h = 100) => (
    <svg viewBox="0 0 200 100" width={w} height={h}>
      <rect x="10" y="55" width="180" height="28" rx="6" fill={color}/>
      <path d="M30 55 Q60 30 100 28 Q140 28 170 55Z" fill={color}/>
      <path d="M55 53 Q75 35 105 33 Q130 33 148 53Z" fill="#a8d8f0" opacity="0.8"/>
      <circle cx="50" cy="83" r="13" fill="#222"/><circle cx="50" cy="83" r="5" fill="#555"/>
      <circle cx="150" cy="83" r="13" fill="#222"/><circle cx="150" cy="83" r="5" fill="#555"/>
      <rect x="12" y="58" width="16" height="7" rx="3" fill="#FFD700"/>
      <rect x="172" y="58" width="16" height="7" rx="3" fill="#FFD700"/>
    </svg>
  ),
  mini: (color, w = 200, h = 100) => (
    <svg viewBox="0 0 200 100" width={w} height={h}>
      <rect x="35" y="45" width="130" height="38" rx="10" fill={color}/>
      <ellipse cx="100" cy="45" rx="50" ry="25" fill={color}/>
      <rect x="48" y="28" width="104" height="25" rx="12" fill={color}/>
      <rect x="55" y="31" width="38" height="17" rx="5" fill="#a8d8f0" opacity="0.8"/>
      <rect x="98" y="31" width="38" height="17" rx="5" fill="#a8d8f0" opacity="0.8"/>
      <circle cx="62" cy="82" r="13" fill="#222"/><circle cx="62" cy="82" r="5" fill="#555"/>
      <circle cx="138" cy="82" r="13" fill="#222"/><circle cx="138" cy="82" r="5" fill="#555"/>
      <rect x="35" y="52" width="12" height="8" rx="3" fill="#FFD700"/>
      <rect x="153" y="52" width="12" height="8" rx="3" fill="#FFD700"/>
    </svg>
  ),
  van: (color, w = 200, h = 100) => (
    <svg viewBox="0 0 200 100" width={w} height={h}>
      <rect x="10" y="22" width="180" height="60" rx="8" fill={color}/>
      <rect x="15" y="28" width="35" height="25" rx="4" fill="#a8d8f0" opacity="0.8"/>
      <rect x="58" y="28" width="35" height="20" rx="3" fill="#a8d8f0" opacity="0.8"/>
      <rect x="100" y="28" width="35" height="20" rx="3" fill="#a8d8f0" opacity="0.8"/>
      <circle cx="45" cy="82" r="15" fill="#222"/><circle cx="45" cy="82" r="6" fill="#555"/>
      <circle cx="155" cy="82" r="15" fill="#222"/><circle cx="155" cy="82" r="6" fill="#555"/>
      <rect x="10" y="32" width="12" height="12" rx="3" fill="#FFD700"/>
    </svg>
  ),
  pickup: (color, w = 200, h = 100) => (
    <svg viewBox="0 0 200 100" width={w} height={h}>
      <rect x="10" y="35" width="85" height="47" rx="8" fill={color}/>
      <rect x="18" y="20" width="70" height="25" rx="6" fill={color}/>
      <rect x="95" y="48" width="95" height="34" rx="4" fill={color}/>
      <rect x="22" y="23" width="55" height="18" rx="4" fill="#a8d8f0" opacity="0.8"/>
      <circle cx="45" cy="82" r="15" fill="#222"/><circle cx="45" cy="82" r="6" fill="#555"/>
      <circle cx="155" cy="82" r="15" fill="#222"/><circle cx="155" cy="82" r="6" fill="#555"/>
      <rect x="10" y="44" width="13" height="9" rx="3" fill="#FFD700"/>
    </svg>
  ),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { signUp, user } = useAuth();
  const { t } = useLang();

  const GOALS = [
    { key: 'soon',  icon: '🎯', label: t('onboarding_goal_soon_label'),  sub: t('onboarding_goal_soon_sub') },
    { key: 'relax', icon: '📚', label: t('onboarding_goal_relax_label'), sub: t('onboarding_goal_relax_sub') },
    { key: 'fun',   icon: '🎮', label: t('onboarding_goal_fun_label'),   sub: t('onboarding_goal_fun_sub') },
  ];

  const PILLS = [
    t('onboarding_pill_1'),
    t('onboarding_pill_2'),
    t('onboarding_pill_3'),
    t('onboarding_pill_4'),
  ];

  const GASTON_MESSAGES: Record<number, string> = {
    1: t('gaston_onboarding_1'),
    2: t('gaston_onboarding_2'),
    3: t('gaston_onboarding_3'),
    4: t('gaston_onboarding_4'),
    5: t('gaston_onboarding_5'),
  };

  const goalLabels: Record<string, string> = {
    soon:  t('onboarding_goal_soon_label'),
    relax: t('onboarding_goal_relax_label'),
    fun:   t('onboarding_goal_fun_label'),
  };

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
            width={140} height={140}
            alt="Prof. Gaston"
            className="gaston-float"
            style={{ objectFit: 'contain', flexShrink: 0 }}
          />
          <div style={{
            background: '#1a2040',
            border: '1.5px solid rgba(78,205,196,0.3)',
            borderRadius: '16px 16px 16px 0',
            padding: '18px 22px',
            fontSize: 16,
            color: 'white',
            lineHeight: 1.55,
            fontWeight: 600,
            maxWidth: 300,
          }}>
            {GASTON_MESSAGES[step]}
          </div>
        </div>

        {/* ═══════════ STEP 1 — Accueil ═══════════ */}
        {step === 1 && (
          <>
            {/* Titre MyPermiGo */}
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#4ecdc4', letterSpacing: '-1px', marginBottom: '24px' }}>
              MyPermiGo
            </div>

            {/* Eyebrow */}
            <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: 'rgba(78,205,196,0.7)' }}>
              Belgique • FR + NL
            </p>

            <h1 className="text-[38px] font-black text-white text-center leading-tight mb-3" style={{ letterSpacing: '-0.5px' }}>
              {t('onboarding_hero_titre')}<br />
              <span style={{ color: '#4ecdc4' }}>{t('onboarding_hero_accent')}</span>
            </h1>

            <p className="text-sm text-center mb-7" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 340 }}>
              {t('onboarding_hero_desc')}
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
              {t('onboarding_cta_start')}
            </button>

            <button onClick={() => router.push('/login')} className="py-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {t('onboarding_deja_compte_btn')}
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
            <div className="relative flex items-center justify-center mb-4" style={{ width: 220, height: 110 }}>
              {/* glow derrière */}
              <div className="absolute rounded-full" style={{
                width: 180, height: 90,
                background: `radial-gradient(circle, ${carColor}55 0%, transparent 70%)`,
                filter: 'blur(22px)',
              }} />
              <div
                className="relative z-10"
                style={{
                  opacity: selectedCarType ? 1 : 0.25,
                  transition: 'opacity 0.2s',
                  filter: `drop-shadow(0 4px 12px ${carColor}88)`,
                }}
              >
                {(CAR_SVGS[carType] ?? CAR_SVGS.berline)(carColor)}
              </div>
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
              {carStep3Ready ? t('onboarding_voiture_ma') : selectedCarType ? t('onboarding_voiture_couleur') : t('onboarding_voiture_choisir')}
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
              {t('onboarding_objectif_cta')}
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
              {t('onboarding_final_subtitle')}
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
                <div className="mb-2" style={{ filter: `drop-shadow(0 2px 6px ${carColor}88)` }}>
                  {(CAR_SVGS[selectedCarType || 'berline'] ?? CAR_SVGS.berline)(carColor, 64, 32)}
                </div>
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
