'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PANNEAU_CATEGORIES } from '@/lib/constants';
import { getSignsByCategory } from '@/lib/signsData';
import SignImage from '@/components/SignImage';
import PanneauxFlashPanel, { loadAllMastered } from '@/components/PanneauxFlashPanel';
import { useLang } from '@/contexts/LanguageContext';

export default function PanneauxPage() {
  const { t, lang } = useLang();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [masteredMap, setMasteredMap] = useState<Record<string, boolean>>({});
  const [mobileFlash, setMobileFlash] = useState(false);

  useEffect(() => {
    setMasteredMap(loadAllMastered());
  }, []);

  const refreshMastered = useCallback(() => {
    setMasteredMap(loadAllMastered());
  }, []);

  const selectedMeta = PANNEAU_CATEGORIES.find(c => c.id === selectedCat);

  return (
    <div className="py-8 px-6" style={{ minHeight: '100vh' }}>
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-black">{t('panneaux_titre')}</h1>
          <p className="text-sm mt-1" style={{ color: '#8B9DC3' }}>
            {t('panneaux_subtitle')}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Main: category grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PANNEAU_CATEGORIES.map(cat => {
                const signs = getSignsByCategory(cat.id, lang);
                const masteredCount = signs.filter(s => masteredMap[s.code]).length;
                const total = signs.length;
                const pct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
                const isSelected = selectedCat === cat.id;
                const firstSign = signs[0];

                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl p-5 cursor-pointer transition-all duration-200 group"
                    style={{
                      background: isSelected ? `${cat.color}10` : '#16213E',
                      border: `2px solid ${isSelected ? cat.color + '60' : '#2A3550'}`,
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.boxShadow = `0 6px 24px ${cat.color}20`;
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => {
                      setSelectedCat(isSelected ? null : cat.id);
                      setMobileFlash(true);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Category icon */}
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ background: cat.color + '15', border: `1px solid ${cat.color}30` }}
                      >
                        {firstSign ? (
                          <SignImage code={firstSign.code} size={48} />
                        ) : (
                          <span className="text-2xl">{cat.emoji}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-base mb-1">{t(`panneau_cat_${cat.id}`)}</h3>
                        <p className="text-xs mb-3" style={{ color: '#8B9DC3' }}>
                          {total} {t('panneaux_count')}
                        </p>

                        {/* Progress bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(pct, 2)}%`, background: '#4ecdc4' }}
                            />
                          </div>
                          <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: masteredCount === total && total > 0 ? '#2ecc71' : '#4ecdc4' }}>
                            {masteredCount}/{total}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: see all link */}
                    <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid #2A355040' }}>
                      <Link
                        href={`/panneaux/${cat.id}`}
                        className="text-xs font-bold rounded-lg press-scale transition-all duration-200 cta-panneaux"
                        style={{ background: 'rgba(78,205,196,0.15)', color: '#4ecdc4', border: '1px solid #4ecdc4', padding: '10px 20px' }}
                        onClick={e => e.stopPropagation()}
                        onMouseEnter={e => { e.currentTarget.style.background = '#4ecdc4'; e.currentTarget.style.color = '#0a0e2a'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(78,205,196,0.15)'; e.currentTarget.style.color = '#4ecdc4'; }}
                      >
                        {t('panneaux_voir_tous')}
                      </Link>
                      {pct === 100 && total > 0 && (
                        <span className="text-xs font-bold" style={{ color: '#2ecc71' }}>{t('panneaux_complet')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar: flashcard — desktop */}
          <div className="w-64 xl:w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-6">
              {selectedCat && selectedMeta ? (
                <div className="rounded-2xl p-5" style={{ background: '#16213E', border: `1px solid ${selectedMeta.color}30` }}>
                  <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2">
                    <span>🃏</span> Flashcards — {selectedMeta.name}
                  </h3>
                  <PanneauxFlashPanel
                    key={selectedCat}
                    catId={selectedCat}
                    color={selectedMeta.color}
                    onMasteredChange={refreshMastered}
                  />
                </div>
              ) : (
                <div className="rounded-2xl p-8 text-center" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
                  <span className="text-5xl block mb-4">🃏</span>
                  <p className="font-black text-base mb-2">{t('panneaux_flashcards')}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B9DC3' }}>
                    {t('panneaux_select_cat')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile bottom-sheet flashcard */}
        {selectedCat && selectedMeta && mobileFlash && (
          <div className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setMobileFlash(false)}>
            {/* Backdrop */}
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />
            {/* Sheet */}
            <div
              className="relative rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto"
              style={{ background: '#0F1923', borderTop: `3px solid ${selectedMeta.color}` }}
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full" style={{ background: '#2A3550' }} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <span>🃏</span> Flashcards — {selectedMeta.name}
                </h3>
                <button
                  onClick={() => setMobileFlash(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center press-scale"
                  style={{ background: '#16213E' }}
                >
                  <span style={{ color: '#8B9DC3' }}>✕</span>
                </button>
              </div>
              <PanneauxFlashPanel
                key={`mobile-${selectedCat}`}
                catId={selectedCat}
                color={selectedMeta.color}
                onMasteredChange={refreshMastered}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
