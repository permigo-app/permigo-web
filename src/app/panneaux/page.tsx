'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PANNEAU_CATEGORIES } from '@/lib/constants';
import { getSignsByCategory } from '@/lib/signsData';
import SignImage from '@/components/SignImage';
import PanneauxFlashPanel, { loadAllMastered } from '@/components/PanneauxFlashPanel';
import { useLang } from '@/contexts/LanguageContext';
import { useIsPremium } from '@/lib/premium';
import rawQuizData from '@/data/panneaux_quiz.json';

// PANNEAU_CATEGORIES id → quiz category id
const PANNEAU_TO_QUIZ: Record<string, string> = {
  A: 'A', B: 'BC', C: 'BC', D: 'D', E: 'E', F: 'F', FEU: 'FEU', LIGNE: 'SOL',
};

// Derive quiz button data from panneaux_quiz.json — button only shown when count ≥ 1
const quizCounts: Record<string, number> = {};
for (const cat of (rawQuizData as { categories: { id: string; questions: unknown[] }[] }).categories) {
  quizCounts[cat.id] = cat.questions.length;
}
const QUIZ_MAP: Record<string, { cat: string; count: number }> = {};
for (const [pannId, quizCat] of Object.entries(PANNEAU_TO_QUIZ)) {
  const count = quizCounts[quizCat] ?? 0;
  if (count > 0) QUIZ_MAP[pannId] = { cat: quizCat, count };
}

const FREE_PANNEAU_IDS = ['A', 'C', 'D'];

export default function PanneauxPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [masteredMap, setMasteredMap] = useState<Record<string, boolean>>({});
  const [mobileFlash, setMobileFlash] = useState(false);
  const userIsPremium = useIsPremium();

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
          <h1 className="text-[32px] font-black" style={{ color: 'var(--text-primary)' }}>{t('panneaux_titre')}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {t('panneaux_subtitle')}
          </p>
        </div>

        <div className="flex gap-6">
          {/* Main: category grid */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PANNEAU_CATEGORIES.map(cat => {
                const isFree = FREE_PANNEAU_IDS.includes(cat.id);
                const locked = !userIsPremium && !isFree;
                const signs = getSignsByCategory(cat.id, lang);
                const masteredCount = signs.filter(s => masteredMap[s.code]).length;
                const total = signs.length;
                const pct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
                const isSelected = selectedCat === cat.id;
                const firstSign = signs[0];

                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl p-5 cursor-pointer transition-all duration-200 group relative"
                    style={{
                      background: locked ? 'var(--card-secondary)' : isSelected ? `${cat.color}18` : 'var(--card-primary)',
                      border: locked ? '2px solid var(--border-subtle)' : isSelected ? `2px solid ${cat.color}60` : '2px solid var(--border-subtle)',
                      opacity: locked ? 0.75 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!isSelected && !locked) {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.boxShadow = `0 6px 24px ${cat.color}20`;
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => {
                      if (locked) { router.push('/premium'); return; }
                      setSelectedCat(isSelected ? null : cat.id);
                      setMobileFlash(true);
                    }}
                  >
                    {locked && (
                      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 20, padding: '3px 10px' }}>
                        <span style={{ fontSize: 11 }}>🔒</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#FFD700' }}>Premium</span>
                      </div>
                    )}
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
                        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                          {total} {t('panneaux_count')}
                        </p>

                        {/* Progress bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.max(pct, 2)}%`, background: 'var(--brand)' }}
                            />
                          </div>
                          <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: masteredCount === total && total > 0 ? 'var(--success)' : 'var(--brand)' }}>
                            {masteredCount}/{total}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: see all + quiz */}
                    <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      {locked ? (
                        <button
                          className="text-xs font-bold rounded-lg press-scale"
                          style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', padding: '10px 20px' }}
                          onClick={e => { e.stopPropagation(); router.push('/premium'); }}
                        >
                          🔒 Débloquer
                        </button>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/panneaux/${cat.id}`}
                            className="text-xs font-bold rounded-lg press-scale transition-all duration-200"
                            style={{ background: 'transparent', color: 'var(--brand)', border: '1px solid var(--brand)', padding: '10px 20px' }}
                            onClick={e => e.stopPropagation()}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.color = '#0a0e2a'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand)'; }}
                          >
                            {t('panneaux_voir_tous')}
                          </Link>

                          {QUIZ_MAP[cat.id] && (
                            <Link
                              href={`/panneaux/quiz?cat=${QUIZ_MAP[cat.id].cat}`}
                              className="text-xs rounded-xl press-scale"
                              style={{
                                background: '#f59e0b',
                                color: '#0b2659',
                                fontWeight: 800,
                                padding: '10px 20px',
                                borderRadius: 12,
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              Quiz situations ({QUIZ_MAP[cat.id].count}q)
                            </Link>
                          )}

                          {pct === 100 && total > 0 && (
                            <span className="text-xs font-bold ml-auto" style={{ color: 'var(--success)' }}>{t('panneaux_complet')}</span>
                          )}
                        </div>
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
                <div className="rounded-2xl p-5" style={{ background: 'var(--card-primary)', border: `1px solid ${selectedMeta.color}30` }}>
                  <h3 className="text-sm font-extrabold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
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
                <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-5xl block mb-4">🃏</span>
                  <p className="font-black text-base mb-2" style={{ color: 'var(--text-primary)' }}>{t('panneaux_flashcards')}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
              style={{ background: 'var(--card-primary)', borderTop: `3px solid ${selectedMeta.color}` }}
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full" style={{ background: 'var(--text-disabled)' }} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span>🃏</span> Flashcards — {selectedMeta.name}
                </h3>
                <button
                  onClick={() => setMobileFlash(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center press-scale"
                  style={{ background: 'var(--card-secondary)' }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>✕</span>
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
