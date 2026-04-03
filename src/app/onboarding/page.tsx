'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CarSVG, { getCarTypes, CAR_COLORS } from '@/components/CarSVG';
import Gaston from '@/components/Gaston';
import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LanguageContext';
import { GASTON_STEP_MESSAGES } from '@/locales/messages';

const TOTAL_STEPS = 7;

const GOALS = [
  { key: 'soon', icon: '🎯', labelKey: 'onboarding_objectif_permis', subKey: 'onboarding_objectif_permis_sub' },
  { key: 'relax', icon: '📚', labelKey: 'onboarding_objectif_reviser', subKey: 'onboarding_objectif_reviser_sub' },
  { key: 'fun', icon: '🎮', labelKey: 'onboarding_objectif_amuser', subKey: 'onboarding_objectif_amuser_sub' },
];

const CAR_TYPE_OPTIONS = getCarTypes();

// Default colors per car type — visible dès l'affichage
const CAR_DEFAULT_COLORS: Record<string, string> = {
  berline: '#e74c3c',
  suv: '#3498db',
  sportive: '#e67e22',
  mini: '#2ecc71',
  van: '#9b59b6',
  pickup: '#f1c40f',
};

export default function OnboardingPage() {
  const router = useRouter();
  const { signUp, signIn, user } = useAuth();
  const { t, lang } = useLang();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCarType, setSelectedCarType] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#1E88E5');
  const [goal, setGoal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [fade, setFade] = useState(true);
  const [mounted, setMounted] = useState(false);

  const goalLabel = (key: string) => {
    const map: Record<string, string> = { soon: t('onboarding_goal_soon'), relax: t('onboarding_goal_relax'), fun: t('onboarding_goal_fun') };
    return map[key] || key;
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem('@onboarding_done');
      if (done === 'true') {
        router.replace('/');
      }
    }
  }, [router]);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const done = localStorage.getItem('@onboarding_done');
      if (done === 'true') {
        router.replace('/');
      }
    }
  }, [user, router]);

  if (!mounted) return <div className="min-h-screen" />;

  const goTo = (next: number) => {
    setFade(false);
    setTimeout(() => {
      setStep(next);
      setAuthError('');
      setFade(true);
    }, 150);
  };
  const goNext = () => goTo(step + 1);
  const goBack = () => {
    if (step === 2 && showLogin) { setShowLogin(false); return; }
    goTo(step - 1);
  };

  const handleLoginExisting = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError(t('onboarding_remplir_email'));
      return;
    }
    setSaving(true);
    setAuthError('');
    const result = await signIn(email.trim().toLowerCase(), password);
    setSaving(false);
    if (result.error) {
      setAuthError(result.error);
    } else {
      // User logged in with existing account — skip to route
      localStorage.setItem('@onboarding_done', 'true');
      router.push('/');
    }
  };

  const handleFinish = async () => {
    if (saving) return;
    setSaving(true);
    setAuthError('');

    const carType = selectedCarType || 'berline';
    const profile = {
      name: name.trim() || t('pilote'),
      carColor: selectedColor,
      carType,
      objective: goal ?? 'relax',
    };

    localStorage.setItem('userProfile', JSON.stringify(profile));

    if (email.trim() && password.trim() && !showLogin) {
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

  const carType = selectedCarType || 'berline';
  const gastonData = GASTON_STEP_MESSAGES[lang][step] || GASTON_STEP_MESSAGES[lang][1];

  // Cyan button style — always the same
  const cyanBtn = {
    background: '#4ecdc4',
    color: '#0a0e2a',
    boxShadow: '0 4px 16px rgba(78,205,196,0.38)',
  };
  const disabledBtn = {
    background: 'rgba(255,255,255,0.06)',
    color: '#5A6B8A',
    boxShadow: 'none',
  };

  // Sidebar recap items
  const recapItems: { label: string; value: string; emoji: string }[] = [];
  if (name.trim()) recapItems.push({ emoji: '👤', label: t('onboarding_prenom'), value: name.trim() });
  if (step > 2 && email.trim()) recapItems.push({ emoji: '📧', label: 'Email', value: email.trim() });
  if (selectedCarType) recapItems.push({ emoji: '🚗', label: t('onboarding_voiture'), value: CAR_TYPE_OPTIONS.find(c => c.id === selectedCarType)?.label || selectedCarType });
  if (step > 5) recapItems.push({ emoji: '🎨', label: t('onboarding_couleur'), value: CAR_COLORS.find(c => c.id === selectedColor)?.label || selectedColor });
  if (goal) recapItems.push({ emoji: '🎯', label: t('onboarding_objectif'), value: goalLabel(goal) });

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: '#1B1B2F' }}>
      {/* Back button */}
      {step >= 2 && step <= 6 && (
        <button
          onClick={goBack}
          className="fixed top-6 left-6 z-[110] w-11 h-11 rounded-full flex items-center justify-center text-xl press-scale"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}
        >
          ←
        </button>
      )}

      {/* ── Main layout: center + sidebar ── */}
      <div className="w-full max-w-screen-xl mx-auto flex items-start justify-center gap-8 px-4 pt-16 pb-10">

        {/* ── Center content (~500px) ── */}
        <div
          className={`w-full max-w-[500px] flex flex-col items-center transition-opacity duration-150 ${fade ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* ═══════════════ STEP 1 — Bienvenue ═══════════════ */}
          {step === 1 && (
            <>
              <div
                className="w-[130px] h-[130px] rounded-full flex items-center justify-center mb-7 animate-bounce-slow"
                style={{ background: 'rgba(78,205,196,0.1)', border: '3px solid #4ecdc4' }}
              >
                <span className="text-6xl">🚗</span>
              </div>

              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>{t('onboarding_bienvenue')}</p>
              <h1 className="text-4xl font-black text-white text-center mb-2">{t('onboarding_permigo')}</h1>
              <p className="text-base text-center mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {t('onboarding_subtitle')}
              </p>

              <div className="w-full rounded-2xl p-5 mb-8 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-[15px] font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>{t('onboarding_feature_1')}</p>
                <p className="text-[15px] font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>{t('onboarding_feature_2')}</p>
                <p className="text-[15px] font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>{t('onboarding_feature_3')}</p>
              </div>

              <button
                onClick={goNext}
                className="w-full py-4 rounded-2xl font-black text-lg press-scale"
                style={cyanBtn}
              >
                {t('onboarding_commencer')}
              </button>
            </>
          )}

          {/* ═══════════════ STEP 2 — Email / Password ═══════════════ */}
          {step === 2 && (
            <>
              <span className="text-[64px] mb-4">{showLogin ? '🔑' : '📧'}</span>
              <h2 className="text-2xl font-black text-white text-center mb-2">
                {showLogin ? t('login_titre') : t('onboarding_creer_compte')}
              </h2>
              <p className="text-base text-center mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {showLogin ? t('onboarding_identifiants') : t('onboarding_sauvegarder')}
              </p>

              {authError && (
                <div className="w-full rounded-xl p-3 mb-4" style={{ background: 'rgba(255,80,80,0.12)', borderLeft: '3px solid #FF5050' }}>
                  <p className="text-sm font-semibold" style={{ color: '#FF8080' }}>{authError}</p>
                </div>
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-4 text-base font-semibold text-white mb-3 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)' }}
              />
              <input
                type="password"
                placeholder="Mot de passe (min. 6 caractères)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') showLogin ? handleLoginExisting() : goNext(); }}
                className="w-full rounded-xl px-4 py-4 text-base font-semibold text-white mb-4 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)' }}
              />

              {showLogin ? (
                <button
                  onClick={handleLoginExisting}
                  disabled={saving}
                  className="w-full py-4 rounded-2xl font-black text-lg press-scale disabled:opacity-50"
                  style={cyanBtn}
                >
                  {saving ? t('onboarding_connexion_loading') : t('onboarding_se_connecter')}
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="w-full py-4 rounded-2xl font-black text-lg press-scale"
                  style={cyanBtn}
                >
                  {t('onboarding_creer_btn')}
                </button>
              )}

              <button onClick={goNext} className="mt-3 py-2">
                <span className="text-sm underline" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('onboarding_jouer_sans')}</span>
              </button>

              <button
                onClick={() => { setShowLogin(!showLogin); setAuthError(''); }}
                className="mt-2 py-2"
              >
                <span className="text-sm font-semibold" style={{ color: '#4ecdc4' }}>
                  {showLogin ? t('onboarding_pas_compte') : t('onboarding_deja_compte')}
                </span>
              </button>
            </>
          )}

          {/* ═══════════════ STEP 3 — Prénom ═══════════════ */}
          {step === 3 && (
            <>
              <span className="text-[64px] mb-4">👋</span>
              <h2 className="text-2xl font-black text-white text-center mb-2">{t('onboarding_nom_titre')}</h2>
              <p className="text-base text-center mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
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
                className="w-full rounded-2xl px-5 py-4 text-[22px] font-extrabold text-white text-center mb-6 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '2px solid rgba(255,255,255,0.12)' }}
              />

              <button
                onClick={() => { if (name.trim()) goNext(); }}
                disabled={!name.trim()}
                className="w-full py-4 rounded-2xl font-black text-lg press-scale disabled:opacity-30"
                style={name.trim() ? cyanBtn : disabledBtn}
              >
                {t('onboarding_continuer')}
              </button>
            </>
          )}

          {/* ═══════════════ STEP 4 — Choix voiture (type) ═══════════════ */}
          {step === 4 && (
            <>
              <h2 className="text-2xl font-black text-white text-center mb-2">{t('onboarding_voiture_titre')}</h2>
              <p className="text-base text-center mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {t('onboarding_voiture_subtitle')}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-6">
                {CAR_TYPE_OPTIONS.map(car => {
                  const isSelected = selectedCarType === car.id;
                  const defaultColor = CAR_DEFAULT_COLORS[car.id] || '#5A6680';
                  return (
                    <button
                      key={car.id}
                      onClick={() => setSelectedCarType(car.id)}
                      className="rounded-2xl p-4 flex flex-col items-center transition-all duration-150 press-scale relative"
                      style={{
                        background: isSelected ? 'rgba(78,205,196,0.15)' : 'rgba(255,255,255,0.05)',
                        border: isSelected ? '2px solid #4ecdc4' : '2px solid rgba(255,255,255,0.09)',
                      }}
                    >
                      <CarSVG type={car.id} color={isSelected ? '#4ecdc4' : defaultColor} size={80} />
                      <span className="text-[13px] font-bold mt-2" style={{ color: isSelected ? '#4ecdc4' : 'rgba(255,255,255,0.6)' }}>
                        {car.label}
                      </span>
                      {isSelected && <span className="absolute top-2 right-2 text-lg font-black" style={{ color: '#4ecdc4' }}>✓</span>}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { if (selectedCarType) goNext(); }}
                disabled={!selectedCarType}
                className="w-full py-4 rounded-2xl font-black text-lg press-scale disabled:opacity-30"
                style={selectedCarType ? cyanBtn : disabledBtn}
              >
                {selectedCarType
                  ? `${CAR_TYPE_OPTIONS.find(c => c.id === selectedCarType)?.label} ${t('onboarding_choisie')}`
                  : t('onboarding_voiture_choisir')}
              </button>
            </>
          )}

          {/* ═══════════════ STEP 5 — Couleur ═══════════════ */}
          {step === 5 && (
            <>
              <h2 className="text-2xl font-black text-white text-center mb-2">{t('onboarding_couleur_titre')}</h2>
              <p className="text-base text-center mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {t('onboarding_couleur_subtitle')}
              </p>

              <div className="flex items-center justify-center mb-7 h-[120px]">
                <CarSVG color={selectedColor} size={180} type={carType} />
              </div>

              <div className="flex flex-wrap justify-center gap-3.5 mb-7 w-4/5">
                {CAR_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className="w-11 h-11 rounded-full transition-all duration-150 press-scale"
                    style={{
                      background: c.id,
                      border: selectedColor === c.id ? '3px solid white' : '2px solid transparent',
                      boxShadow: selectedColor === c.id ? '0 0 12px rgba(255,255,255,0.4)' : 'none',
                    }}
                    title={c.label}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                className="w-full py-4 rounded-2xl font-black text-lg press-scale"
                style={cyanBtn}
              >
                {t('onboarding_continuer')}
              </button>
            </>
          )}

          {/* ═══════════════ STEP 6 — Objectif ═══════════════ */}
          {step === 6 && (
            <>
              <h2 className="text-2xl font-black text-white text-center mb-2">{t('onboarding_objectif_titre')}</h2>
              <p className="text-base text-center mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {t('onboarding_objectif_subtitle')}
              </p>

              <div className="w-full flex flex-col gap-3 mb-6">
                {GOALS.map(g => {
                  const isSelected = goal === g.key;
                  return (
                    <button
                      key={g.key}
                      onClick={() => setGoal(g.key)}
                      className="flex items-center gap-3.5 rounded-2xl p-4 text-left transition-all duration-150 press-scale"
                      style={{
                        background: isSelected ? 'rgba(78,205,196,0.15)' : 'rgba(255,255,255,0.05)',
                        border: isSelected ? '2px solid #4ecdc4' : '2px solid rgba(255,255,255,0.09)',
                      }}
                    >
                      <span className="text-[34px]" style={{ filter: isSelected ? 'brightness(1.3)' : 'none' }}>{g.icon}</span>
                      <div className="flex-1">
                        <p className="text-[15px] font-extrabold" style={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.65)' }}>
                          {t(g.labelKey)}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{t(g.subKey)}</p>
                      </div>
                      {isSelected && <span className="text-[22px] font-black" style={{ color: '#4ecdc4' }}>✓</span>}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { if (goal) goNext(); }}
                disabled={!goal}
                className="w-full py-4 rounded-2xl font-black text-lg press-scale disabled:opacity-30"
                style={goal ? cyanBtn : disabledBtn}
              >
                {t('onboarding_continuer')}
              </button>
            </>
          )}

          {/* ═══════════════ STEP 7 — C'est parti ! ═══════════════ */}
          {step === 7 && (
            <>
              <span className="text-[72px] mb-4">🎉</span>
              <h2 className="text-4xl font-black text-white text-center mb-2">{t('onboarding_pret')}</h2>
              <p className="text-lg text-center mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {t('onboarding_tout_pret')}{name.trim() ? `, ${name.trim()}` : ''} !
              </p>

              <div className="flex items-center justify-center mb-6 animate-drive-in">
                <CarSVG color={selectedColor} size={150} type={carType} />
              </div>

              {goal && (
                <p className="text-base font-semibold text-center mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {t('onboarding_objectif_label')} : {goalLabel(goal)}
                </p>
              )}

              {/* Mobile Gaston */}
              <div className="lg:hidden mb-6 w-full">
                <Gaston
                  message={`${t('onboarding_en_route')} ${name.trim() || t('pilote')} !`}
                  expression="party"
                  size="small"
                />
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
                {saving ? t('register_loading') : t('onboarding_aventure')}
              </button>
            </>
          )}

          {/* Step dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i + 1 === step ? 24 : 8,
                  background: i + 1 === step ? '#4ecdc4' : 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Desktop sidebar — recap + Gaston ── */}
        <div className="hidden lg:flex flex-col gap-5 w-72 flex-shrink-0 mt-16">

          {/* Gaston contextuel */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)' }}>
            <Gaston message={gastonData.msg} expression={gastonData.expr} size="small" title={t('prof_gaston')} />
          </div>

          {/* Recap */}
          {recapItems.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#4ecdc4' }}>{t('onboarding_profil')}</h4>
              <div className="flex flex-col gap-3">
                {recapItems.map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-lg">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase" style={{ color: '#5A6B8A' }}>{item.label}</p>
                      <p className="text-sm font-bold truncate text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color preview in sidebar when on color step */}
          {step >= 4 && selectedCarType && (
            <div className="rounded-2xl p-5 flex flex-col items-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3 self-start" style={{ color: '#4ecdc4' }}>{t('onboarding_ta_voiture')}</h4>
              <CarSVG type={carType} color={selectedColor} size={140} />
              <p className="text-xs font-bold mt-2" style={{ color: '#8B9DC3' }}>
                {CAR_TYPE_OPTIONS.find(c => c.id === selectedCarType)?.label} — {CAR_COLORS.find(c => c.id === selectedColor)?.label || 'Bleu'}
              </p>
            </div>
          )}

          {/* Step indicator */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>{t('onboarding_etape')}</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black" style={{ color: '#4ecdc4' }}>{step}</span>
              <span className="text-sm" style={{ color: '#5A6B8A' }}>/ {TOTAL_STEPS}</span>
            </div>
            <div className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: '#4ecdc4' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
