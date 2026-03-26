'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CarSVG, { getCarTypes, CAR_COLORS } from '@/components/CarSVG';
import Gaston from '@/components/Gaston';
import { useAuth } from '@/contexts/AuthContext';

const TOTAL_STEPS = 7;

const GOALS = [
  { key: 'soon', icon: '🎯', label: 'Passer mon permis bientôt', sub: 'Je suis déterminé(e) !' },
  { key: 'relax', icon: '📚', label: 'Réviser tranquillement', sub: 'À mon rythme' },
  { key: 'fun', icon: '🎮', label: "M'amuser en apprenant", sub: 'Apprendre en jouant' },
];

const GOAL_LABELS: Record<string, string> = {
  soon: 'Passer le permis bientôt',
  relax: 'Révision tranquille',
  fun: "Apprendre en s'amusant",
};

const CAR_TYPE_OPTIONS = getCarTypes();

export default function OnboardingPage() {
  const router = useRouter();
  const { signUp, signIn, user } = useAuth();

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

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem('@onboarding_done');
      if (done === 'true') {
        router.replace('/');
      }
    }
  }, [router]);

  // Already logged in from a previous onboarding — redirect
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
    if (step === 3 && showLogin) { setShowLogin(false); return; }
    goTo(step - 1);
  };

  const handleLoginExisting = async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError("Remplis l'email et le mot de passe.");
      return;
    }
    setSaving(true);
    setAuthError('');
    const result = await signIn(email.trim().toLowerCase(), password);
    setSaving(false);
    if (result.error) {
      setAuthError(result.error);
    } else {
      goNext();
    }
  };

  const handleFinish = async () => {
    if (saving) return;
    setSaving(true);
    setAuthError('');

    const carType = selectedCarType || 'berline';
    const profile = {
      name: name.trim() || 'Joueur',
      carColor: selectedColor,
      carType,
      objective: goal ?? 'relax',
    };

    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profile));

    // Create account if email+password provided and not in login mode
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto" style={{ background: '#1B1B2F' }}>
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

      <div
        className={`w-full max-w-md mx-auto px-6 py-10 flex flex-col items-center transition-opacity duration-150 ${fade ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* ═══════════════ STEP 1 — Bienvenue ═══════════════ */}
        {step === 1 && (
          <>
            <div
              className="w-[130px] h-[130px] rounded-full flex items-center justify-center mb-7 animate-bounce-slow"
              style={{ background: 'rgba(0,184,148,0.1)', border: '3px solid #00B894' }}
            >
              <span className="text-6xl">🚗</span>
            </div>

            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>Bienvenue sur</p>
            <h1 className="text-4xl font-black text-white text-center mb-2">PermiGo ! 🚗</h1>
            <p className="text-base text-center mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Ta route vers le permis belge
            </p>

            <div className="w-full rounded-2xl p-5 mb-8 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-[15px] font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>✅  Théorie complète &amp; quiz interactifs</p>
              <p className="text-[15px] font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>🏆  Progression thème par thème</p>
              <p className="text-[15px] font-semibold" style={{ color: 'rgba(255,255,255,0.78)' }}>🚦  Prépare ton examen officiel</p>
            </div>

            <button
              onClick={goNext}
              className="w-full py-4 rounded-2xl font-black text-lg text-white press-scale"
              style={{ background: '#00B894', boxShadow: '0 4px 16px rgba(0,184,148,0.38)' }}
            >
              Commencer
            </button>
          </>
        )}

        {/* ═══════════════ STEP 2 — Prénom ═══════════════ */}
        {step === 2 && (
          <>
            <span className="text-[64px] mb-4">👋</span>
            <h2 className="text-2xl font-black text-white text-center mb-2">Comment tu t&apos;appelles ?</h2>
            <p className="text-base text-center mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
              On personnalisera l&apos;expérience pour toi
            </p>

            <input
              type="text"
              placeholder="Ton prénom…"
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
              className="w-full py-4 rounded-2xl font-black text-lg text-white press-scale disabled:opacity-30"
              style={{ background: name.trim() ? '#00B894' : 'rgba(255,255,255,0.09)', boxShadow: name.trim() ? '0 4px 16px rgba(0,184,148,0.38)' : 'none' }}
            >
              Continuer →
            </button>
          </>
        )}

        {/* ═══════════════ STEP 3 — Email / Password ═══════════════ */}
        {step === 3 && (
          <>
            <span className="text-[64px] mb-4">{showLogin ? '🔑' : '📧'}</span>
            <h2 className="text-2xl font-black text-white text-center mb-2">
              {showLogin ? 'Connexion' : 'Crée ton compte'}
            </h2>
            <p className="text-base text-center mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {showLogin ? 'Entre tes identifiants' : 'Pour sauvegarder ta progression en ligne'}
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
                className="w-full py-4 rounded-2xl font-black text-lg text-white press-scale disabled:opacity-50"
                style={{ background: '#00B894', boxShadow: '0 4px 16px rgba(0,184,148,0.38)' }}
              >
                {saving ? 'Connexion...' : 'Se connecter →'}
              </button>
            ) : (
              <button
                onClick={goNext}
                className="w-full py-4 rounded-2xl font-black text-lg text-white press-scale"
                style={{ background: '#00B894', boxShadow: '0 4px 16px rgba(0,184,148,0.38)' }}
              >
                Créer mon compte →
              </button>
            )}

            <button onClick={goNext} className="mt-3 py-2">
              <span className="text-sm underline" style={{ color: 'rgba(255,255,255,0.35)' }}>Jouer sans compte</span>
            </button>

            <button
              onClick={() => { setShowLogin(!showLogin); setAuthError(''); }}
              className="mt-2 py-2"
            >
              <span className="text-sm font-semibold" style={{ color: '#00B894' }}>
                {showLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
              </span>
            </button>
          </>
        )}

        {/* ═══════════════ STEP 4 — Choix voiture (type) ═══════════════ */}
        {step === 4 && (
          <>
            <h2 className="text-2xl font-black text-white text-center mb-2">Choisis ta voiture ! 🚗</h2>
            <p className="text-base text-center mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Elle t&apos;accompagnera tout au long du parcours
            </p>

            <div className="grid grid-cols-2 gap-3 w-full mb-6">
              {CAR_TYPE_OPTIONS.map(car => {
                const isSelected = selectedCarType === car.id;
                return (
                  <button
                    key={car.id}
                    onClick={() => setSelectedCarType(car.id)}
                    className="rounded-2xl p-3 flex flex-col items-center transition-all press-scale relative"
                    style={{
                      background: isSelected ? 'rgba(0,184,148,0.1)' : 'rgba(255,255,255,0.05)',
                      border: isSelected ? '2px solid #00B894' : '2px solid rgba(255,255,255,0.09)',
                      transform: isSelected ? 'scale(1.05)' : undefined,
                    }}
                  >
                    <CarSVG type={car.id} color={isSelected ? '#00B894' : '#5A6680'} size={80} />
                    <span className="text-[13px] font-bold mt-1" style={{ color: isSelected ? '#00B894' : 'rgba(255,255,255,0.5)' }}>
                      {car.label}
                    </span>
                    {isSelected && <span className="absolute top-2 right-2 text-lg font-black" style={{ color: '#00B894' }}>✓</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { if (selectedCarType) goNext(); }}
              disabled={!selectedCarType}
              className="w-full py-4 rounded-2xl font-black text-lg text-white press-scale disabled:opacity-30"
              style={{ background: selectedCarType ? '#00B894' : 'rgba(255,255,255,0.09)', boxShadow: selectedCarType ? '0 4px 16px rgba(0,184,148,0.38)' : 'none' }}
            >
              {selectedCarType
                ? `${CAR_TYPE_OPTIONS.find(c => c.id === selectedCarType)?.label} choisie ! →`
                : 'Choisir une voiture'}
            </button>
          </>
        )}

        {/* ═══════════════ STEP 5 — Couleur ═══════════════ */}
        {step === 5 && (
          <>
            <h2 className="text-2xl font-black text-white text-center mb-2">Quelle couleur ? 🎨</h2>
            <p className="text-base text-center mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Ta voiture change de couleur en temps réel
            </p>

            <div className="flex items-center justify-center mb-7 h-[120px]">
              <CarSVG color={selectedColor} size={180} type={carType} />
            </div>

            <div className="flex flex-wrap justify-center gap-3.5 mb-7 w-4/5">
              {CAR_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className="w-11 h-11 rounded-full transition-all press-scale"
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
              className="w-full py-4 rounded-2xl font-black text-lg text-white press-scale"
              style={{ background: selectedColor, boxShadow: `0 4px 16px ${selectedColor}60` }}
            >
              Continuer →
            </button>
          </>
        )}

        {/* ═══════════════ STEP 6 — Objectif ═══════════════ */}
        {step === 6 && (
          <>
            <h2 className="text-2xl font-black text-white text-center mb-2">Ton objectif ? 🎯</h2>
            <p className="text-base text-center mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
              On s&apos;adaptera à ton rythme
            </p>

            <div className="w-full flex flex-col gap-3 mb-6">
              {GOALS.map(g => {
                const isSelected = goal === g.key;
                return (
                  <button
                    key={g.key}
                    onClick={() => setGoal(g.key)}
                    className="flex items-center gap-3.5 rounded-2xl p-4 text-left transition-all press-scale"
                    style={{
                      background: isSelected ? 'rgba(0,184,148,0.08)' : 'rgba(255,255,255,0.05)',
                      border: isSelected ? '2px solid #00B894' : '2px solid rgba(255,255,255,0.09)',
                    }}
                  >
                    <span className="text-[34px]">{g.icon}</span>
                    <div className="flex-1">
                      <p className="text-[15px] font-extrabold" style={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.65)' }}>
                        {g.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{g.sub}</p>
                    </div>
                    {isSelected && <span className="text-[22px] font-black" style={{ color: '#00B894' }}>✓</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { if (goal) goNext(); }}
              disabled={!goal}
              className="w-full py-4 rounded-2xl font-black text-lg text-white press-scale disabled:opacity-30"
              style={{ background: goal ? '#00B894' : 'rgba(255,255,255,0.09)', boxShadow: goal ? '0 4px 16px rgba(0,184,148,0.38)' : 'none' }}
            >
              Continuer →
            </button>
          </>
        )}

        {/* ═══════════════ STEP 7 — C'est parti ! ═══════════════ */}
        {step === 7 && (
          <>
            <span className="text-[72px] mb-4">🎉</span>
            <h2 className="text-4xl font-black text-white text-center mb-2">C&apos;est parti !</h2>
            <p className="text-lg text-center mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Tout est prêt{name.trim() ? `, ${name.trim()}` : ''} !
            </p>

            <div className="flex items-center justify-center mb-6 animate-drive-in">
              <CarSVG color={selectedColor} size={150} type={carType} />
            </div>

            {goal && (
              <p className="text-base font-semibold text-center mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
                🎯 Objectif : {GOAL_LABELS[goal]}
              </p>
            )}

            <div className="mb-6 w-full">
              <Gaston
                message={`En route ${name.trim() || 'pilote'} ! On va conquérir ce permis ensemble ! 🚗`}
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
              className="w-full py-4 rounded-2xl font-black text-lg text-white press-scale disabled:opacity-50"
              style={{ background: '#00B894', boxShadow: '0 4px 16px rgba(0,184,148,0.38)' }}
            >
              {saving ? 'Création...' : "Commencer l'aventure →"}
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
                background: i + 1 === step ? '#00B894' : 'rgba(255,255,255,0.18)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
