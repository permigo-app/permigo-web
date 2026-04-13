'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, hasSupabase } from '@/lib/supabase';
import { getUserProfile, createUserProfile, mapProfileToUser, type AppUser } from '@/lib/supabaseUser';
import { syncAllToSupabase, getXPData, getStreakData } from '@/lib/progressStorage';
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

  const FREE_ACCESS_EMAILS = ['ycroitor8096@gmail.com'];

  const CAR_MAP: Record<string, { id: string; name: string; image: string; color: string }> = {
    red:   { id: 'red',   name: 'Rouge', image: '/images/cars/car-red.png',   color: '#e74c3c' },
    blue:  { id: 'blue',  name: 'Bleue', image: '/images/cars/car-blue.png',  color: '#3498db' },
    green: { id: 'green', name: 'Verte', image: '/images/cars/car-green.png', color: '#2ecc71' },
  };

  const loadProfile = useCallback(async (sbUser: SupabaseUser) => {
    const profile = await getUserProfile(sbUser.id);
    if (profile) {
      setUser(mapProfileToUser(profile));
      if (FREE_ACCESS_EMAILS.includes(sbUser.email ?? '')) {
        localStorage.setItem('isPremium', 'true');
        localStorage.setItem('permigo_vip', 'true');
      }

      // ── Sync Supabase → localStorage ──────────────────────────
      if (typeof window === 'undefined') return;

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

      // Progress: take whichever has more XP, sync loser to winner
      const localXP = getXPData();
      const remoteXP = profile.xp_data?.totalXP ?? 0;
      if (remoteXP > localXP.totalXP) {
        // Supabase wins → overwrite localStorage
        localStorage.setItem('xpData', JSON.stringify(profile.xp_data));
        if (profile.streak_data) localStorage.setItem('streakData', JSON.stringify(profile.streak_data));
        if (profile.stars && Object.keys(profile.stars).length > 0) localStorage.setItem('@progress_stars', JSON.stringify(profile.stars));
        if (profile.quiz_history) localStorage.setItem('quizHistory', JSON.stringify(profile.quiz_history));
        if (profile.survival_best > 0) localStorage.setItem('survie_best_score', String(profile.survival_best));
      } else if (localXP.totalXP > remoteXP) {
        // localStorage wins → auto-migrate to Supabase
        syncAllToSupabase(sbUser.id).catch(console.error);
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
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: lang === 'nl' ? 'Authenticatie niet geconfigureerd' : 'Authentification non configurée' };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
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
