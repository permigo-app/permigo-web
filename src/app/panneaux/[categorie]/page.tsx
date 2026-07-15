'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PANNEAU_CATEGORIES } from '@/lib/constants';
import { getSignsByCategory } from '@/lib/signsData';
import SignImage from '@/components/SignImage';
import PanneauxFlashPanel, { loadAllMastered } from '@/components/PanneauxFlashPanel';
import { useLang } from '@/contexts/LanguageContext';
import { isPremium } from '@/lib/premium';
import PremiumGate from '@/components/PremiumGate';

// Mêmes catégories gratuites que sur le hub /panneaux — le verrou doit exister
// ici aussi, sinon l'URL directe /panneaux/B contourne le premium.
const FREE_PANNEAU_IDS = ['A', 'C', 'D'];

export default function PanneauCategoriePage() {
  const params = useParams();
  const router = useRouter();
  const { t, lang } = useLang();
  const catId = params.categorie as string;

  const category = PANNEAU_CATEGORIES.find(c => c.id === catId);
  const signs = getSignsByCategory(catId, lang);

  const [masteredMap, setMasteredMap] = useState<Record<string, boolean>>({});
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  useEffect(() => {
    setMasteredMap(loadAllMastered());
  }, []);

  const refreshMastered = useCallback(() => {
    setMasteredMap(loadAllMastered());
  }, []);

  if (category && !FREE_PANNEAU_IDS.includes(catId) && !isPremium()) {
    return <PremiumGate><></></PremiumGate>;
  }

  if (!category) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('panneaux_categorie_introuvable')}</p>
        <button onClick={() => router.push('/panneaux')} className="mt-4 px-6 py-3 rounded-2xl font-black press-scale" style={{ background: 'var(--brand)', color: '#0a0e2a' }}>
          {t('retour')}
        </button>
      </div>
    );
  }

  const masteredCount = signs.filter(s => masteredMap[s.code]).length;
  const total = signs.length;
  const pct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

  return (
    <div className="py-8 px-6" style={{ minHeight: '100vh' }}>
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <button onClick={() => router.push('/panneaux')} className="text-sm mb-4 block press-scale" style={{ color: 'var(--text-secondary)' }}>
          {t('panneaux_retour_categories')}
        </button>

        <div className="flex items-center gap-4 mb-6 lg:mb-2">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: category.color + '15', border: `1px solid ${category.color}30` }}
          >
            {signs[0] ? (
              <SignImage code={signs[0].code} size={40} />
            ) : (
              <span className="text-2xl">{category.emoji}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black">{t(`panneau_cat_${category.id}`)}</h1>
            {/* Progression flashcards — desktop uniquement */}
            <p className="text-sm mt-0.5 hidden lg:block" style={{ color: 'var(--brand)' }}>
              {masteredCount}/{total} {t('panneaux_maitrises')}
            </p>
            <p className="text-sm mt-0.5 lg:hidden" style={{ color: 'var(--text-secondary)' }}>
              {total} {t('panneaux_count')}
            </p>
          </div>
        </div>

        {/* Progress bar — desktop uniquement */}
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct === 0 ? 0 : Math.max(pct, 2)}%`, background: 'var(--brand)' }}
            />
          </div>
          <span className="text-xs font-bold" style={{ color: pct === 100 ? 'var(--success)' : 'var(--brand)' }}>
            {pct}%
          </span>
        </div>

        <div className="flex gap-6">
          {/* Main: sign grid */}
          <div className="flex-1 min-w-0">
            {signs.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">🚧</span>
                <p className="font-bold" style={{ color: 'var(--text-secondary)' }}>{t('panneaux_bientot')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {signs.map((sign) => {
                  const isMastered = !!masteredMap[sign.code];
                  const isSelected = selectedSign === sign.code;
                  return (
                    <div
                      key={sign.code}
                      className="rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-200 group relative"
                      style={{
                        background: isSelected ? `${category.color}18` : 'var(--card-primary)',
                        border: isSelected ? `2px solid ${category.color}60` : '2px solid var(--border-subtle)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.boxShadow = `0 4px 20px ${category.color}25`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onClick={() => {
                        // Alimente la flashcard de la sidebar — desktop uniquement,
                        // sur mobile le tap n'a volontairement aucun effet
                        setSelectedSign(sign.code);
                      }}
                    >
                      {/* Mastered badge — desktop uniquement */}
                      {isMastered && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full hidden lg:flex items-center justify-center text-xs" style={{ background: 'var(--success)', color: '#ffffff' }}>
                          ✓
                        </div>
                      )}

                      <div className="mb-3 mt-1">
                        <SignImage code={sign.code} size={120} />
                      </div>
                      <p className="text-sm font-black mb-1" style={{ color: 'var(--text-primary)' }}>{sign.code}</p>
                      <p className="text-[11px] leading-snug line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {sign.name.split('(')[0].trim()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right sidebar: flashcard — desktop */}
          <div className="w-64 xl:w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-6">
              <div className="rounded-2xl p-5" style={{ background: 'var(--card-primary)', border: `1px solid ${category.color}30` }}>
                <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span>🃏</span> Flashcard — {t(`panneau_cat_${category.id}`)}
                </h3>
                <PanneauxFlashPanel
                  key={`${catId}-${selectedSign || 'default'}`}
                  catId={catId}
                  color={category.color}
                  initialSignCode={selectedSign}
                  onMasteredChange={refreshMastered}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
