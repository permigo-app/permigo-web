'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getLessonDataLocalized, getThemeForLessonLocalized, type LocalTheoryCard, type LocalQuestion, type LocalPartie, type LocalLesson } from '@/lib/lessonData';
import { useLang } from '@/contexts/LanguageContext';
import { setStars, updateQuizHistory, saveLessonQuizDone, saveLessonCardProgress, markPartieDone, markLessonCompleted, isPartieCompleted, isLessonCompleted, getCompletedParties, getAllExams, addStudyTime } from '@/lib/progressStorage';
import { computeTier, countThemeParts, TIER_ORDER, type Tier } from '@/lib/medals';
import { recordQuestionReview } from '@/lib/reviewApi';
import { THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import { isPremium, isThemeFree } from '@/lib/premium';
import { prefetchImage } from '@/lib/prefetchImage';
import PremiumGate from '@/components/PremiumGate';
import SignImage from '@/components/SignImage';
import QuizLayout from '@/components/QuizLayout';
import ImageRequestButton from '@/components/ImageRequestButton';
import { SkeletonList } from '@/components/ui/SkeletonList';

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

/** Palier de médaille du thème à l'instant T (mêmes règles que MedalCollection). */
function themeTierNow(lessons: LocalLesson[], themeCode: string): Tier {
  let done = 0, total = 0;
  for (const l of lessons) {
    const parts = countThemeParts(l.id, l.theory?.length ?? 1, isLessonCompleted, getCompletedParties);
    done += parts.done;
    total += parts.total;
  }
  const exams = getAllExams();
  return computeTier(done, total, exams[themeCode] === true);
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

  const [phase, setPhase] = useState<Phase>('theory');
  const [lesson, setLesson] = useState<LocalLesson | null>(null);
  const [themeCode, setThemeCode] = useState('A');
  const [themeLessons, setThemeLessons] = useState<LocalLesson[]>([]);

  // Theory
  const [currentCard, setCurrentCard] = useState(0);
  const [showSimple, setShowSimple] = useState(false);

  // Quiz
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [partieFailScore, setPartieFailScore] = useState<{ correct: number; total: number } | null>(null);
  const startTimeRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());

  useEffect(() => {
    getLessonDataLocalized(lessonId, lang).then(l => setLesson(l));
    getThemeForLessonLocalized(lessonId, lang).then(t => { if (t) { setThemeCode(t.theme); setThemeLessons(t.lessons); } });
  }, [lessonId, lang]);

  // Reset all quiz state when the active partie changes
  useEffect(() => {
    setPhase('theory');
    setCurrentCard(0);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setPartieFailScore(null);
    setShowSimple(false);
    setQuestions([]);
  }, [partieIndex]);

  const theories: LocalPartie[] = lesson?.theory ?? [];
  const allQuestions: LocalQuestion[] = lesson?.questions ?? [];

  const displayTheories: LocalTheoryCard[] = isPartieMode && partieIndex !== undefined && partieIndex < theories.length
    ? (theories[partieIndex]?.cards ?? [])
    : theories.flatMap(p => p.cards);

  const displayQuestions: LocalQuestion[] = isPartieMode && partieIndex !== undefined
    ? getQuestionsForPartie(allQuestions, partieIndex, theories.length)
    : allQuestions;

  // Précharge l'image de la carte / question suivante pendant qu'on lit la courante
  useEffect(() => {
    if (phase === 'theory') prefetchImage(displayTheories[currentCard + 1]?.image);
    else prefetchImage(questions[currentQ + 1]?.image);
  }, [phase, currentCard, currentQ, displayTheories, questions]);

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

  const startQuiz = useCallback(() => {
    const qs = displayQuestions.map(shuffleQuestion);
    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
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
    } else {
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 400);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setValidated(false);
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

    // Mode partie : 90% de bonnes réponses requis pour valider
    if (isPartieMode && partieIndex !== undefined && pct < 0.9) {
      updateQuizHistory(correctCount, total);
      setPartieFailScore({ correct: correctCount, total });
      return;
    }

    let earnedStars = 0;
    if (pct >= 1) earnedStars = 3;
    else if (pct >= 0.7) earnedStars = 2;
    else if (pct >= 0.5) earnedStars = 1;

    // Palier de médaille du thème avant cette leçon — comparé au palier
    // après pour détecter un déblocage frais et le signaler sur /resultats
    // (sinon la seule façon de le remarquer est d'aller voir soi-même la
    // collection de médailles).
    const tierBefore: Tier = themeLessons.length > 0 ? themeTierNow(themeLessons, themeCode) : 'none';

    updateQuizHistory(correctCount, total);

    if (isPartieMode && partieIndex !== undefined) {
      markPartieDone(lessonId, partieIndex);
      saveLessonCardProgress(lessonId, partieIndex + 1, theories.length);
      // La leçon n'est terminée (et étoilée) que quand TOUTES ses parties
      // sont faites — sinon la progression par parties saute d'un coup
      if (pct >= 0.9 && getCompletedParties(lessonId).length >= theories.length) {
        setStars(lessonId, earnedStars);
        markLessonCompleted(lessonId);
      }
    } else {
      setStars(lessonId, earnedStars);
      saveLessonQuizDone(lessonId);
      if (pct >= 0.7) markLessonCompleted(lessonId);
    }

    addStudyTime(Math.round((Date.now() - startTimeRef.current) / 1000));

    const tierAfter: Tier = themeLessons.length > 0 ? themeTierNow(themeLessons, themeCode) : 'none';
    const medalStr = TIER_ORDER.indexOf(tierAfter) > TIER_ORDER.indexOf(tierBefore) ? `&medal=${tierAfter}` : '';

    const partieStr = isPartieMode && partieIndex !== undefined
      ? `&partie=${partieIndex}&totalParties=${theories.length}`
      : '';
    router.push(`/resultats?correct=${correctCount}&total=${total}&stars=${earnedStars}&lesson=${lessonId}&theme=${themeCode}${partieStr}${medalStr}`);
  };

  const retryPartie = () => {
    setPartieFailScore(null);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    startTimeRef.current = Date.now();
    questionStartRef.current = Date.now();
    // Re-use already-loaded lesson from state
    const src = isPartieMode && partieIndex !== undefined
      ? getQuestionsForPartie(lesson?.questions ?? [], partieIndex, lesson?.theory?.length ?? 1)
      : lesson?.questions ?? [];
    setQuestions(src.map(q => shuffleQuestion(q)));
  };

  // Premium gate: themes B-I require premium
  if (!isThemeFree(themeCode) && !isPremium()) {
    return <PremiumGate><></></PremiumGate>;
  }

  if (!lesson) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif' }}>
        <div style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-header)', paddingTop: 52, paddingBottom: 20, height: 80 }} />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>
          <SkeletonList count={3} height={80} />
        </div>
      </div>
    );
  }

  const color = THEME_COLORS[themeCode] || '#74B9FF';
  const themeEmoji = THEME_EMOJIS[themeCode] || '📖';

  // ── PARTIE SELECTOR ── (quand pas de ?partie= et plusieurs parties)
  if (!isPartieMode && theories.length > 1) {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif', paddingBottom: 120 }}>
        {/* Header */}
        <div style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-header)', padding: '52px 20px 20px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <button
              onClick={() => router.back()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span style={{ fontSize: 13, color: 'var(--text-hint)', fontWeight: 500 }}>Retour</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {themeEmoji}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
                  THÈME {themeCode} · {lesson.title}
                </p>
                <h1 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--text-title)' }}>
                  Choisissez une partie
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des parties */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--text-hint)' }}>
            {theories.length} PARTIES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {theories.map((partie, i) => {
              const done = isPartieCompleted(lessonId, i);
              return (
                <button
                  key={i}
                  onClick={() => router.push(`/lecon/${lessonId}?partie=${i}`)}
                  className="press-scale"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--bg-card)',
                    border: `1.5px solid ${done ? '#0b2659' : 'var(--border-card)'}`,
                    borderRadius: 16, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', width: '100%',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: done ? '#0b2659' : 'var(--bg-input)',
                    border: `1.5px solid ${done ? '#f59e0b' : 'var(--border-card)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hint)' }}>{i + 1}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-title)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {partie.title.replace(/^Partie \d+ [—–-] /, '')}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-hint)' }}>
                      {partie.cards.length} carte{partie.cards.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  {done ? (
                    // Tampon « validé » bleu foncé, légèrement incliné
                    <span style={{
                      flexShrink: 0,
                      transform: 'rotate(-7deg)',
                      background: '#0b2659',
                      color: '#FFFFFF',
                      border: '2px solid rgba(245,158,11,0.85)',
                      borderRadius: 7,
                      padding: '4px 10px',
                      fontSize: 10, fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      boxShadow: '0 2px 8px rgba(11,38,89,0.35)',
                    }}>
                      ✓ Validé
                    </span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-hint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

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

    // ── Section style config ─────────────────────────────────────
    type SectionStyle = { bg: string; border: string; labelColor: string };
    function getSectionStyle(sec: { emoji: string; label: string }): SectionStyle {
      const lbl = sec.label.toLowerCase();
      const e = sec.emoji;
      if (e === '📋' || lbl.includes('règle') || lbl.includes('rule')) return { bg: 'var(--bg-rule)', border: '#0b2659', labelColor: 'var(--text-navy)' };
      if (e === '💡' || lbl.includes('pourquoi') || lbl.includes('why')) return { bg: 'var(--bg-why)', border: '#f59e0b', labelColor: '#b45309' };
      if (e === '🚗' || lbl.includes('pratique') || lbl.includes('practice')) return { bg: 'var(--bg-prac)', border: '#22c55e', labelColor: '#166534' };
      if (e === '📍' || lbl.includes('exemple') || lbl.includes('example')) return { bg: 'var(--bg-example)', border: '#0ea5e9', labelColor: '#0369a1' };
      if (e === '⚠️' || lbl.includes('erreur') || lbl.includes('error')) return { bg: 'var(--bg-error-section)', border: '#ef4444', labelColor: '#b91c1c' };
      return { bg: 'var(--bg-input)', border: 'var(--border-card)', labelColor: 'var(--text-hint)' };
    }

    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif', paddingBottom: 140 }}>

        {/* ── Sticky header ───────────────────────────────────────── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'var(--bg-header)', borderBottom: '1px solid var(--border-header)',
          padding: '12px 16px 12px',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <button
                onClick={() => router.back()}
                style={{
                  width: 34, height: 34, borderRadius: 10, border: '1.5px solid var(--border-card)',
                  background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <p style={{ flex: 1, margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-title)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentPartieTitle || lesson.title}
              </p>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', flexShrink: 0 }}>
                {currentCard + 1}/{totalCards}
              </span>
            </div>
            {/* Step progress dots */}
            <div style={{ display: 'flex', gap: 4 }}>
              {displayTheories.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: 4, borderRadius: 4,
                    background: i <= currentCard ? '#0b2659' : '#e8eaed',
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Card ────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 16px 0' }}>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-card)', borderRadius: 18, padding: '22px 20px', wordBreak: 'break-word' }}>

            {/* Card header: emoji + title */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 48, height: 48, background: 'var(--bg-input)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {card.emoji}
              </div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-title)', lineHeight: 1.35 }}>
                {card.title}
              </h2>
            </div>

            {/* Theory image */}
            {card.image && (
              <div style={{ width: '100%', marginBottom: 16, borderRadius: 12, overflow: 'hidden' }}>
                <img
                  src={card.image}
                  alt={card.title}
                  style={{ width: '100%', height: 220, objectFit: 'contain', display: 'block', background: 'var(--card-secondary)' }}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            {/* ImageRequestButton: only when no image */}
            {!card.image && <ImageRequestButton id={`${lessonId}_c${currentCard}`} />}

            {/* Content sections or plain text */}
            {contentSections ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {contentSections.map((sec, i) => {
                  const s = getSectionStyle(sec);
                  return (
                    <div key={i} style={{ background: s.bg, borderLeft: `4px solid ${s.border}`, borderRadius: '0 10px 10px 0', padding: '11px 14px' }}>
                      <p style={{ margin: '0 0 5px', fontSize: 10, fontWeight: 700, letterSpacing: '1.1px', textTransform: 'uppercase', color: s.labelColor }}>
                        {sec.emoji} {sec.label}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'var(--text-sub)', whiteSpace: 'pre-line' }}>
                        {sec.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--text-sub)' }}>
                {stripEmojis(card.content)}
              </p>
            )}

            {/* Signs */}
            {card.signs && card.signs.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {card.signs.map(s => <SignImage key={s} code={s} size={56} />)}
              </div>
            )}

            {/* "J'ai pas compris" */}
            {card.explanation_simple && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setShowSimple(!showSimple)}
                  className="press-scale"
                  style={{
                    background: 'transparent', border: '1.5px solid #ef4444', color: '#ef4444',
                    borderRadius: 10, padding: '7px 14px', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'none',
                  }}
                >
                  <span>❓</span>
                  {showSimple ? t('fermer_btn') : t('jai_pas_compris')}
                </button>
                {showSimple && (
                  <div style={{ marginTop: 10, background: 'var(--bg-why)', borderLeft: '4px solid #f59e0b', borderRadius: '0 10px 10px 0', padding: '11px 14px' }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.65 }}>{card.explanation_simple}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Skip to quiz link */}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button
              onClick={startQuiz}
              style={{ background: 'transparent', border: 'none', fontSize: 12, fontWeight: 600, color: '#a0a8b8', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {t('passer_quiz')}
            </button>
          </div>
        </div>

        {/* ── Fixed bottom navigation ──────────────────────────────── */}
        <div style={{
          position: 'fixed', bottom: 70, left: 0, right: 0,
          padding: '0 16px', zIndex: 40, pointerEvents: 'none',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10, pointerEvents: 'auto' }}>
            {currentCard > 0 && (
              <button
                onClick={() => { setShowSimple(false); setCurrentCard(c => c - 1); }}
                className="press-scale"
                style={{
                  height: 52, paddingLeft: 18, paddingRight: 18, borderRadius: 14,
                  border: '1.5px solid var(--text-navy)', color: 'var(--text-navy)', background: 'var(--bg-card)',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0,
                  boxShadow: '0 2px 10px var(--pm-shadow)',
                }}
              >
                ← {t('precedent')}
              </button>
            )}
            <button
              onClick={() => { setShowSimple(false); if (isLastCard) { startQuiz(); } else { setCurrentCard(c => c + 1); } }}
              className="press-scale"
              style={{
                flex: 1, height: 52, borderRadius: 14, border: 'none',
                background: '#0b2659', color: '#fff',
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(11,38,89,.30)',
              }}
            >
              {isLastCard ? t('commencer_quiz') : `Continuer →`}
            </button>
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
          <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Pas encore !</h2>
          <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>
            Tu dois avoir <span className="font-black" style={{ color: 'var(--brand)' }}>90%</span> de bonnes réponses pour valider cette partie.
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Tu as obtenu <span className="font-black" style={{ color: pct >= 50 ? '#e67e22' : 'var(--error)' }}>{pct}%</span> ({partieFailScore.correct}/{partieFailScore.total} bonnes réponses).
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={retryPartie}
              className="w-full py-4 rounded-2xl font-black text-base press-scale"
              style={{ background: 'var(--brand)', color: 'var(--bg-primary)', boxShadow: '0 4px 16px rgba(78,205,196,0.3)' }}
            >
              🔄 Réessayer
            </button>
            <button
              onClick={() => router.back()}
              className="w-full py-3 rounded-2xl font-bold text-sm press-scale"
              style={{ background: 'transparent', border: '1.5px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
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
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center press-scale" style={{ background: 'var(--card-secondary)', color: 'var(--text-secondary)' }}>
            {'✕'}
          </button>
        }
        headerCenter={
          <span className="text-sm font-bold">{themeEmoji} {currentPartieTitle || lesson.title} — Quiz</span>
        }
        subtitle={currentPartieTitle ? `${currentPartieTitle} — Quiz` : `${lesson.title} — Quiz`}
        question={q.question}
        signCode={q.sign}
      imageUrl={q.image}
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
            <div className="rounded-2xl p-5" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand)' }}>{t('progression')}</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('revision_question')}</span>
                <span className="text-sm font-bold">{currentQ + 1} / {questions.length}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--border-subtle)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctDone}%`, background: 'var(--brand)' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('correctes')}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>{correctCount}</span>
              </div>
            </div>

            {/* Theme badge */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand)' }}>{t('theme')}</h4>
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

            {/* Explanation in sidebar after validation */}
            {validated && q.explanation && (
              <div className="rounded-2xl p-5" style={{
                background: selected === q.correct ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                border: `1px solid ${selected === q.correct ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`,
              }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: selected === q.correct ? 'var(--success)' : 'var(--error)' }}>
                  {selected === q.correct ? `✓ ${t('correct')}` : `✗ ${t('incorrect')}`}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{q.explanation}</p>
              </div>
            )}
          </>
        }
      />
    );
  }

  return null;
}
