'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import fr from '@/locales/fr';
import nl from '@/locales/nl';

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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === 'nl') setLangState('nl');
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
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
