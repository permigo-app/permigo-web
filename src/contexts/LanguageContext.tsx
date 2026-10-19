'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import fr from '@/locales/fr';
import nl from '@/locales/nl';
import { supabase } from '@/lib/supabase';
import { installVoiceUnlock } from '@/lib/voice';

type Lang = 'fr' | 'nl';

const DICTIONARIES: Record<Lang, Record<string, string>> = { fr, nl };
const STORAGE_KEY = 'permigo_lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'fr',
  setLang: () => {},
  t: (key) => key,
});

const isLang = (v: unknown): v is Lang => v === 'fr' || v === 'nl';

/**
 * Langue de départ, par ordre de priorité :
 * 1. ?lang=nl / ?lang=fr dans l'URL (lien en bio TikTok, par exemple)
 * 2. le choix déjà enregistré sur cet appareil
 * 3. la langue du téléphone / navigateur (nl-BE, nl-NL… → nl ; fr-* → fr)
 * 4. le français par défaut
 */
function detectInitialLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (isLang(fromUrl)) return fromUrl;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // localStorage indisponible (navigation privée…) : on passe à la langue du navigateur
  }
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const p of prefs) {
    const code = (p || '').toLowerCase().slice(0, 2);
    if (isLang(code)) return code;
  }
  return 'fr';
}

/** Enregistre la langue dans le profil si l'utilisateur est connecté (pour les statistiques). */
async function saveLangToProfile(l: Lang) {
  if (!supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { error } = await supabase.from('profiles').update({ preferred_language: l }).eq('id', session.user.id);
    if (error) console.error('[PermiGo] saveLangToProfile failed:', error.message);
  } catch (e) {
    console.error('[PermiGo] saveLangToProfile failed:', e);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    // Débloque la lecture vocale des questions dès le premier toucher sur le site
    installVoiceUnlock();
    const initial = detectInitialLang();
    setLangState(initial);
    try {
      localStorage.setItem(STORAGE_KEY, initial);
    } catch {
      // ignoré : la langue reste active pour cette visite
    }
  }, []);

  // Garde le profil à jour : au changement de langue et à chaque connexion
  useEffect(() => {
    saveLangToProfile(lang);
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') saveLangToProfile(lang);
    });
    return () => subscription.unsubscribe();
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignoré
    }
  }, []);

  const t = useCallback((key: string): string => {
    return DICTIONARIES[lang][key] ?? DICTIONARIES.fr[key] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
