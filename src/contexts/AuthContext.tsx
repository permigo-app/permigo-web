'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, hasSupabase } from '@/lib/supabase';
import { getUserProfile, createUserProfile, mapProfileToUser, type AppUser } from '@/lib/supabaseUser';
import { syncAllToSupabase, getXPData, getStreakData, applyCompletedPartiesFromRemote, applyPanneauxMasteredFromRemote, applyStarsFromRemote, applyExamsFromRemote, applyAmProgressFromRemote, getAmProgressSnapshot, syncAmToSupabase } from '@/lib/progressStorage';
import { useLang } from '@/contexts/LanguageContext';

type Lang = 'fr' | 'nl';

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  user: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function translateError(msg: string, lang: Lang = 'fr'): string {
  const errors: Record<string, Record<Lang, string>> = {
    already_registered: {
      fr: 'Cette adresse email est déjà utilisée',
      nl: 'Dit e-mailadres is al in gebruik',
    },
    invalid_login: {
      fr: 'Email ou mot de passe incorrect',
      nl: 'E-mail of wachtwoord onjuist',
    },
    invalid_email: {
      fr: 'Adresse email invalide',
      nl: 'Ongeldig e-mailadres',
    },
    password_length: {
      fr: 'Le mot de passe doit faire au moins 6 caractères',
      nl: 'Het wachtwoord moet minstens 6 tekens bevatten',
    },
    email_not_confirmed: {
      fr: 'Confirme ton email avant de te connecter (vérifie tes spams)',
      nl: 'Bevestig je e-mail voordat je inlogt (controleer je spam)',
    },
    rate_limit: {
      fr: 'Trop de tentatives, réessaie dans quelques minutes',
      nl: 'Te veel pogingen, probeer over een paar minuten opnieuw',
    },
    network: {
      fr: 'Erreur réseau, vérifie ta connexion',
      nl: 'Netwerkfout, controleer je verbinding',
    },
  };

  if (msg.includes('already registered')) return errors.already_registered[lang];
  if (msg.includes('Invalid login')) return errors.invalid_login[lang];
  if (msg.includes('invalid email')) return errors.invalid_email[lang];
  if (msg.includes('least 6')) return errors.password_length[lang];
  if (msg.includes('Email not confirmed')) return errors.email_not_confirmed[lang];
  if (msg.includes('rate limit') || msg.includes('too many')) return errors.rate_limit[lang];
  if (msg.includes('network') || msg.includes('fetch')) return errors.network[lang];

  return lang === 'nl'
    ? 'Er is een fout opgetreden — probeer opnieuw'
    : 'Une erreur est survenue — réessaie';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const CAR_MAP: Record<string, { id: string; name: string; image: string; color: string }> = {
    red:   { id: 'red',   name: 'Rouge', image: '/images/cars/car-red.png',   color: '#e74c3c' },
    blue:  { id: 'blue',  name: 'Bleue', image: '/images/cars/car-blue.png',  color: '#3498db' },
    green: { id: 'green', name: 'Verte', image: '/images/cars/car-green.png', color: '#2ecc71' },
  };

  const loadProfile = useCallback(async (sbUser: SupabaseUser) => {
    const profile = await getUserProfile(sbUser.id);
    if (profile) {
      setUser(mapProfileToUser(profile));
      // ── Sync Supabase → localStorage ──────────────────────────
      if (typeof window === 'undefined') return;

      // Premium : Supabase fait foi — efface tout bypass local
      if (profile.is_premium) {
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('permigo_vip', 'true');
      } else {
        localStorage.removeItem('isPremium');
        localStorage.removeItem('permigo_vip');
      }
      window.dispatchEvent(new Event('premiumStatusChanged'));

      // Car + profile
      if (profile.car_type && CAR_MAP[profile.car_type]) {
        const car = CAR_MAP[profile.car_type];
        const color = profile.car_color ?? car.color;
        localStorage.setItem('userCar', JSON.stringify({ id: car.id, name: car.name, image: car.image, color }));
        localStorage.setItem('userProfile', JSON.stringify({
          name: profile.username,
          carColor: color,
          carType: profile.car_type,
          objective: profile.objective ?? 'relax',
        }));
      }

      // Compteurs globaux : pour CHACUN, on garde la plus grande valeur des
      // deux côtés — jamais d'écrasement.
      //
      // Ils étaient départagés par l'XP, qui n'est attribuée nulle part
      // (updateXP n'est jamais appelé) et vaut donc 0 des deux côtés. La
      // condition était toujours fausse : rien ne redescendait, et le local
      // était ensuite renvoyé au compte. Un nouvel appareil écrasait donc les
      // compteurs du compte — une élève est passée de 133 à 28 réponses en
      // se connectant sur un autre téléphone.
      const lireJson = <T,>(cle: string): T | null => {
        try { return JSON.parse(localStorage.getItem(cle) || 'null') as T | null; } catch { return null; }
      };
      const localXP = getXPData();
      const remoteXP = profile.xp_data?.totalXP ?? 0;
      if (remoteXP > localXP.totalXP) {
        localStorage.setItem('xpData', JSON.stringify(profile.xp_data));
      }
      const qhLocal = lireJson<{ totalAnswers?: number }>('quizHistory');
      if (profile.quiz_history && (profile.quiz_history.totalAnswers ?? 0) > (qhLocal?.totalAnswers ?? 0)) {
        localStorage.setItem('quizHistory', JSON.stringify(profile.quiz_history));
      }
      if (profile.streak_data) {
        type Serie = { currentStreak?: number; bestStreak?: number; lastActiveDate?: string };
        const distant = profile.streak_data as Serie;
        const local = lireJson<Serie>('streakData');
        // la série en cours vient du côté le plus récent ; le record, du plus haut
        const plusRecent = (distant.lastActiveDate || '') > (local?.lastActiveDate || '');
        const fusion: Serie = { ...(plusRecent || !local ? distant : local) };
        fusion.bestStreak = Math.max(distant.bestStreak ?? 0, local?.bestStreak ?? 0);
        localStorage.setItem('streakData', JSON.stringify(fusion));
      }
      if ((profile.survival_best ?? 0) > Number(localStorage.getItem('survie_best_score') || 0)) {
        localStorage.setItem('survie_best_score', String(profile.survival_best));
      }

      // Progression fine : FUSION systématique, quelle que soit l'XP. Chaque
      // élément acquis d'un côté ou de l'autre est conservé, jamais écrasé :
      // étoiles au meilleur score, examens réussis, parties terminées,
      // panneaux maîtrisés.
      applyStarsFromRemote(profile.stars);
      applyExamsFromRemote(profile.exams);
      applyCompletedPartiesFromRemote(profile.lesson_parties_done);
      applyPanneauxMasteredFromRemote(profile.panneaux_mastered);

      // Le local porte maintenant l'union des deux côtés : on la renvoie au
      // compte, pour que le prochain appareil la retrouve entière. C'est ce
      // qui fait du compte — et non de l'appareil — la source de vérité.
      syncAllToSupabase(sbUser.id).catch(console.error);

      // Progression AM : fusion distant ↔ local (le meilleur des deux gagne),
      // puis renvoi vers la colonne isolée progress_am si le local a des données.
      // Indépendant de la synchro B : un échec de l'un ne touche pas l'autre.
      applyAmProgressFromRemote(profile.progress_am);
      const amSnap = getAmProgressSnapshot();
      const hasAmProgress =
        Object.keys(amSnap.stars).length > 0 ||
        Object.keys(amSnap.exams).length > 0 ||
        Object.keys(amSnap.lessonPartiesDone).length > 0 ||
        amSnap.quizHistory.totalAnswers > 0 ||
        amSnap.survivalBest > 0;
      if (hasAmProgress) syncAmToSupabase(sbUser.id).catch(console.error);

      // Permis choisi : restauré depuis le profil (nouvel appareil) — évite
      // de représenter l'écran de choix à un utilisateur qui a déjà choisi
      if (profile.license_type && !localStorage.getItem('license_type')) {
        localStorage.setItem('license_type', profile.license_type);
      }

      // Compte créé il y a moins de 48h et didacticiel jamais vu → on l'arme.
      // Couvre le parcours "inscription avec confirmation email" (l'utilisateur
      // revient par /login et n'est jamais passé par le flux d'inscription).
      const createdAt = profile.created_at ? new Date(profile.created_at).getTime() : 0;
      const isRecent = createdAt > 0 && Date.now() - createdAt < 48 * 60 * 60 * 1000;
      if (isRecent && localStorage.getItem('@tuto_done') !== 'true' && localStorage.getItem('@tuto_pending') !== 'true') {
        localStorage.setItem('@tuto_pending', 'true');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasSupabase || !supabase) {
      // No Supabase — skip auth, everything works with localStorage
      setLoading(false);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        loadProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setSupabaseUser(u);
      if (u) {
        loadProfile(u);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabase) return { error: lang === 'nl' ? 'Authenticatie niet geconfigureerd' : 'Authentification non configurée' };
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: username } },
      });
      if (error) return { error: translateError(error.message, lang) };

      if (data.user) {
        await createUserProfile({ uid: data.user.id, name: username, email });
      }

      if (data.user && !data.session) {
        return { needsConfirmation: true };
      }

      return {};
    } catch (e: any) {
      console.error('[PermiGo] signUp error:', e);
      return { error: lang === 'nl' ? 'Kan de server niet bereiken. Controleer je internetverbinding.' : 'Impossible de contacter le serveur. Vérifie ta connexion internet.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: lang === 'nl' ? 'Authenticatie niet geconfigureerd' : 'Authentification non configurée' };
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: translateError(error.message, lang) };
      return {};
    } catch (e: any) {
      console.error('[PermiGo] signIn error:', e);
      return { error: lang === 'nl' ? 'Kan de server niet bereiken. Controleer je internetverbinding.' : 'Impossible de contacter le serveur. Vérifie ta connexion internet.' };
    }
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    // Clear all progress and premium data from localStorage on logout
    const PROGRESS_KEYS = [
      'isPremium', 'permigo_vip',
      'xpData', 'streakData',
      '@progress_stars', '@progress_exams', '@progress_themes',
      'quizHistory', 'survie_best_score',
      'streakAnimationShownDate', 'userCar', 'userProfile',
      'panneaux_mastered',
    ];
    PROGRESS_KEYS.forEach(k => localStorage.removeItem(k));
    Object.keys(localStorage)
      .filter(k =>
        k.startsWith('lessonPartiesDone_') ||
        k.startsWith('partie_completed_') ||
        k.startsWith('lesson_completed_') ||
        k.startsWith('badge_seen_') ||
        k.startsWith('lesson_quiz_done_') ||
        // Progression des autres permis (clés préfixées, ex. "AM::…")
        k.startsWith('AM::')
      )
      .forEach(k => localStorage.removeItem(k));
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: lang === 'nl' ? 'Authenticatie niet geconfigureerd' : 'Authentification non configurée' };
    try {
      // Sans redirectTo, Supabase renvoie vers l'URL du site configurée dans
      // le tableau de bord — qui ne traite pas la récupération. On envoie
      // explicitement vers la page qui permet de choisir un nouveau mot de
      // passe. `window.location.origin` marche aussi bien en local qu'en prod.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { error: translateError(error.message, lang) };
      return { success: true };
    } catch (e: any) {
      console.error('[PermiGo] resetPassword error:', e);
      return { error: lang === 'nl' ? 'Netwerkfout — probeer later opnieuw' : 'Erreur réseau — réessaie plus tard' };
    }
  };

  const refreshUser = async () => {
    if (supabaseUser) {
      await loadProfile(supabaseUser);
    }
  };

  return (
    <AuthContext.Provider value={{ supabaseUser, user, loading, signUp, signIn, signOut, resetPassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
