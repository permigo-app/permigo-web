'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLessonDataLocalized, getThemeForLessonLocalized, shuffleChoices, type LocalQuestion } from '@/lib/lessonData';
import { useLang } from '@/contexts/LanguageContext';
import { GASTON_CORRECT, GASTON_WRONG, getRandomMsg } from '@/locales/messages';
import { isPremium, isThemeFree } from '@/lib/premium';
import PremiumGate from '@/components/PremiumGate';
import { setStars, updateQuizHistory, updateXP, checkAndUpdateStreak, addStudyTime } from '@/lib/progressStorage';
import { THEME_COLORS, THEME_EMOJIS } from '@/lib/constants';
import QuizLayout from '@/components/QuizLayout';
import Gaston from '@/components/Gaston';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { t, lang } = useLang();
  const lessonId = (params.id as string)?.toUpperCase();

  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [gastonMsg, setGastonMsg] = useState('');
  const [gastonExpr, setGastonExpr] = useState<'happy' | 'impressed' | 'unhappy' | 'thinking'>('thinking');
  const [gastonAnim, setGastonAnim] = useState('gaston-think');
  const [themeCode, setThemeCode] = useState('A');
  const [shakeWrong, setShakeWrong] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const lesson = getLessonDataLocalized(lessonId, lang);
    if (lesson) setQuestions([...lesson.questions].sort(() => Math.random() - 0.5).map(q => {
      const s = shuffleChoices(q);
      return { ...q, choices: s.choices as [string, string, string, string], correct: s.correct };
    }));
    const themeData = getThemeForLessonLocalized(lessonId, lang);
    if (themeData) setThemeCode(themeData.theme);
  }, [lessonId, lang]);

  const handleValidate = () => {
    if (selected === null || validated) return;
    setValidated(true);
    const isCorrect = selected === questions[currentQ].correct;
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setGastonMsg(getRandomMsg(GASTON_CORRECT[lang]));
      setGastonExpr('impressed');
      setGastonAnim('gaston-jump');
      setTimeout(() => setGastonAnim('gaston-float'), 800);
    } else {
      setGastonMsg(getRandomMsg(GASTON_WRONG[lang]));
      setGastonExpr('unhappy');
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 400);
      setGastonAnim('gaston-shake');
      setTimeout(() => setGastonAnim('gaston-float'), 600);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    setValidated(false);
    setGastonMsg(t('reflechis'));
    setGastonExpr('thinking');
    setGastonAnim('gaston-think');
    if (currentQ + 1 < questions.length) { setCurrentQ(q => q + 1); }
    else {
      const total = questions.length;
      const pct = total > 0 ? correctCount / total : 0;
      let earnedStars = 0;
      if (pct >= 1) earnedStars = 3;
      else if (pct >= 0.7) earnedStars = 2;
      else if (pct >= 0.5) earnedStars = 1;
      setStars(lessonId, earnedStars);
      updateQuizHistory(correctCount, total);
      checkAndUpdateStreak();
      const xpEarned = correctCount * 10 + 50;
      updateXP(xpEarned);
      addStudyTime(Math.round((Date.now() - startTimeRef.current) / 1000));
      router.push(`/resultats?correct=${correctCount}&total=${total}&stars=${earnedStars}&xp=${xpEarned}&lesson=${lessonId}&theme=${themeCode}`);
    }
  };

  if (questions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen"><p style={{ color: '#8B9DC3' }}>{t('chargement')}</p></div>;
  }

  const q = questions[currentQ];
  const pctDone = ((currentQ + 1) / questions.length) * 100;
  const themeEmoji = THEME_EMOJIS[themeCode] || '📖';
  const color = THEME_COLORS[themeCode] || '#74B9FF';

  // Upcoming questions preview
  const upcoming = questions.slice(currentQ + 1, currentQ + 4);

  // Premium gate: themes B-I require premium
  if (!isThemeFree(themeCode) && !isPremium()) {
    return <PremiumGate><></></PremiumGate>;
  }

  return (
    <QuizLayout
      progress={pctDone}
      progressLabel={`${currentQ + 1}/${questions.length}`}
      headerLeft={
        <button onClick={() => router.push('/')} className="w-9 h-9 rounded-full flex items-center justify-center press-scale" style={{ background: 'rgba(255,255,255,0.08)', color: '#8B9DC3' }}>
          {'✕'}
        </button>
      }
      headerCenter={
        <span className="text-sm font-bold">{themeEmoji} Quiz — {lessonId}</span>
      }
      subtitle={`Leçon ${lessonId} — Quiz`}
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
              <span className="text-xs px-2.5 py-1 rounded-md font-bold" style={{ background: color + '20', color }}>
                Thème {themeCode} — {lessonId}
              </span>
            </div>
          </div>

          {/* Gaston */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(78,205,196,0.08)', border: '1px solid rgba(78,205,196,0.15)' }}>
            <Gaston message={gastonMsg || t('reflechis')} expression={gastonExpr} size="small" title={t('prof_gaston')} animClass={gastonAnim} />
          </div>

          {/* Explanation in sidebar after validation */}
          {validated && q.explanation && (
            <div className="rounded-2xl p-5" style={{
              background: selected === q.correct ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
              border: `1px solid ${selected === q.correct ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`,
            }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: selected === q.correct ? '#2ecc71' : '#e74c3c' }}>
                {selected === q.correct ? '✓ ' + t('correct') : '✗ ' + t('incorrect')}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#d1d5db' }}>{q.explanation}</p>
            </div>
          )}

          {/* Upcoming questions */}
          {upcoming.length > 0 && !validated && (
            <div className="rounded-2xl p-5" style={{ background: '#16213E', border: '1px solid #2A3550' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4ecdc4' }}>{t('flash_prochaines')}</h4>
              <div className="flex flex-col gap-2">
                {upcoming.map((uq, i) => (
                  <p key={i} className="text-xs leading-relaxed truncate" style={{ color: '#5A6B8A' }}>
                    {currentQ + 2 + i}. {uq.question}
                  </p>
                ))}
              </div>
            </div>
          )}
        </>
      }
    />
  );
}
