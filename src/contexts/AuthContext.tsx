'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, hasSupabase } from '@/lib/supabase';
import { getUserProfile, createUserProfile, mapProfileToUser, type AppUser } from '@/lib/supabaseUser';
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

  const loadProfile = useCallback(async (sbUser: SupabaseUser) => {
    const profile = await getUserProfile(sbUser.id);
    if (profile) {
      setUser(mapProfileToUser(profile));
    }
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
