'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getUserProfile, createUserProfile, mapProfileToUser, type AppUser } from '@/lib/supabaseUser';

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

function translateError(msg: string): string {
  if (msg.includes('already registered')) return 'Cette adresse email est déjà utilisée';
  if (msg.includes('Invalid login')) return 'Email ou mot de passe incorrect';
  if (msg.includes('invalid email')) return 'Adresse email invalide';
  if (msg.includes('least 6')) return 'Le mot de passe doit faire au moins 6 caractères';
  if (msg.includes('Email not confirmed')) return 'Confirme ton email avant de te connecter (vérifie tes spams)';
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Trop de tentatives, réessaie dans quelques minutes';
  if (msg.includes('network') || msg.includes('fetch')) return 'Erreur réseau, vérifie ta connexion';
  return msg;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: username } },
      });
      if (error) return { error: translateError(error.message) };

      if (data.user) {
        await createUserProfile({ uid: data.user.id, name: username, email });
      }

      // Check if email confirmation is needed
      if (data.user && !data.session) {
        return { needsConfirmation: true };
      }

      return {};
    } catch (e: any) {
      console.error('[PermiGo] signUp error:', e);
      return { error: 'Impossible de contacter le serveur. Vérifie ta connexion internet.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: translateError(error.message) };
      return {};
    } catch (e: any) {
      console.error('[PermiGo] signIn error:', e);
      return { error: 'Impossible de contacter le serveur. Vérifie ta connexion internet.' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: translateError(error.message) };
    return { success: true };
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
