'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getQuestionById, shuffleChoices, type LocalQuestion } from '@/lib/lessonData';
import { useLang } from '@/contexts/LanguageContext';
import { THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import { fetchMistakes } from '@/lib/reviewApi';
import { getActiveLicense } from '@/lib/license';
import QuizLayout from '@/components/QuizLayout';
import { isPremium, isThemeFree } from '@/lib/premium';
import PremiumGate from '@/components/PremiumGate';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function buildMistakeQuestions(themeCode: string, lang: 'fr' | 'nl'): Promise<LocalQuestion[]> {
  // La banque d'erreurs est commune au compte : les ids AM sont préfixés "AM_"
  // (donc "AM_B2_Q1" ne doit pas matcher le thème A du permis B, ni l'inverse).
  const isAM = getActiveLicense() === 'AM';
  const mistakeIds = (await fetchMistakes()).filter(id =>
    isAM ? id.startsWith(`AM_${themeCode}`) : (!id.startsWith('AM_') && id.startsWith(themeCode))
  );
  const resolved: LocalQuestion[] = [];
  for (const id of mistakeIds) {
    const q = await getQuestionById(id, lang);
    if (q) resolved.push(q);
  }
  return shuffle(resolved).map(q => {
    const s = shuffleChoices(q);
    return { ...q, choices: s.choices as [string, string, string, string], correct: s.correct };
  });
}

function RevisionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { t, lang } = useLang();
  const themeCode = params.get('theme') || 'A';
  const themeColor = THEME_COLORS[themeCode] || '#74B9FF';
  const themeEmoji = THEME_EMOJIS[themeCode] || '🔄';

  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    buildMistakeQuestions(themeCode, lang).then(qs => {
      setQuestions(qs);
      setLoading(false);
    });
  }, [themeCode, lang]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);

  const validateSelected = useCallback(() => {
    if (selected === null || validated) return;
    setValidated(true);
    if (selected === questions[index].correct) {
      setCorrectCount(c => c + 1);
    } else {
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 400);
    }
  }, [selected, validated, questions, index]);

  const goNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex(i => i + 1);
    setSelected(null);
    setValidated(false);
    setShakeWrong(false);
  }, [index, questions.length]);

  const restart = useCallback(async () => {
    setQuestions(await buildMistakeQuestions(themeCode, lang));
    setIndex(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setDone(false);
    setShakeWrong(false);
  }, [themeCode, lang]);

  // Banque d'erreurs par thème : même règle que les leçons (A gratuit, B-I premium)
  if (!isThemeFree(themeCode) && !isPremium()) {
    return <PremiumGate><></></PremiumGate>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: themeColor, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-[56px]">✅</span>
        <p style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-title)' }}>{t('erreurs_aucune_titre')}</p>
        <p style={{ color: 'var(--text-sub)', maxWidth: 320 }}>{t('erreurs_aucune_sub')}</p>
        <button onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold press-scale" style={{ background: 'var(--bg-card)' }}>
          {t('flash_retour')}
        </button>
      </div>
    );
  }

  const progress = ((index + 1) / questions.length) * 100;

  // Done screen
  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚';
    const msg = pct >= 80
      ? t('revision_excellent')
      : pct >= 60
      ? t('revision_bien')
      : t('revision_continue');

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 gap-4">
        <span className="text-[72px]">{emoji}</span>
        <h1 className="text-[48px] font-black">{pct}%</h1>
        <p className="text-center" style={{ color: 'var(--text-sub)' }}>{msg}</p>

        <div className="w-full max-w-md flex items-center justify-around rounded-2xl p-5 my-2" style={{ background: 'var(--bg-card)' }}>
          <div className="text-center">
            <p className="text-[28px] font-black" style={{ color: '#2ecc71' }}>{correctCount}</p>
            <p className="text-xs" style={{ color: 'var(--text-sub)' }}>{t('revision_correctes')}</p>
          </div>
          <div className="w-[1px] h-10" style={{ background: 'var(--bg-input)' }} />
          <div className="text-center">
            <p className="text-[28px] font-black" style={{ color: '#e74c3c' }}>{questions.length - correctCount}</p>
            <p className="text-xs" style={{ color: 'var(--text-sub)' }}>{t('revision_incorrectes')}</p>
          </div>
          <div className="w-[1px] h-10" style={{ background: 'var(--bg-input)' }} />
          <div className="text-center">
            <p className="text-[28px] font-black">{questions.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-sub)' }}>{t('revision_total')}</p>
          </div>
        </div>

        <button onClick={() => router.back()} className="w-full max-w-md h-[54px] rounded-2xl font-bold text-white press-scale" style={{ background: themeColor }}>
          {t('revision_retour_carte')}
        </button>
        <button onClick={restart} className="w-full max-w-md h-[54px] rounded-2xl font-bold press-scale" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: themeColor }}>
          {t('revision_recommencer')}
        </button>
      </div>
    );
  }

  // Question screen
  const q = questions[index];

  return (
    <QuizLayout
      progress={progress}
      progressLabel={`${index + 1}/${questions.length}`}
      headerLeft={
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center press-scale" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-sub)' }}>
          {'←'}
        </button>
      }
      headerCenter={
        <span className="text-sm font-bold">{themeEmoji} {t('erreurs_titre')} {themeCode}</span>
      }
      subtitle={`${t('erreurs_titre')} ${themeCode}`}
      question={q.question}
      signCode={q.sign}
      imageUrl={q.image}
      choices={[...q.choices]}
      selected={selected}
      validated={validated}
      correctIndex={q.correct}
      onSelect={(i) => { if (!validated) setSelected(i); }}
      onValidate={validateSelected}
      onNext={goNext}
      isLastQuestion={index + 1 === questions.length}
      lastLabel="Voir les résultats →"
      explanation={q.explanation}
      shakeWrong={shakeWrong}
      sidebar={
        <>
          {/* Question info */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>{t('revision_progression')}</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-sub)' }}>{t('revision_question')}</span>
              <span className="text-sm font-bold">{index + 1} / {questions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-sub)' }}>{t('revision_correctes')}</span>
              <span className="text-sm font-bold" style={{ color: '#2ecc71' }}>{correctCount}</span>
            </div>
            <div className="mt-3">
              <span className="text-xs px-2 py-1 rounded-md font-bold" style={{ background: themeColor + '20', color: themeColor }}>
                {themeEmoji} Thème {themeCode}
              </span>
            </div>
          </div>

        </>
      }
    />
  );
}

export default function RevisionPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-hint)', fontFamily: "'Sora',sans-serif", fontSize: 14 }}>
        Chargement...
      </div>
    }>
      <RevisionContent />
    </Suspense>
  );
}
