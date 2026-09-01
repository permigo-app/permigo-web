'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SignImage from '@/components/SignImage';
import { PANNEAU_CATEGORIES } from '@/lib/constants';
import { buildSignQuiz, LEGACY_QUIZ_CAT, type SignQuizQuestion } from '@/lib/panneauxQuiz';
import { isPremium } from '@/lib/premium';
import PremiumGate from '@/components/PremiumGate';
import { useLang } from '@/contexts/LanguageContext';

// Mêmes catégories gratuites que le hub et les listes de panneaux — sans ce
// verrou, l'URL directe /panneaux/quiz?cat=E contournerait Premium.
const FREE_PANNEAU_IDS = ['A', 'C', 'D'];

function QuizContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { t, lang } = useLang();

  // Le quiz utilise désormais les identifiants du catalogue (A, B, C…) ;
  // les anciens liens (?cat=BC, ?cat=SOL) sont convertis au lieu de casser.
  const rawCat = params.get('cat') ?? 'A';
  const catId = LEGACY_QUIZ_CAT[rawCat] ?? rawCat;
  const category = PANNEAU_CATEGORIES.find(c => c.id === catId);
  const catColor = category?.color ?? '#f59e0b';

  const [questions, setQuestions] = useState<SignQuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // Une question par panneau de la catégorie, régénérée si la langue change
  useEffect(() => {
    setQuestions(buildSignQuiz(catId, lang));
    setCurrent(0);
    setSelected(null);
    setValidated(false);
    setScore(0);
    setDone(false);
  }, [catId, lang]);

  // Remonte en haut à chaque nouvelle question : le bouton de fin de question
  // est tout en bas, on cliquerait sinon la suivante déjà scrollé.
  // `instant` obligatoire (globals.css impose scroll-behavior:smooth).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [current]);

  const q = questions[current];
  const total = questions.length;

  const handleValidate = useCallback(() => {
    if (selected === null || validated) return;
    setValidated(true);
    if (selected === q.correct) setScore(s => s + 1);
  }, [selected, validated, q]);

  const handleNext = useCallback(() => {
    if (current + 1 >= total) {
      setDone(true);
      return;
    }
    setCurrent(c => c + 1);
    setSelected(null);
    setValidated(false);
  }, [current, total]);

  const handleRestart = useCallback(() => {
    setQuestions(buildSignQuiz(catId, lang));
    setCurrent(0);
    setSelected(null);
    setValidated(false);
    setScore(0);
    setDone(false);
  }, [catId, lang]);

  if (category && !FREE_PANNEAU_IDS.includes(catId) && !isPremium()) {
    return <PremiumGate><></></PremiumGate>;
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <p className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{t('panneaux_categorie_introuvable')}</p>
          <Link href="/panneaux" className="text-sm font-bold" style={{ color: 'var(--brand)' }}>{t('pquiz_retour')}</Link>
        </div>
      </div>
    );
  }

  const catTitle = t(`panneau_cat_${catId}`);

  // ── Écran de score ────────────────────────────────────────────
  if (done) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = pct >= 70;
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-md mx-auto w-full px-4 py-12 flex flex-col items-center text-center gap-6">
          <span style={{ fontSize: 72 }}>{passed ? '🏆' : '💪'}</span>
          <h1 className="text-3xl font-black" style={{ color: passed ? '#22c55e' : '#f59e0b' }}>
            {passed ? t('resultats_bravo') : t('pquiz_continue')}
          </h1>

          <div
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center"
            style={{ border: `5px solid ${passed ? '#22c55e' : '#f59e0b'}`, background: (passed ? '#22c55e' : '#f59e0b') + '15' }}
          >
            <span className="text-4xl font-black">{pct}%</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{score}/{total}</span>
          </div>

          <div className="rounded-2xl px-6 py-3" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              {t('pquiz_categorie')} <span className="font-black" style={{ color: catColor }}>{catTitle}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleRestart}
              className="w-full py-4 rounded-2xl font-black text-sm press-scale"
              style={{ background: catColor, color: '#fff' }}
            >
              {t('pquiz_recommencer')}
            </button>
            <Link
              href="/panneaux"
              className="w-full py-4 rounded-2xl font-black text-sm text-center press-scale block"
              style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              {t('pquiz_retour')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const isCorrect = validated && selected === q.correct;

  // ── Écran de question ─────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={() => router.push('/panneaux')}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 press-scale"
          style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}
        >
          <span style={{ color: 'var(--text-secondary)', fontSize: 16 }}>←</span>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate" style={{ color: catColor }}>{catTitle}</p>
          <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((current + (validated ? 1 : 0)) / total) * 100}%`, background: catColor }}
            />
          </div>
        </div>

        <span className="text-xs font-black flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {current + 1}/{total}
        </span>
      </div>

      {/* Corps */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-5">
        {/* Le panneau */}
        <div
          className="rounded-3xl flex items-center justify-center py-8"
          style={{ background: catColor + '10', border: `1.5px solid ${catColor}30`, minHeight: 180 }}
        >
          <SignImage code={q.code} size={140} />
        </div>

        {/* Question */}
        <p className="text-[18px] font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {t('pquiz_que_signifie')}
        </p>

        {/* Réponses */}
        <div className="flex flex-col gap-2.5">
          {q.choices.map((choice, i) => {
            let bg = 'var(--card-primary)';
            let border = '2px solid var(--border-subtle)';
            let textColor = 'var(--text-primary)';
            let icon = '';

            if (validated) {
              if (i === q.correct) {
                bg = '#22c55e18'; border = '2px solid #22c55e'; textColor = '#16a34a'; icon = '✓';
              } else if (i === selected) {
                bg = '#ef444418'; border = '2px solid #ef4444'; textColor = '#dc2626'; icon = '✗';
              }
            } else if (i === selected) {
              bg = catColor + '15'; border = `2px solid ${catColor}`;
            }

            return (
              <button
                key={i}
                onClick={() => { if (!validated) setSelected(i); }}
                disabled={validated}
                className="w-full text-left px-4 py-3.5 rounded-2xl font-semibold text-sm press-scale transition-colors duration-200 flex items-center justify-between gap-3"
                style={{ background: bg, border, color: textColor, cursor: validated ? 'default' : 'pointer' }}
              >
                <span>{choice}</span>
                {icon && <span className="font-black text-base flex-shrink-0">{icon}</span>}
              </button>
            );
          })}
        </div>

        {/* Après validation : la réponse porte déjà le libellé complet du
            panneau, on ajoute donc son code officiel plutôt que de répéter. */}
        {validated && (
          <div
            className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
            style={{
              background: isCorrect ? '#22c55e10' : '#f59e0b10',
              border: `1px solid ${isCorrect ? '#22c55e40' : '#f59e0b40'}`,
              color: 'var(--text-secondary)',
            }}
          >
            <span className="font-bold" style={{ color: isCorrect ? '#16a34a' : '#d97706' }}>
              {isCorrect ? `✓ ${t('pquiz_bonne_reponse')} · ` : 'ⓘ  '}
            </span>
            {t('pquiz_panneau')} <span className="font-black">{q.code}</span>
          </div>
        )}

        {/* Valider, puis Suivante — on ne corrige plus au simple clic sur une
            réponse : l'utilisateur choisit, relit, puis confirme. */}
        {!validated ? (
          <button
            onClick={handleValidate}
            disabled={selected === null}
            className="w-full py-4 rounded-2xl font-black text-sm press-scale transition-opacity duration-200"
            style={{
              background: selected === null ? 'var(--card-secondary)' : catColor,
              color: selected === null ? 'var(--text-disabled)' : '#fff',
              cursor: selected === null ? 'default' : 'pointer',
              border: selected === null ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            {t('valider')}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl font-black text-sm press-scale"
            style={{ background: catColor, color: '#fff' }}
          >
            {current + 1 < total ? t('pquiz_suivante') : t('pquiz_voir_score')}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PanneauxQuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#f59e0b', borderTopColor: 'transparent' }} />
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
