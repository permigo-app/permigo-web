'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getLessonData, getThemeForLesson, type LocalTheoryCard, type LocalQuestion, type LocalPartie } from '@/lib/lessonData';
import { setStars, updateQuizHistory, updateXP, saveLessonQuizDone, saveLessonCardProgress, markPartieDone, checkAndUpdateStreak } from '@/lib/progressStorage';
import { THEME_COLORS, GASTON_CORRECT, GASTON_WRONG, getRandomMessage } from '@/lib/constants';
import SignImage from '@/components/SignImage';
import Gaston from '@/components/Gaston';

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
  // Fallback: equal division
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
  const lessonId = (params.id as string)?.toUpperCase();
  const partieParam = searchParams.get('partie');
  const isPartieMode = partieParam !== null;
  const partieIndex = isPartieMode ? parseInt(partieParam, 10) : undefined;

  const [phase, setPhase] = useState<Phase>('theory');
  const [lesson, setLesson] = useState(getLessonData(lessonId));
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
  const [gastonMsg, setGastonMsg] = useState('Réfléchis bien... 🤔');
  const [gastonExpr, setGastonExpr] = useState<'happy' | 'encouraging' | 'unhappy' | 'impressed' | 'party' | 'thinking'>('thinking');
  const [shakeWrong, setShakeWrong] = useState(false);

  useEffect(() => {
    const l = getLessonData(lessonId);
    setLesson(l);
    const t = getThemeForLesson(lessonId);
    if (t) setThemeCode(t.theme);
  }, [lessonId]);

  // ── Compute display data based on partie mode ──
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

  // For full lesson mode: track which partie we're in
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

  const startQuiz = useCallback(() => {
    const qs = displayQuestions.map(shuffleQuestion);
    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setGastonMsg('Réfléchis bien... 🤔');
    setGastonExpr('thinking');
    setPhase('quiz');
  }, [displayQuestions]);

  const handleValidate = () => {
    if (selected === null || validated) return;
    setValidated(true);
    const isCorrect = selected === questions[currentQ].correct;
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setGastonMsg(getRandomMessage(GASTON_CORRECT));
      setGastonExpr('impressed');
    } else {
      setGastonMsg(getRandomMessage(GASTON_WRONG));
      setGastonExpr('unhappy');
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 400);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setValidated(false);
    setGastonMsg('Réfléchis bien... 🤔');
    setGastonExpr('thinking');
    if (currentQ + 1 < questions.length) {
      setCurrentQ(q => q + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const total = questions.length;
    const pct = total > 0 ? correctCount / total : 0;
    let earnedStars = 0;
    if (pct >= 1) earnedStars = 3;
    else if (pct >= 0.7) earnedStars = 2;
    else if (pct >= 0.5) earnedStars = 1;

    setStars(lessonId, earnedStars);
    updateQuizHistory(correctCount, total);
    checkAndUpdateStreak();

    // Mark partie done if in partie mode
    if (isPartieMode && partieIndex !== undefined) {
      markPartieDone(lessonId, partieIndex);
      saveLessonCardProgress(lessonId, partieIndex + 1, theories.length);
    } else {
      saveLessonQuizDone(lessonId);
    }

    let xpEarned = correctCount * 10 + 50;
    if (earnedStars >= 2) xpEarned += 25;
    else if (earnedStars === 1) xpEarned += 10;
    updateXP(xpEarned);

    router.push(`/resultats?correct=${correctCount}&total=${total}&stars=${earnedStars}&xp=${xpEarned}&lesson=${lessonId}&theme=${themeCode}`);
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">Leçon introuvable</p>
          <button onClick={() => router.push('/')} className="px-6 py-3 rounded-2xl font-black text-white press-scale" style={{ background: '#00B894' }}>
            Retour
          </button>
        </div>
      </div>
    );
  }

  const color = THEME_COLORS[themeCode] || '#74B9FF';

  // ── THEORY ──
  if (phase === 'theory') {
    if (displayTheories.length === 0) { startQuiz(); return null; }
    const card: LocalTheoryCard = displayTheories[currentCard];
    if (!card) { startQuiz(); return null; }

    const totalCards = displayTheories.length;
    const isLastCard = currentCard === totalCards - 1;
    const partieInfo = getCurrentPartieInfo();

    return (
      <div className="max-w-2xl mx-auto px-4 py-5" style={{ background: '#1B1B2F', minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white press-scale"
            style={{ background: 'rgba(255,255,255,0.10)' }}
          >
            ✕
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm font-bold">
              {currentPartieTitle || lesson.title}
            </span>
          </div>
          <span className="text-xs font-bold" style={{ color: '#8B9DC3' }}>
            Carte {currentCard + 1}/{totalCards}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-[5px] justify-center mb-5">
          {displayTheories.map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === currentCard ? 24 : 12,
                background: i <= currentCard ? color : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        {/* Partie title indicator */}
        {(currentPartieTitle || partieInfo) && (
          <p className="text-xs font-bold mb-3 ml-1" style={{ color: '#8B9DC3' }}>
            {currentPartieTitle || partieInfo?.partieTitle}
            {partieInfo && !isPartieMode && (
              <span className="ml-2 opacity-60">
                ({partieInfo.cardInPartie + 1}/{partieInfo.totalInPartie})
              </span>
            )}
          </p>
        )}

        {/* Theory card — WHITE card */}
        <div
          className="rounded-3xl p-6 mb-5 slide-up"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
          }}
        >
          <div className="inline-block px-3 py-1 rounded-xl mb-3" style={{ background: color + '20' }}>
            <span className="text-xs font-bold" style={{ color }}>{lesson.id}</span>
          </div>

          <div className="text-4xl mb-3">{card.emoji}</div>
          <h3 className="text-[19px] font-extrabold mb-3" style={{ color: '#1A1A2E' }}>{card.title}</h3>
          <p className="text-base leading-relaxed" style={{ color: '#444' }}>{card.content}</p>

          {card.signs && card.signs.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {card.signs.map(s => <SignImage key={s} code={s} size={64} />)}
            </div>
          )}
        </div>

        {/* "J'ai pas compris" button */}
        {card.explanation_simple && (
          <div className="mb-4">
            <button
              onClick={() => setShowSimple(!showSimple)}
              className="text-sm font-semibold underline press-scale"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {showSimple ? 'Fermer' : "J'ai pas compris 🤔"}
            </button>
            {showSimple && (
              <div className="mt-3 rounded-2xl p-4 slide-up" style={{ background: 'rgba(253,203,110,0.15)', border: '1px solid rgba(253,203,110,0.3)' }}>
                <p className="text-sm font-semibold" style={{ color: '#FDCB6E' }}>{card.explanation_simple}</p>
              </div>
            )}
          </div>
        )}

        {/* Gaston */}
        <div className="mb-4">
          <Gaston message="Lis bien cette carte ! 📖" expression="encouraging" size="small" />
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentCard > 0 && (
            <button
              onClick={() => { setShowSimple(false); setCurrentCard(c => c - 1); }}
              className="h-14 px-6 rounded-2xl font-bold text-sm press-scale"
              style={{ border: `2px solid ${color}`, color }}
            >
              ← Précédent
            </button>
          )}
          <button
            onClick={() => {
              setShowSimple(false);
              if (isLastCard) { startQuiz(); }
              else { setCurrentCard(c => c + 1); }
            }}
            className="flex-1 h-14 rounded-2xl font-black text-sm text-white press-scale"
            style={{ background: color, boxShadow: `0 4px 12px ${color}50` }}
          >
            {isLastCard ? '🎯 Commencer le quiz' : 'Suivant →'}
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (phase === 'quiz' && questions.length > 0) {
    const q = questions[currentQ];
    const pctDone = ((currentQ + 1) / questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto px-4 py-5" style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm press-scale"
            style={{ background: '#16213E', color: 'white' }}
          >
            ✕
          </button>
          <div className="flex-1">
            <div className="h-[10px] rounded-full overflow-hidden" style={{ background: '#1E2D4A' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctDone}%`, background: color }} />
            </div>
          </div>
          <span className="text-xs font-bold" style={{ color: '#8B9DC3' }}>
            {currentQ + 1}/{questions.length}
          </span>
        </div>

        {/* Partie indicator */}
        {currentPartieTitle && (
          <p className="text-xs font-bold text-center mb-3" style={{ color: '#8B9DC3' }}>
            {currentPartieTitle} — Quiz
          </p>
        )}

        {/* Sign image */}
        {q.sign && (
          <div className="flex justify-center mb-5">
            <SignImage code={q.sign} size={100} />
          </div>
        )}

        {/* Question */}
        <p className="text-xl font-bold text-center mb-6 leading-relaxed">{q.question}</p>

        {/* Answer grid — 2 columns */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {q.choices.map((choice, i) => {
            let bg = '#252545';
            let borderColor = 'rgba(255,255,255,0.08)';
            let textColor = 'rgba(255,255,255,0.82)';

            if (validated) {
              if (i === q.correct) {
                bg = '#0D3B20'; borderColor = '#27AE60'; textColor = '#4ADE80';
              } else if (i === selected) {
                bg = '#3B0D0D'; borderColor = '#E74C3C'; textColor = '#FC8181';
              }
            } else if (i === selected) {
              bg = 'rgba(0,184,148,0.13)'; borderColor = '#00B894';
            }

            return (
              <button
                key={i}
                onClick={() => !validated && setSelected(i)}
                disabled={validated}
                className={`rounded-2xl p-4 text-left font-semibold text-[15px] leading-snug transition-all press-scale ${shakeWrong && validated && i === selected && i !== q.correct ? 'shake' : ''}`}
                style={{
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  color: textColor,
                  minHeight: 72,
                }}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {/* Feedback panel */}
        {validated && (
          <div
            className="rounded-t-[28px] p-5 mb-4 slide-up"
            style={{ background: selected === q.correct ? '#1A5C38' : '#6B1A1A' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">{selected === q.correct ? '🎉' : '😅'}</span>
              <span className="text-lg font-bold">{selected === q.correct ? 'Correct !' : 'Incorrect'}</span>
            </div>
            <p className="text-sm leading-relaxed opacity-90">{q.explanation}</p>
          </div>
        )}

        {/* Gaston */}
        <div className="mb-4">
          <Gaston message={gastonMsg} expression={gastonExpr} size="small" />
        </div>

        {/* Validate / Next button */}
        {!validated ? (
          <button
            onClick={handleValidate}
            disabled={selected === null}
            className="w-full h-14 rounded-2xl font-black text-base text-white press-scale transition-all"
            style={{
              background: selected !== null ? color : '#2A3550',
              opacity: selected !== null ? 1 : 0.5,
              boxShadow: selected !== null ? `0 4px 12px ${color}50` : 'none',
            }}
          >
            VALIDER
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="w-full h-14 rounded-2xl font-black text-base text-white press-scale"
            style={{ background: color, boxShadow: `0 4px 12px ${color}50` }}
          >
            {currentQ + 1 < questions.length ? 'SUIVANTE →' : 'VOIR RÉSULTATS →'}
          </button>
        )}
      </div>
    );
  }

  return null;
}
