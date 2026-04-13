'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/supabaseUser';
import { useLang } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const TOTAL_STEPS = 5;

const CARS = [
  { id: 'red',   name: 'Rouge', nameNL: 'Rood',  image: '/images/cars/car-red.png',   color: '#e74c3c' },
  { id: 'blue',  name: 'Bleue', nameNL: 'Blauw', image: '/images/cars/car-blue.png',  color: '#3498db' },
  { id: 'green', name: 'Verte', nameNL: 'Verte',  image: '/images/cars/car-green.png', color: '#2ecc71' },
];


export default function OnboardingPage() {
  const router = useRouter();
  const { signUp, user, supabaseUser } = useAuth();
  const { t, lang } = useLang();

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
  const [selectedCar, setSelectedCar] = useState<typeof CARS[0] | null>(null);
  const [goal, setGoal]                   = useState<string | null>(null);
  const [saving, setSaving]               = useState(false);
  const [authError, setAuthError]         = useState('');
  const [fade, setFade]                   = useState(true);
  const [mounted, setMounted]             = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

    const car = selectedCar ?? CARS[1]; // default: blue
    const profile = {
      name:      name.trim() || t('pilote'),
      carColor:  car.color,
      carType:   car.id,
      objective: goal ?? 'relax',
    };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('userCar', JSON.stringify({ id: car.id, name: car.name, image: car.image, color: car.color }));

    // Persist to Supabase if user is already authenticated
    if (supabaseUser?.id) {
      updateUserProfile(supabaseUser.id, {
        username: profile.name,
        car_type: profile.carType,
        car_color: profile.carColor,
        objective: profile.objective,
      }).catch(console.error);
    }

    if (email.trim() && password.trim()) {
      const result = await signUp(email.trim().toLowerCase(), password, profile.name);
      if (result.error) {
        setAuthError(result.error);
        setSaving(false);
        return;
      }
    }

    localStorage.setItem('@onboarding_done', 'true');
    document.cookie = 'onboarding_done=true; path=/; max-age=31536000; SameSite=Lax';
    setSaving(false);
    window.location.href = '/app';
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

  const carStep3Ready = !!selectedCar;

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
            maxWidth: 'min(300px, 85vw)',
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
              {t('onboarding_nom_titre')}
            </h2>
            <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('onboarding_nom_subtitle')}
            </p>

            <input
              type="text"
              placeholder={t('onboarding_nom_placeholder')}
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
              {t('onboarding_continuer')}
            </button>
          </>
        )}

        {/* ═══════════ STEP 3 — Voiture ═══════════ */}
        {step === 3 && (
          <>
            <h2 className="text-3xl font-black text-white text-center mb-1">
              {t('onboarding_voiture_titre')}
            </h2>
            <p className="text-sm text-center mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('onboarding_voiture_subtitle')}
            </p>

            {/* Live preview */}
            <div className="flex items-center justify-center mb-6" style={{ height: 130 }}>
              {selectedCar ? (
                <div style={{ position: 'relative' }}>
                  <div className="absolute rounded-full" style={{
                    width: 180, height: 80, top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(circle, ${selectedCar.color}55 0%, transparent 70%)`,
                    filter: 'blur(20px)',
                  }} />
                  <Image
                    src={selectedCar.image}
                    width={200}
                    height={110}
                    alt={selectedCar.name}
                    className="relative z-10 car-bounce"
                    style={{ objectFit: 'contain', filter: `drop-shadow(0 6px 16px ${selectedCar.color}88)` }}
                  />
                </div>
              ) : (
                <div className="text-5xl opacity-30">🚗</div>
              )}
            </div>

            {/* 3 car cards */}
            <div className="grid grid-cols-3 gap-2 w-full mb-6">
              {CARS.map(car => {
                const isSelected = selectedCar?.id === car.id;
                return (
                  <button
                    key={car.id}
                    onClick={() => setSelectedCar(car)}
                    className="rounded-2xl p-2 sm:p-3 flex flex-col items-center transition-all duration-150 press-scale relative"
                    style={{
                      background: isSelected ? `${car.color}22` : 'rgba(255,255,255,0.04)',
                      border: isSelected ? `2px solid ${car.color}` : '2px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <Image src={car.image} width={56} height={36} alt={car.name} className="sm:w-[72px] sm:h-[44px]" style={{ objectFit: 'contain' }} />
                    <span className="text-[11px] font-bold mt-1" style={{ color: isSelected ? car.color : 'rgba(255,255,255,0.5)' }}>
                      {lang === 'nl' ? car.nameNL : car.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 text-[10px] font-black" style={{ color: car.color }}>✓</span>
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
              {carStep3Ready ? t('onboarding_voiture_ma') : t('onboarding_voiture_choisir')}
            </button>
          </>
        )}

        {/* ═══════════ STEP 4 — Objectif ═══════════ */}
        {step === 4 && (
          <>
            <span className="text-[60px] mb-4 block">🏁</span>
            <h2 className="text-3xl font-black text-white text-center mb-2">
              {t('onboarding_objectif_titre')}
            </h2>
            <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('onboarding_objectif_subtitle')}
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
              {name.trim() ? `${t('onboarding_cest_parti')}, ${name.trim()} !` : `${t('onboarding_cest_parti')} !`}
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
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#5A6B8A' }}>{t('pilote')}</p>
                <p className="text-sm font-black text-white leading-tight">{name.trim() || '—'}</p>
              </div>
              {/* Card 2 — Voiture */}
              <div className="flex-1 flex flex-col items-center rounded-2xl p-5 text-center" style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(78,205,196,0.2)',
              }}>
                {selectedCar ? (
                  <Image src={selectedCar.image} width={64} height={36} alt={selectedCar.name}
                    className="mb-2" style={{ objectFit: 'contain', filter: `drop-shadow(0 2px 6px ${selectedCar.color}88)` }} />
                ) : <span className="text-3xl mb-2">🚗</span>}
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#5A6B8A' }}>{t('onboarding_voiture')}</p>
                <p className="text-sm font-black leading-tight" style={{ color: selectedCar?.color ?? 'white' }}>
                  {selectedCar ? (lang === 'nl' ? selectedCar.nameNL : selectedCar.name) : '—'}
                </p>
              </div>
              {/* Card 3 — Objectif */}
              <div className="flex-1 flex flex-col items-center rounded-2xl p-5 text-center" style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(78,205,196,0.2)',
              }}>
                <span className="text-3xl mb-2">{GOALS.find(g => g.key === goal)?.icon || '🎯'}</span>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#5A6B8A' }}>{t('onboarding_objectif')}</p>
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
              {saving ? t('premium_chargement') : t('onboarding_commencer')}
            </button>
          </>
        )}

      </div>


    </div>
  );
}
