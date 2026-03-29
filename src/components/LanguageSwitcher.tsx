'use client';

import { useLang } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex rounded-full overflow-hidden" style={{ border: '1px solid #2A3550' }}>
      <button
        onClick={() => setLang('fr')}
        className="px-3 py-1 text-sm font-bold transition-all duration-150"
        style={{
          background: lang === 'fr' ? '#4ecdc4' : 'transparent',
          color: lang === 'fr' ? '#0a0e2a' : '#5A6B8A',
        }}
      >
        FR
      </button>
      <button
        onClick={() => setLang('nl')}
        className="px-3 py-1 text-sm font-bold transition-all duration-150"
        style={{
          background: lang === 'nl' ? '#4ecdc4' : 'transparent',
          color: lang === 'nl' ? '#0a0e2a' : '#5A6B8A',
        }}
      >
        NL
      </button>
    </div>
  );
}
