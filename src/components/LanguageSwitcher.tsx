'use client';

import { useLang } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex rounded-full overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border-subtle)' }}>
      <button
        onClick={() => setLang('fr')}
        className="px-3 py-1 text-sm font-bold transition-all duration-150"
        style={{
          background: lang === 'fr' ? 'var(--brand)' : 'transparent',
          color: lang === 'fr' ? 'var(--bg-primary)' : 'var(--text-disabled)',
        }}
      >
        FR
      </button>
      <button
        onClick={() => setLang('nl')}
        className="px-3 py-1 text-sm font-bold transition-all duration-150"
        style={{
          background: lang === 'nl' ? 'var(--brand)' : 'transparent',
          color: lang === 'nl' ? 'var(--bg-primary)' : 'var(--text-disabled)',
        }}
      >
        NL
      </button>
    </div>
  );
}
