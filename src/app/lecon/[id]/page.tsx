'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getLessonDataLocalized, getThemeForLessonLocalized, type LocalTheoryCard, type LocalQuestion, type LocalPartie } from '@/lib/lessonData';
import { useLang } from '@/contexts/LanguageContext';
import { setStars, updateQuizHistory, updateXP, saveLessonQuizDone, saveLessonCardProgress, markPartieDone, markLessonCompleted, isPartieCompleted, checkAndUpdateStreak, addStudyTime } from '@/lib/progressStorage';
import { recordQuestionReview } from '@/lib/reviewApi';
import { getUnlockedBadges } from '@/lib/badges';
import { dispatchLevelUp, dispatchBadges } from '@/lib/rewardEvents';
import { THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import { GASTON_THEORY_TIPS, GASTON_CORRECT, GASTON_WRONG, getRandomMsg } from '@/locales/messages';
import { isPremium, isThemeFree } from '@/lib/premium';
import PremiumGate from '@/components/PremiumGate';
import SignImage from '@/components/SignImage';
import Gaston from '@/components/Gaston';
import QuizLayout from '@/components/QuizLayout';
import ImageRequestButton from '@/components/ImageRequestButton';

type Phase = 'theory' | 'quiz';

/** Get questions for a specific partie */
function getQuestionsForPartie(
  questions: LocalQuestion[],
  partieIndex: number,
  totalParties: number,
): LocalQuestion[] {
  if (totalParties <= 0 || questions.length === 0) return questions;
  const withIndex = questions.filter(q => q.theoryCardIndex !== undefined);
  if (withIndex.length > 0) {
    return questions.filter(q => q.theoryCardIndex === partieIndex);
  }
  const base = Math.floor(questions.length / totalParties);
  const extra = questions.length % totalParties;
  let start = 0;
  for (let i = 0; i < partieIndex; i++) start += base + (i < extra ? 1 : 0);
  const count = base + (partieIndex < extra ? 1 : 0);
  return questions.slice(start, start + count);
}

function shuffleQuestion(q: LocalQuestion) {
  const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  return {
    ...q,
    choices: order.map(i => q.choices[i]) as [string, string, string, string],
    correct: order.indexOf(q.correct),
  };
}


export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang, t } = useLang();
  const lessonId = (params.id as string)?.toUpperCase();
  const partieParam = searchParams.get('partie');
  const isRevisionMode = searchParams.get('revision') === '1';
  const isPartieMode = partieParam !== null;
  const partieIndex = isPartieMode ? parseInt(partieParam, 10) : undefined;
  // Block partie access if previous partie not completed (unless revision mode or partie 0)
  const isVipUser = typeof window !== 'undefined' && localStorage.getItem('permigo_vip') === 'true';
  const partieAccessBlocked = !isVipUser && isPartieMode && !isRevisionMode && partieIndex !== undefined && partieIndex > 0
    && !isPartieCompleted(lessonId, partieIndex - 1);

  const [phase, setPhase] = useState<Phase>('theory');
  const [lesson, setLesson] = useState(getLessonDataLocalized(lessonId, lang));
  const [themeCode, setThemeCode] = useState('A');

  // Theory
  const [currentCard, setCurrentCard] = useState(0);
  const [showSimple, setShowSimple] = useState(false);

  // Quiz
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [gastonMsg, setGastonMsg] = useState(() => t('reflechis'));
  const [gastonExpr, setGastonExpr] = useState<'happy' | 'encouraging' | 'unhappy' | 'impressed' | 'party' | 'thinking'>('thinking');
  const [shakeWrong, setShakeWrong] = useState(false);
  const [partieFailScore, setPartieFailScore] = useState<{ correct: number; total: number } | null>(null);
  const startTimeRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());

  useEffect(() => {
    const l = getLessonDataLocalized(lessonId, lang);
    setLesson(l);
    const t = getThemeForLessonLocalized(lessonId, lang);
    if (t) setThemeCode(t.theme);
  }, [lessonId, lang]);

  const theories: LocalPartie[] = lesson?.theory ?? [];
  const allQuestions: LocalQuestion[] = lesson?.questions ?? [];

  const displayTheories: LocalTheoryCard[] = isPartieMode && partieIndex !== undefined && partieIndex < theories.length
    ? (theories[partieIndex]?.cards ?? [])
    : theories.flatMap(p => p.cards);

  const displayQuestions: LocalQuestion[] = isPartieMode && partieIndex !== undefined
    ? getQuestionsForPartie(allQuestions, partieIndex, theories.length)
    : allQuestions;

  const currentPartieTitle = isPartieMode && partieIndex !== undefined && partieIndex < theories.length
    ? theories[partieIndex]?.title
    : null;

  const getCurrentPartieInfo = () => {
    if (isPartieMode) return null;
    let cardsSoFar = 0;
    for (let pi = 0; pi < theories.length; pi++) {
      const partieCards = theories[pi].cards.length;
      if (currentCard < cardsSoFar + partieCards) {
        return { partieIdx: pi, cardInPartie: currentCard - cardsSoFar, partieTitle: theories[pi].title, totalInPartie: partieCards };
      }
      cardsSoFar += partieCards;
    }
    return null;
  };

  const gastonTheoryTip = useMemo(() => {
    return GASTON_THEORY_TIPS[lang][currentCard % GASTON_THEORY_TIPS[lang].length];
  }, [currentCard, lang]);

  const startQuiz = useCallback(() => {
    const qs = displayQuestions.map(shuffleQuestion);
    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setGastonMsg(t('reflechis'));
    setGastonExpr('thinking');
    setPhase('quiz');
  }, [displayQuestions]);

  const handleValidate = () => {
    if (selected === null || validated) return;
    setValidated(true);
    const isCorrect = selected === questions[currentQ].correct;
    const timeSpent = (Date.now() - questionStartRef.current) / 1000;
    const qId = questions[currentQ].id;
    // Fire-and-forget: record answer for spaced repetition
    recordQuestionReview(qId, isCorrect, timeSpent).catch(() => {});
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setGastonMsg(getRandomMsg(GASTON_CORRECT[lang]));
      setGastonExpr('impressed');
    } else {
      setGastonMsg(getRandomMsg(GASTON_WRONG[lang]));
      setGastonExpr('unhappy');
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 400);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setValidated(false);
    setGastonMsg(t('reflechis'));
    setGastonExpr('thinking');
    questionStartRef.current = Date.now();
    if (currentQ + 1 < questions.length) {
      setCurrentQ(q => q + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const total = questions.length;
    const pct = total > 0 ? correctCount / total : 0;

    // In partie mode: require 70% to validate
    if (isPartieMode && partieIndex !== undefined && pct < 0.7) {
      updateQuizHistory(correctCount, total);
      setPartieFailScore({ correct: correctCount, total });
      return;
    }

    let earnedStars = 0;
    if (pct >= 1) earnedStars = 3;
    else if (pct >= 0.7) earnedStars = 2;
    else if (pct >= 0.5) earnedStars = 1;

    setStars(lessonId, earnedStars);
    const prevBadges = getUnlockedBadges();
    updateQuizHistory(correctCount, total);
    checkAndUpdateStreak();

    if (isPartieMode && partieIndex !== undefined) {
      markPartieDone(lessonId, partieIndex);
      saveLessonCardProgress(lessonId, partieIndex + 1, theories.length);
    } else {
      saveLessonQuizDone(lessonId);
    }
    if (pct >= 0.7) markLessonCompleted(lessonId);

    let xpEarned = correctCount * 10 + 50;
    if (earnedStars >= 2) xpEarned += 25;
    else if (earnedStars === 1) xpEarned += 10;
    const xpResult = updateXP(xpEarned);
    addStudyTime(Math.round((Date.now() - startTimeRef.current) / 1000));

    const newBadges = getUnlockedBadges().filter(id => !prevBadges.includes(id));
    const leveledUp = xpResult.level > xpResult.prevLevel;
    if (leveledUp) dispatchLevelUp(xpResult.prevLevel, xpResult.level, 1200);
    if (newBadges.length > 0) dispatchBadges(newBadges, leveledUp ? 4500 : 1200);

    router.push(`/resultats?correct=${correctCount}&total=${total}&stars=${earnedStars}&xp=${xpEarned}&lesson=${lessonId}&theme=${themeCode}`);
  };

  const retryPartie = () => {
    setPartieFailScore(null);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setGastonMsg(t('reflechis'));
    setGastonExpr('thinking');
    startTimeRef.current = Date.now();
    questionStartRef.current = Date.now();
    // Re-shuffle questions
    const lesson = getLessonDataLocalized(lessonId, lang);
    const src = isPartieMode && partieIndex !== undefined
      ? getQuestionsForPartie(lesson?.questions ?? [], partieIndex, lesson?.theory?.length ?? 1)
      : lesson?.questions ?? [];
    setQuestions(src.map(q => shuffleQuestion(q)));
  };

  // Premium gate: themes B-I require premium
  if (!isThemeFree(themeCode) && !isPremium()) {
    return <PremiumGate><></></PremiumGate>;
  }

  // Partie order gate: partie N requires partie N-1 completed (except revision mode)
  if (partieAccessBlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="max-w-sm w-full text-center">
          <span className="text-6xl block mb-4">🔒</span>
          <h2 className="text-xl font-black text-white mb-2">Partie verrouillée</h2>
          <p className="text-sm mb-6" style={{ color: '#8B9DC3' }}>
            Termine la partie précédente avec au moins 70% pour débloquer celle-ci.
          </p>
          <button
            onClick={() => router.push('/app')}
            className="w-full py-3.5 rounded-2xl font-extrabold text-white press-scale"
            style={{ background: '#4ecdc4' }}
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">{t('lecon_introuvable')}</p>
          <button onClick={() => router.push('/app')} className="px-6 py-3 rounded-2xl font-black text-white press-scale" style={{ background: '#4ecdc4' }}>
            {t('retour')}
          </button>
        </div>
      </div>
    );
  }

  const color = THEME_COLORS[themeCode] || '#74B9FF';
  const themeEmoji = THEME_EMOJIS[themeCode] || '📖';

  // ── THEORY PHASE ──
  if (phase === 'theory') {
    if (displayTheories.length === 0) { startQuiz(); return null; }
    const card: LocalTheoryCard = displayTheories[currentCard];
    if (!card) { startQuiz(); return null; }

    const totalCards = displayTheories.length;
    const isLastCard = currentCard === totalCards - 1;
    const partieInfo = getCurrentPartieInfo();
    const progressPct = totalCards > 0 ? ((currentCard + 1) / totalCards) * 100 : 0;

    // Parse 5-section content into structured blocks
    const SECTION_DEFS = [
      { emoji: '📋', label: 'La règle' },
      { emoji: '💡', label: 'Pourquoi' },
      { emoji: '🚗', label: 'En pratique' },
      { emoji: '📍', label: 'Exemple' },
      { emoji: '⚠️', label: 'Erreur fréquente' },
    ];

    function parseContentSections(raw: string) {
      const result: { emoji: string; label: string; body: string }[] = [];
      let current: { emoji: string; label: string; body: string } | null = null;
      for (const line of raw.split('\n')) {
        const def = SECTION_DEFS.find(s => line.trim().startsWith(s.emoji));
        if (def) {
          if (current) result.push({ ...current, body: current.body.trim() });
          const lineLabel = line.trim().slice(def.emoji.length).trim();
          current = { emoji: def.emoji, label: lineLabel || def.label, body: '' };
        } else if (current) {
          current.body += (current.body ? '\n' : '') + line;
        }
      }
      if (current) result.push({ ...current, body: current.body.trim() });
      return result.length >= 3 ? result : null;
    }

    // Strip emojis from a string (used for plain text fallback)
    function stripEmojis(s: string) {
      return s.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
    }

    const contentSections = parseContentSections(card.content);

    // Smart key points: first sentence of La règle, En pratique, Erreur fréquente
    const KEY_SECTION_LABELS = ['La règle', 'En pratique', 'Erreur fréquente'];
    const keyPoints: string[] = contentSections
      ? KEY_SECTION_LABELS
          .map(lbl => contentSections.find(s => s.label === lbl)?.body ?? '')
          .filter(Boolean)
          .map(body => {
            const sentence = body.split(/[.!?](?:\s|$)/)[0].trim();
            return sentence.length > 80 ? sentence.slice(0, 77) + '…' : sentence;
          })
          .filter(s => s.length > 5)
      : card.content
          .split(/[.!?]+/)
          .map(s => stripEmojis(s).trim())
          .filter(s => s.length > 15)
          .slice(0, 3);

    return (
      <div style={{ minHeight: '100vh' }}>
        {/* ── Sticky header ── */}
        <div
          className="sticky top-0 z-30 px-6 py-3"
          style={{ background: 'rgba(10,14,42,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #2A3550' }}
        >
          <div className="max-w-screen-xl mx-auto flex items-center gap-4">
            <button
              onClick={() => router.push('/app')}
              className="w-9 h-9 rounded-full flex items-center justify-center press-scale"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#8B9DC3' }}
            >
              ✕
            </button>
            <div className="flex-1 text-center">
              <span className="text-sm font-bold">{currentPartieTitle || lesson.title}</span>
            </div>
            <span className="text-xs font-bold" style={{ color: '#4ecdc4' }}>
              {t('carte')} {currentCard + 1}/{totalCards}
            </span>
          </div>
        </div>


        {/* ── 2-column layout ── */}
        <div className="px-6 py-6">
          <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">

            {/* ── Left: Theory card (60%) ── */}
            <div className="flex-1 min-w-0 lg:flex-[3]">
              <div
                className="rounded-2xl p-4 lg:p-8 xl:p-10 slide-up"
                style={{
                  background: '#111827',
                  border: '1px solid rgba(78,205,196,0.2)',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                }}
              >
                {/* Theme badge */}
                <div className="inline-block px-3 py-1.5 rounded-lg mb-4" style={{ background: 'rgba(78,205,196,0.15)' }}>
                  <span className="text-xs font-bold" style={{ color: '#4ecdc4' }}>{lesson.id}</span>
                </div>

                {/* Emoji icon */}
                <div className="text-6xl mb-4">{card.emoji}</div>

                {/* Title */}
                <h3 className="text-2xl font-black text-white mb-3">{card.title}</h3>

                {/* Image request — juste sous le titre */}
                <ImageRequestButton id={`${lessonId}_c${currentCard}`} />

                {/* Content — 5-section blocks or plain fallback */}
                {contentSections ? (
                  <div className="flex flex-col gap-5 mb-4">
                    {contentSections.map((sec, i) => (
                      <div key={i} className="rounded-xl px-5 py-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg leading-none">{sec.emoji}</span>
                          <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#4ecdc4' }}>{sec.label}</span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#d1d5db' }}>{sec.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base leading-relaxed mb-4" style={{ color: '#d1d5db' }}>{stripEmojis(card.content)}</p>
                )}

                {/* Signs */}
                {card.signs && card.signs.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {card.signs.map(s => <SignImage key={s} code={s} size={64} />)}
                  </div>
                )}

                {/* Separator */}
                <div className="my-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />

                {/* "J'ai pas compris" button */}
                {card.explanation_simple && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowSimple(!showSimple)}
                      className="rounded-xl px-5 py-2.5 text-sm font-bold press-scale flex items-center gap-2 transition-all"
                      style={{
                        background: 'transparent',
                        border: '1.5px solid #e74c3c',
                        color: '#e74c3c',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>{'❓'}</span>
                      {showSimple ? t('fermer_btn') : t('jai_pas_compris')}
                    </button>
                    {showSimple && (
                      <div className="mt-3 rounded-xl p-4 slide-up" style={{ background: 'rgba(253,203,110,0.12)', border: '1px solid rgba(253,203,110,0.3)' }}>
                        <p className="text-sm font-semibold leading-relaxed" style={{ color: '#FDCB6E' }}>{card.explanation_simple}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-3 mb-20 lg:mb-0">
                  {currentCard > 0 && (
                    <button
                      onClick={() => { setShowSimple(false); setCurrentCard(c => c - 1); }}
                      className="h-14 px-6 rounded-xl font-bold text-sm press-scale"
                      style={{ border: `2px solid ${color}`, color }}
                    >
                      {t('precedent')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowSimple(false);
                      if (isLastCard) { startQuiz(); }
                      else { setCurrentCard(c => c + 1); }
                    }}
                    className="flex-1 h-14 rounded-xl font-black text-base press-scale transition-all"
                    style={{ background: '#4ecdc4', color: '#0a0e2a', boxShadow: '0 4px 12px rgba(78,205,196,0.3)' }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  >
                    {isLastCard ? t('commencer_quiz') : t('suivant')}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right sidebar (40%) ── */}
            <div className="hidden lg:block lg:flex-[2] lg:max-w-[280px] xl:max-w-[380px]">
              <div className="lg:sticky lg:top-20 flex flex-col gap-5">

                {/* Progress card */}
                <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
                  <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>{t('progression')}</h4>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{themeEmoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{lesson.title}</p>
                      {partieInfo && !isPartieMode && (
                        <p className="text-[11px] mt-0.5" style={{ color: '#5A6B8A' }}>{partieInfo.partieTitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%`, background: '#4ecdc4' }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#4ecdc4' }}>{currentCard + 1}/{totalCards}</span>
                  </div>
                </div>

                {/* Prof. Gaston */}
                <div className="rounded-2xl p-5" style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)' }}>
                  <Gaston
                    message={gastonTheoryTip}
                    expression="encouraging"
                    title={t('prof_gaston')}
                  />
                </div>

                {/* Key points */}
                {keyPoints.length > 0 && (
                  <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>{t('points_cles')}</h4>
                    <div className="flex flex-col gap-2.5">
                      {keyPoints.map((point, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-xs mt-0.5" style={{ color: '#4ecdc4' }}>{'✓'}</span>
                          <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skip to quiz shortcut */}
                <button
                  onClick={startQuiz}
                  className="w-full py-3 rounded-xl text-sm font-bold press-scale transition-all"
                  style={{ background: 'transparent', border: '1.5px solid #4ecdc4', color: '#4ecdc4' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(78,205,196,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {t('passer_quiz')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PARTIE FAIL SCREEN ──
  if (partieFailScore) {
    const pct = partieFailScore.total > 0 ? Math.round((partieFailScore.correct / partieFailScore.total) * 100) : 0;
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-6">😓</div>
          <h2 className="text-2xl font-black text-white mb-3">Pas encore !</h2>
          <p className="text-base mb-2" style={{ color: '#d1d5db' }}>
            Tu dois avoir <span className="font-black" style={{ color: '#4ecdc4' }}>70%</span> de bonnes réponses pour valider cette partie.
          </p>
          <p className="text-sm mb-8" style={{ color: '#8B9DC3' }}>
            Tu as obtenu <span className="font-black" style={{ color: pct >= 50 ? '#e67e22' : '#e74c3c' }}>{pct}%</span> ({partieFailScore.correct}/{partieFailScore.total} bonnes réponses).
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={retryPartie}
              className="w-full py-4 rounded-2xl font-black text-base press-scale"
              style={{ background: '#4ecdc4', color: '#0a0e2a', boxShadow: '0 4px 16px rgba(78,205,196,0.3)' }}
            >
              🔄 Réessayer
            </button>
            <button
              onClick={() => router.push('/app')}
              className="w-full py-3 rounded-2xl font-bold text-sm press-scale"
              style={{ background: 'transparent', border: '1.5px solid #2A3550', color: '#8B9DC3' }}
            >
              Retour à la carte
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ PHASE ──
  if (phase === 'quiz' && questions.length > 0) {
    const q = questions[currentQ];
    const pctDone = ((currentQ + 1) / questions.length) * 100;

    return (
      <QuizLayout
        progress={pctDone}
        progressLabel={`${currentQ + 1}/${questions.length}`}
        headerLeft={
          <button onClick={() => router.push('/app')} className="w-9 h-9 rounded-full flex items-center justify-center press-scale" style={{ background: 'rgba(255,255,255,0.08)', color: '#8B9DC3' }}>
            {'✕'}
          </button>
        }
        headerCenter={
          <span className="text-sm font-bold">{themeEmoji} {currentPartieTitle || lesson.title} — Quiz</span>
        }
        subtitle={currentPartieTitle ? `${currentPartieTitle} — Quiz` : `${lesson.title} — Quiz`}
        question={q.question}
        signCode={q.sign}
        choices={[...q.choices]}
        selected={selected}
        validated={validated}
        correctIndex={q.correct}
        onSelect={setSelected}
        onValidate={handleValidate}
        onNext={nextQuestion}
        isLastQuestion={currentQ + 1 >= questions.length}
        explanation={q.explanation}
        shakeWrong={shakeWrong}
        questionId={q.id || `${lessonId}_q${currentQ}`}
        sidebar={
          <>
            {/* Progress card */}
            <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>{t('progression')}</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: '#8B9DC3' }}>{t('revision_question')}</span>
                <span className="text-sm font-bold">{currentQ + 1} / {questions.length}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctDone}%`, background: '#4ecdc4' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#8B9DC3' }}>{t('correctes')}</span>
                <span className="text-sm font-bold" style={{ color: '#2ecc71' }}>{correctCount}</span>
              </div>
            </div>

            {/* Theme badge */}
            <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>{t('theme')}</h4>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{themeEmoji}</span>
                <div>
                  <span className="text-xs px-2.5 py-1 rounded-md font-bold" style={{ background: color + '20', color }}>
                    {t('theme')} {themeCode}
                  </span>
                  <p className="text-sm font-bold mt-1.5">{lesson.title}</p>
                </div>
              </div>
            </div>

            {/* Gaston */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)' }}>
              <Gaston message={gastonMsg} expression={gastonExpr} title={t('prof_gaston')} />
            </div>

            {/* Explanation in sidebar after validation */}
            {validated && q.explanation && (
              <div className="rounded-2xl p-5" style={{
                background: selected === q.correct ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                border: `1px solid ${selected === q.correct ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`,
              }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: selected === q.correct ? '#2ecc71' : '#e74c3c' }}>
                  {selected === q.correct ? `✓ ${t('correct')}` : `✗ ${t('incorrect')}`}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>{q.explanation}</p>
              </div>
            )}
          </>
        }
      />
    );
  }

  return null;
}
