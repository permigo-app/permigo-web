'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getExamQuestionsLocalized, getNextThemeCode, shuffleChoices, type LocalQuestion } from '@/lib/lessonData';
import { getActiveLicense, scopedKey } from '@/lib/license';
import { useLang } from '@/contexts/LanguageContext';
import { setExamPassed, unlockTheme, updateQuizHistory, addStudyTime } from '@/lib/progressStorage';
import { recordQuestionReview } from '@/lib/reviewApi';
import { THEME_COLORS } from '@/lib/constants';
import { useIsPremium, isThemeFree, canPlayExam, recordExamPlayed, daysUntilNextExam } from '@/lib/premium';
import { prefetchImage } from '@/lib/prefetchImage';
import PremiumGate from '@/components/PremiumGate';
import Link from 'next/link';
import QuizLayout from '@/components/QuizLayout';

function ExamContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { t, lang } = useLang();
  const themeCode = params.get('theme') || 'FINAL';
  // Format officiel par permis : B = 50 questions (erreur grave = -5),
  // AM = 40 questions (chaque erreur coûte 1 point, pas de règle des -5)
  const isAM = getActiveLicense() === 'AM';
  const questionCount = isAM ? 40 : 50;

  const premiumActive = useIsPremium();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [severeErrors, setSevereErrors] = useState(0);
  // Réponses données (id question → index choisi) — pour le récapitulatif final
  const answersRef = useRef<Record<string, number>>({});
  const [shakeWrong, setShakeWrong] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const startTimeRef = useRef(Date.now());
  const hasRestoredRef = useRef(false);

  const color = THEME_COLORS[themeCode] || '#74B9FF';

  // Check if there's an active (non-completed) exam for this theme
  const hasActiveExam = typeof window !== 'undefined' && (() => {
    try {
      const saved = localStorage.getItem(scopedKey('exam_active'));
      if (!saved) return false;
      const data = JSON.parse(saved);
      return !data.completed && data.themeCode === themeCode;
    } catch { return false; }
  })();

  // Restore exam session on mount
  // Précharge l'image de la question suivante pendant qu'on lit la courante
  useEffect(() => {
    prefetchImage(questions[currentQ + 1]?.image);
  }, [currentQ, questions]);

  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    const restore = async () => {
      try {
        const saved = localStorage.getItem(scopedKey('exam_active'));
        if (!saved) return;
        const data = JSON.parse(saved);
        if (data.completed || data.themeCode !== themeCode) return;
        if (!data.questionIds || data.questionIds.length === 0) return;

        const allQs = await getExamQuestionsLocalized(themeCode, lang, 500);
        const orderedQs: LocalQuestion[] = data.questionIds
          .map((id: string) => allQs.find((q: LocalQuestion) => q.id === id))
          .filter(Boolean)
          .map((q: LocalQuestion) => {
            const s = shuffleChoices(q);
            return { ...q, choices: s.choices as [string, string, string, string], correct: s.correct };
          });

        if (orderedQs.length === 0) return;

        setQuestions(orderedQs);
        setCurrentQ(data.currentQ || 0);
        setCorrectCount(data.correctCount || 0);
        setSevereErrors(data.severeErrors || 0);
        answersRef.current = data.answers || {};
        setStarted(true);
        setIsResuming(true);
        startTimeRef.current = data.startTime || Date.now();
      } catch {
        localStorage.removeItem(scopedKey('exam_active'));
      }
    };
    restore();
  }, [themeCode, lang]);

  // Premium gate: exams for themes B-I require premium (FINAL always requires premium)
  const examThemeFree = themeCode === 'A';
  if (!examThemeFree && !premiumActive) {
    return <PremiumGate><></></PremiumGate>;
  }

  // Weekly limit — bypass if there's already an active (resumed) exam
  if (!premiumActive && !canPlayExam() && !hasActiveExam) {
    const days = daysUntilNextExam();
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Hero card */}
        <div className="rounded-3xl p-8 mb-4 text-center" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
          <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>Examen déjà passé aujourd&apos;hui</h1>
          <p className="text-base mb-5" style={{ color: 'var(--text-secondary)' }}>
            Reviens demain pour repasser l&apos;examen, ou passe à Premium pour des examens illimités.
          </p>

          {/* Stats pills — premium benefits */}
          <div className="flex justify-center gap-3 mb-5 flex-wrap">
            <div className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(255,201,40,0.12)', color: 'var(--premium)' }}>
              Examens illimités
            </div>
            <div className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(50,214,107,0.10)', color: 'var(--success)' }}>
              Tous les thèmes
            </div>
            <div className="px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'rgba(100,181,255,0.10)', color: 'var(--btn-blue)' }}>
              Corrections détaillées
            </div>
          </div>

          <p className="text-sm mb-6" style={{ color: 'var(--text-disabled)' }}>
            Les membres Premium passent l&apos;examen autant de fois qu&apos;ils veulent, sur tous les thèmes.
          </p>

          <Link
            href="/premium"
            className="inline-block w-full px-8 py-3.5 rounded-2xl font-black text-base press-scale"
            style={{ background: 'var(--premium)', color: '#0a0e2a', boxShadow: '0 4px 20px rgba(255,201,40,0.35)' }}
          >
            Passer Premium
          </Link>
        </div>
      </div>
    );
  }

  const startExam = async () => {
    const qs = (await getExamQuestionsLocalized(themeCode, lang, questionCount)).map(q => {
      const s = shuffleChoices(q);
      return { ...q, choices: s.choices as [string, string, string, string], correct: s.correct };
    });

    // Save session — exam is NOT counted as used yet
    localStorage.setItem(scopedKey('exam_active'), JSON.stringify({
      startTime: Date.now(),
      themeCode,
      currentQ: 0,
      correctCount: 0,
      questionIds: qs.map(q => q.id),
      completed: false,
    }));

    setQuestions(qs);
    setCurrentQ(0);
    setSelected(null);
    setValidated(false);
    setCorrectCount(0);
    setStarted(true);
    setIsResuming(false);
    startTimeRef.current = Date.now();
  };

  // Conditions réelles (GOCA) : répondre enregistre et passe à la question
  // suivante SANS révéler la correction — tout se découvre dans le
  // récapitulatif de fin. La réponse alimente aussi la banque d'erreurs.
  const handleValidate = () => {
    if (selected === null) return;
    const q = questions[currentQ];
    const isCorrect = selected === q.correct;
    const newScore = isCorrect ? correctCount + 1 : correctCount;
    // Règle GOCA : une erreur sur une question "grave" (3e/4e degré, vitesse)
    // coûte 5 points au lieu de 1
    const newSevere = !isCorrect && q.severe ? severeErrors + 1 : severeErrors;
    const newAnswers = { ...answersRef.current, [q.id]: selected };
    answersRef.current = newAnswers;

    // Banque d'erreurs / répétition espacée — comme les leçons
    recordQuestionReview(q.id, isCorrect, 0).catch(() => {});

    // Sync to localStorage
    try {
      const saved = localStorage.getItem(scopedKey('exam_active'));
      if (saved) {
        const data = JSON.parse(saved);
        localStorage.setItem(scopedKey('exam_active'), JSON.stringify({
          ...data,
          correctCount: newScore,
          severeErrors: newSevere,
          answers: newAnswers,
          currentQ: currentQ + 1,
        }));
      }
    } catch { /* ignore */ }

    setCorrectCount(newScore);
    setSevereErrors(newSevere);
    setSelected(null);

    if (currentQ + 1 < questions.length) { setCurrentQ(c => c + 1); }
    else { finishExam(newScore, newSevere); }
  };

  const finishExam = (finalCorrect: number = correctCount, finalSevere: number = severeErrors) => {
    // Mark completed in localStorage — exam now counts as used
    try {
      const saved = localStorage.getItem(scopedKey('exam_active'));
      if (saved) {
        const data = JSON.parse(saved);
        localStorage.setItem(scopedKey('exam_active'), JSON.stringify({ ...data, completed: true }));
      }
    } catch { /* ignore */ }

    if (!premiumActive) recordExamPlayed(); // Only counted HERE (50 questions done)

    const total = questions.length;
    const correctCount = finalCorrect;
    const severeErrors = finalSevere;
    // Cotation officielle GOCA : chaque erreur coûte 1 point, mais une erreur
    // sur une question grave (3e/4e degré, vitesse) en coûte 5 (soit 4 de plus)
    const points = Math.max(0, correctCount - severeErrors * 4);
    const passed = total > 0 && points >= Math.ceil(total * 0.82);
    updateQuizHistory(correctCount, total);

    // Récapitulatif des fautes pour la page résultats (trop gros pour l'URL)
    try {
      localStorage.setItem(scopedKey('exam_last_review'), JSON.stringify({
        theme: themeCode,
        ts: Date.now(),
        total,
        items: questions.map(q => ({
          id: q.id,
          question: q.question,
          choices: q.choices,
          selected: answersRef.current[q.id] ?? -1,
          correct: q.correct,
          explanation: q.explanation,
          severe: !!q.severe,
          sign: q.sign,
        })),
      }));
    } catch { /* ignore */ }
    if (passed) {
      // 'FINAL' est aussi enregistré — il donne le trophée Diamant global
      setExamPassed(themeCode);
      if (themeCode !== 'FINAL') {
        const next = getNextThemeCode(themeCode);
        if (next) unlockTheme(next);
      }
    }
    addStudyTime(Math.round((Date.now() - startTimeRef.current) / 1000));
    router.push(`/resultats?correct=${correctCount}&total=${total}&stars=0&theme=${themeCode}&exam=1&points=${points}&severe=${severeErrors}`);
  };

  // Explicit abandon — counts as used
  const handleAbandon = () => {
    try {
      const saved = localStorage.getItem(scopedKey('exam_active'));
      if (saved) {
        const data = JSON.parse(saved);
        localStorage.setItem(scopedKey('exam_active'), JSON.stringify({ ...data, completed: true }));
      }
    } catch { /* ignore */ }
    if (!premiumActive) recordExamPlayed();
    router.push('/app');
  };

  // Start screen
  if (!started) {
    const passCount = Math.ceil(questionCount * 0.82); // 41/50
    const examTitle = themeCode === 'FINAL' ? t('examen_blanc_final') : `${t('examen_theme')} ${themeCode}`;
    const EXAM_STATS = [
      { label: 'Questions', value: `${questionCount}` },
      { label: 'Durée', value: isAM ? '~35 min' : '~45 min' },
      { label: 'Pour réussir', value: `${passCount}/${questionCount}` },
      { label: 'Format', value: 'Officiel' },
    ];
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'Sora, sans-serif', padding: '0 0 calc(58px + env(safe-area-inset-bottom) + 24px)' }}>

        {/* Navy hero card */}
        <div style={{ background: '#0b2659', padding: '52px 20px 28px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
              Examen blanc
            </p>
            <h1 style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
              {examTitle}
            </h1>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
              {questionCount} questions · format officiel belge
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px' }}>

          {/* 2x2 stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {EXAM_STATS.map(s => (
              <div key={s.label} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-card)', borderRadius: 16, padding: '16px 14px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-navy)', lineHeight: 1 }}>{s.value}</p>
                <p style={{ margin: '5px 0 0', fontSize: 11, fontWeight: 500, color: 'var(--text-hint)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Advisory banner */}
          <div style={{ background: 'var(--bg-why)', border: '1.5px solid #fde68a', borderRadius: 14, padding: '13px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚡</span>
            <p style={{ margin: 0, fontSize: 13, color: '#92400e', lineHeight: 1.5, fontWeight: 500 }}>
              {isAM ? (
                <>Il faut obtenir <strong>{passCount} points sur {questionCount}</strong> (82%) pour réussir. Comme à l'examen officiel AM, chaque erreur coûte <strong>1 point</strong> — il n'y a pas de règle des fautes graves.</>
              ) : (
                <>Il faut obtenir <strong>{passCount} points sur {questionCount}</strong> (82%) pour réussir. Comme à l'examen officiel, une erreur sur une <strong>infraction grave</strong> (feu rouge, priorité, vitesse, alcool…) coûte <strong>5 points</strong> au lieu de 1.</>
              )}
            </p>
          </div>

          {/* Resume banner (if there's an active exam) */}
          {hasActiveExam && (
            <div style={{ background: 'var(--bg-rule)', border: '1.5px solid #c7d2fe', borderRadius: 14, padding: '13px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>💾</span>
              <p style={{ margin: 0, fontSize: 13, color: '#3730a3', lineHeight: 1.5, fontWeight: 500 }}>
                Tu as un examen en cours. En cliquant sur Commencer, tu reprends là où tu en étais.
              </p>
            </div>
          )}

          {/* CTA button */}
          <button
            onClick={startExam}
            className="press-scale"
            style={{
              width: '100%', padding: '16px', borderRadius: 14, border: 'none',
              background: '#0b2659', color: '#fff', fontWeight: 700, fontSize: 16,
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(11,38,89,.30)',
            }}
          >
            {hasActiveExam ? 'Reprendre l\'examen →' : t('examen_commencer')}
          </button>

          <p style={{ textAlign: 'center', margin: '14px 0 0', fontSize: 11, color: 'var(--text-hint)', fontWeight: 500 }}>
            Les questions sont tirées au sort depuis la banque officielle.
          </p>
        </div>
      </div>
    );
  }

  // Exam in progress
  const q = questions[currentQ];
  if (!q) return null;
  const pctDone = ((currentQ + 1) / questions.length) * 100;
  const passThreshold = Math.ceil(questions.length * 0.82);

  return (
    <QuizLayout
      progress={pctDone}
      progressLabel={`${currentQ + 1}/${questions.length}`}
      headerLeft={
        <button onClick={handleAbandon} className="w-9 h-9 rounded-full flex items-center justify-center press-scale" style={{ background: 'var(--card-secondary)', color: 'var(--text-secondary)' }}>
          {'✕'}
        </button>
      }
      headerCenter={
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('examen_header')} {themeCode !== 'FINAL' ? `Thème ${themeCode}` : 'Final'}</span>
      }
      headerRight={
        // Conditions réelles : pas de score en direct — seuil affiché à la place
        <div className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(243,156,18,0.12)', color: '#F39C12' }}>
          {t('examen_seuil_reussite')} {passThreshold}/{questions.length}
        </div>
      }
      subtitle={`Examen ${themeCode !== 'FINAL' ? `Thème ${themeCode}` : 'Final'}`}
      question={q.question}
      signCode={q.sign}
      imageUrl={q.image}
      choices={[...q.choices]}
      selected={selected}
      validated={false}
      correctIndex={q.correct}
      onSelect={setSelected}
      onValidate={handleValidate}
      onNext={handleValidate}
      isLastQuestion={currentQ + 1 >= questions.length}
      shakeWrong={false}
      questionId={q.id || `exam_${themeCode}_q${currentQ}`}
      sidebar={
        <>
          {/* Reprise banner */}
          {isResuming && (
            <div className="rounded-2xl p-4" style={{ background: 'var(--card-secondary)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--brand)' }}>
                Tu avais commencé cet examen — on reprend là où tu en étais
              </p>
            </div>
          )}

          {/* Conditions réelles : pas de score en direct, seulement l'avancement */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--card-primary)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('questions')}</span>
              <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{currentQ + 1}/{questions.length}</span>
            </div>
            <div className="h-px my-2" style={{ background: 'var(--border-subtle)' }} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('examen_seuil_reussite')}</span>
              <span className="text-sm font-bold" style={{ color: '#F39C12' }}>{passThreshold}/{questions.length}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-hint)', margin: 0 }}>
              Comme à l&apos;examen officiel, tes réponses ne sont pas corrigées en direct — tu découvriras tes fautes à la fin.
            </p>
          </div>

        </>
      }
    />
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ExamContent />
    </Suspense>
  );
}
