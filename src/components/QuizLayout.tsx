'use client';

import { type ReactNode, useEffect, useRef, useCallback } from 'react';
import SignImage from '@/components/SignImage';
import { useLang } from '@/contexts/LanguageContext';
import ImageRequestButton from '@/components/ImageRequestButton';
import { playSound } from '@/lib/sounds';

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

export interface QuizChoice {
  text: string;
  index: number;
}

interface QuizLayoutProps {
  /* Header */
  progress: number; // 0-100
  progressLabel?: string; // e.g. "3/10"
  headerLeft?: ReactNode; // e.g. close button
  headerCenter?: ReactNode; // e.g. timer
  headerRight?: ReactNode; // e.g. score
  /**
   * Sur téléphone, masque le titre central et remonte la barre de progression
   * sur la même ligne que la croix : l'en-tête passe de deux lignes à une.
   * À NE PAS activer quand le centre porte une info vitale (chrono du Turbo).
   */
  compactTitle?: boolean;

  /* Question */
  subtitle?: string; // e.g. "Partie 1 — Quiz"
  question: string;
  signCode?: string;
  imageUrl?: string; // illustration de situation (GOCA-style), affichée au-dessus de la question

  /* Choices */
  choices: string[];
  selected: number | null;
  validated: boolean;
  correctIndex: number;
  onSelect: (i: number) => void;

  /* Actions */
  onValidate: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
  lastLabel?: string; // default "VOIR RÉSULTATS →"

  /* Sidebar */
  sidebar?: ReactNode;
  /** Colonne de gauche, desktop uniquement — grille des questions de l'examen blanc. */
  leftPanel?: ReactNode;

  /* Feedback */
  explanation?: string;
  shakeWrong?: boolean;

  /* Image request */
  questionId?: string;

  /**
   * Identifiant de la question courante (id ou index). Sert UNIQUEMENT à
   * remettre la page en haut quand on passe à la question suivante. À défaut,
   * on retombe sur le texte de la question.
   */
  questionKey?: string | number;
}

export default function QuizLayout({
  progress,
  progressLabel,
  headerLeft,
  headerCenter,
  headerRight,
  compactTitle = false,
  subtitle,
  question,
  signCode,
  imageUrl,
  choices,
  selected,
  validated,
  correctIndex,
  onSelect,
  onValidate,
  onNext,
  isLastQuestion,
  lastLabel,
  sidebar,
  leftPanel,
  explanation,
  shakeWrong,
  questionId,
  questionKey,
}: QuizLayoutProps) {
  const { t } = useLang();
  const isCorrect = selected === correctIndex;
  // 2 ou 3 réponses (81 % des questions) : on profite de la place pour
  // agrandir l'énoncé et les réponses. À 4, on garde la taille compacte.
  const ample = choices.length <= 3;
  // Image bord à bord : seulement si l'énoncé tient en ~3 lignes (96 % des
  // questions illustrées). Au-delà, elle garde sa marge pour que tout tienne.
  const grandeImage = ample && !validated && question.length <= 110;

  useEffect(() => {
    if (validated) {
      playSound(isCorrect ? 'correct' : 'wrong');
    }
  }, [validated, isCorrect]);

  // Remonte en haut à chaque NOUVELLE question (et au démarrage du quiz, ce
  // composant étant monté à ce moment-là) : sans ça, on reste scrollé en bas
  // après « Suivante » et on découvre les réponses avant même l'énoncé.
  // Volontairement PAS déclenché par `validated` : l'explication s'affiche sous
  // les choix, remonter la ferait manquer.
  // `instant` est obligatoire : globals.css impose scroll-behavior:smooth.
  // Mode focus : pendant une question, rien d'autre en bas de l'écran.
  // La barre de navigation, le bandeau Premium et la bulle de feedback
  // mangeaient ~230 px sur téléphone et poussaient « Question suivante »
  // derrière eux. On sort du quiz par la ✕ de l'en-tête.
  useEffect(() => {
    document.body.classList.add('quiz-focus');
    return () => {
      document.body.classList.remove('quiz-focus');
      document.documentElement.classList.remove('quiz-fige');
    };
  }, []);

  // Écran figé — mais SEULEMENT si tout tient. On mesure à chaque question,
  // à la validation, au chargement de l'image et au redimensionnement : si la
  // fin du contenu passe sous le bouton fixe, on laisse défiler. Une réponse
  // cachée sous le bouton et inaccessible serait bien pire qu'un défilement.
  const finContenuRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const verifierTient = useCallback(() => {
    const fin = finContenuRef.current, action = actionRef.current;
    if (!fin || !action) return;
    // +14 : on ignore la marge vide (mb-3) laissée sous le dernier bloc.
    const tient = fin.getBoundingClientRect().top <= action.getBoundingClientRect().top + 14;
    document.documentElement.classList.toggle('quiz-fige', tient);
  }, []);
  useEffect(() => {
    // le rétrécissement de l'image après validation dure 0,3 s
    const t1 = requestAnimationFrame(verifierTient);
    const t2 = setTimeout(verifierTient, 350);
    window.addEventListener('resize', verifierTient);
    return () => { cancelAnimationFrame(t1); clearTimeout(t2); window.removeEventListener('resize', verifierTient); };
  }, [verifierTient, questionKey, question, validated, choices.length]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [questionKey ?? question]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-30 px-4 lg:px-6 py-2 lg:py-3"
        style={{ background: 'var(--bg-blur)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="max-w-screen-xl mx-auto">
          <div className={`flex items-center gap-3 lg:gap-4 ${compactTitle ? 'lg:mb-2' : 'mb-2'}`}>
            {headerLeft}
            <div className={`flex-1 items-center justify-center gap-3 ${compactTitle ? 'hidden lg:flex' : 'flex'}`}>
              {headerCenter}
            </div>
            {/* Téléphone + compactTitle : la progression prend la place du titre */}
            {compactTitle && (
              <div className="flex-1 flex lg:hidden items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'var(--brand)' }} />
                </div>
                {progressLabel && (
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--brand)' }}>{progressLabel}</span>
                )}
              </div>
            )}
            {headerRight}
          </div>
          <div className={`items-center gap-3 ${compactTitle ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'var(--brand)' }}
              />
            </div>
            {progressLabel && (
              <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--brand)' }}>{progressLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── 2-column layout ── */}
      <div className="px-4 lg:px-6 pt-3 lg:pt-6 pb-6">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* ── Colonne de gauche optionnelle (grille de l'examen blanc) ──
              Desktop uniquement : sur mobile, 50 cases au-dessus de chaque
              question repousseraient l'énoncé hors de l'écran. */}
          {leftPanel && (
            <div className="hidden lg:block lg:w-40 xl:w-48 lg:flex-shrink-0 lg:order-first">
              <div className="sticky top-24">{leftPanel}</div>
            </div>
          )}

          {/* ── Left: Question + Answers (60%) ── */}
          <div className="flex-1 min-w-0 lg:flex-[3]">
            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-disabled)' }}>{subtitle}</p>
            )}

            {/* Sign image */}
            {!imageUrl && signCode && (
              <div className="flex justify-center mb-3 lg:mb-5">
                <div className="rounded-xl p-3 lg:p-4 flex items-center justify-center" style={{ background: 'var(--card-secondary)', border: '1px solid var(--border-subtle)' }}>
                  {/* Même logique que l'image : plus petit une fois la réponse donnée. */}
                  <span className="lg:hidden"><SignImage code={signCode} size={validated ? 84 : 148} /></span>
                  <span className="hidden lg:inline"><SignImage code={signCode} size={148} /></span>
                </div>
              </div>
            )}

            {/* Question */}
            {/* L'énoncé était en 24px face à des réponses en 14px. On resserre
                l'écart : c'est la comparaison des 4 propositions qui demande le
                plus d'attention, pas la relecture de la question. */}
            <p className={`${ample ? 'text-[21px]' : 'text-[19px]'} md:text-[22px] font-bold text-center mb-2 lg:mb-3 leading-snug max-w-2xl mx-auto fade-in-up`} style={{ color: 'var(--text-primary)' }}>{question}</p>

            {/* Illustration de situation — SOUS la question (on lit, puis on observe) */}
            {imageUrl && (
              // Téléphone, 2-3 réponses : l'image va d'un bord à l'autre de
              // l'écran (-mx-4 annule la marge latérale). Plus large, donc plus
              // haute, sans rien rogner de la scène.
              <div className={`flex justify-center mb-3 lg:mb-5 ${grandeImage ? '-mx-4 lg:mx-0' : ''}`}>
                {/* Sur téléphone, l'image se limite à 28 % de la hauteur d'écran :
                    grande sur un grand téléphone, plus compacte sur un petit —
                    pour que les réponses et le bouton restent visibles sans
                    scroller. La photo garde sa forme naturelle : plus de bandes
                    grises vides au-dessus et en dessous. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  // Après validation, l'image a fait son travail : elle se réduit
                  // en douceur pour laisser la place à l'explication, et tout
                  // reste à l'écran sans scroller, même avec 3 réponses longues.
                  className={`quiz-img ${validated ? 'quiz-img-valide max-h-[15vh] rounded-xl' : grandeImage ? 'max-h-[34vh] rounded-none lg:rounded-xl' : ample ? 'max-h-[28vh] rounded-xl' : 'quiz-img-quatre max-h-[22vh] rounded-xl'} w-auto max-w-full lg:max-h-none lg:w-full lg:max-w-lg`}
                  onLoad={verifierTient}
                  style={{ border: '1px solid var(--border-subtle)', height: 'auto', transition: 'max-height 0.3s ease' }}
                />
              </div>
            )}

            {/* Image request — juste sous la question, masqué si un panneau est déjà affiché */}
            {questionId && !signCode && !imageUrl && <ImageRequestButton id={questionId} />}

            {/* Answer grid */}
            {/* À 3 propositions, une seule colonne se lit mieux qu'un 2+1
                bancal — et c'est aussi la présentation de l'examen officiel. */}
            <div className={`grid gap-2 lg:gap-3 mb-3 lg:mb-5 ${choices.length > 3 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {choices.map((choice, i) => {
                let bg = 'var(--card-primary)';
                let border = '1px solid var(--border-subtle)';
                let textCol = 'var(--text-primary)';
                let labelBg = 'var(--card-secondary)';
                let labelCol = 'var(--text-primary)';
                let icon: string | null = null;

                if (validated) {
                  if (i === correctIndex) {
                    bg = 'rgba(46,204,113,0.12)';
                    border = '2px solid var(--success)';
                    textCol = 'var(--success)';
                    labelBg = 'var(--success)';
                    labelCol = '#ffffff';
                    icon = '✓';
                  } else if (i === selected) {
                    bg = 'rgba(231,76,60,0.12)';
                    border = '2px solid var(--error)';
                    textCol = 'var(--error)';
                    labelBg = 'var(--error)';
                    labelCol = '#ffffff';
                    icon = '✗';
                  }
                } else if (i === selected) {
                  bg = 'rgba(78,205,196,0.15)';
                  border = '2px solid var(--brand)';
                  labelBg = 'var(--brand)';
                  labelCol = 'var(--bg-primary)';
                  textCol = 'var(--text-primary)';
                }

                // Après validation, sur téléphone, on ne garde que ce qui compte :
                // la bonne réponse, et la sienne si elle était fausse. Les autres
                // propositions s'effacent — c'est ce qui permet à l'explication de
                // tenir à l'écran même avec 4 réponses longues. Ordinateur : tout reste.
                const effacee = validated && i !== correctIndex && i !== selected;

                return (
                  <button
                    key={i}
                    onClick={() => !validated && onSelect(i)}
                    disabled={validated}
                    className={`rounded-xl px-4 ${ample ? 'py-3.5' : 'py-3'} lg:p-5 ${effacee ? 'hidden lg:flex' : 'flex'} items-center gap-3 text-left press-scale ${
                      shakeWrong && validated && i === selected && i !== correctIndex ? 'shake' : ''
                    } ${validated && i === correctIndex ? 'correct-pulse' : ''
                    } ${validated && i === selected && i !== correctIndex ? 'wrong-flash' : ''}`}
                    // 80px de haut pour du texte de 14px laissait beaucoup de
                    // vide ; 64px avec un texte plus grand se lit mieux et rend
                    // ~64px d'écran sur les 4 réponses.
                    style={{ background: bg, border, minHeight: ample ? 58 : 52, cursor: validated ? 'default' : 'pointer', transition: 'background 0s, border-color 0s' }}
                    onMouseEnter={e => {
                      if (!validated && i !== selected) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(78,205,196,0.12)';
                        (e.currentTarget as HTMLButtonElement).style.border = '1px solid var(--brand)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!validated && i !== selected) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--card-primary)';
                        (e.currentTarget as HTMLButtonElement).style.border = '1px solid var(--border-subtle)';
                      }
                    }}
                  >
                    <div
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: labelBg, color: labelCol }}
                    >
                      {icon || CHOICE_LABELS[i]}
                    </div>
                    <span className={`flex-1 ${ample ? 'text-[16.5px]' : 'text-[15px]'} md:text-base font-semibold leading-snug`} style={{ color: textCol }}>
                      {choice}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* XP float particle on correct */}
            {validated && isCorrect && (
              <div className="relative flex justify-center pointer-events-none" style={{ height: 0 }}>
                <span className="absolute xp-float-particle text-lg font-black" style={{ color: 'var(--premium)', top: -20 }}>
                  +10 ✨
                </span>
              </div>
            )}

            {/* Explication après validation.
                Plus de titre « 🎉 Correct ! » : les réponses viennent déjà de
                se colorer (vert ✓ pour la bonne, rouge ✗ pour la tienne), le
                titre répétait l'information et coûtait une ligne. Il reste le
                cadre coloré, et un petit tampon ✓ / ✗ posé sur le coin. */}
            {validated && (
              <div
                role="status"
                aria-label={isCorrect ? t('correct') : t('incorrect')}
                className="relative rounded-xl px-4 py-3 lg:p-5 mb-3 lg:mb-5 feedback-slide"
                style={{
                  background: isCorrect ? 'rgba(46,204,113,0.10)' : 'rgba(231,76,60,0.10)',
                  border: `1.5px solid ${isCorrect ? 'rgba(46,204,113,0.4)' : 'rgba(231,76,60,0.4)'}`,
                }}
              >
                <span
                  aria-hidden
                  className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black"
                  style={{
                    background: isCorrect ? 'var(--success)' : 'var(--error)',
                    color: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                  }}
                >
                  {isCorrect ? '✓' : '✗'}
                </span>
                {/* Filet de sécurité : si une explication était exceptionnellement
                    longue, c'est ce cadre qui défile — jamais l'écran. */}
                <p className="text-sm leading-relaxed max-h-[24vh] overflow-y-auto lg:max-h-none" style={{ color: 'var(--text-secondary)' }}>
                  {explanation || (isCorrect ? t('correct') : t('incorrect'))}
                </p>
              </div>
            )}

            {/* Repère de fin du contenu : sert à vérifier que tout tient. */}
            <div ref={finContenuRef} aria-hidden />

            {/* Réserve la place du bouton fixe, pour que rien ne passe dessous. */}
            <div className="h-20 lg:hidden" aria-hidden />

            {/* Bouton d'action — fixé en bas de l'écran sur téléphone : il reste
                visible quelle que soit la longueur de l'explication, qui défile
                derrière lui. Sur ordinateur, il reprend sa place dans le flux. */}
            <div
              ref={actionRef}
              className="fixed bottom-0 left-0 right-0 z-30 px-4 pt-3 lg:static lg:px-0 lg:pt-0"
              style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-page) 30%)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
            >
              {!validated ? (
                <button
                  onClick={onValidate}
                  disabled={selected === null}
                  className="w-full py-3 lg:py-4 rounded-xl font-black text-base press-scale btn-glow-teal"
                  style={{
                    background: 'var(--brand)',
                    color: 'var(--bg-primary)',
                    cursor: selected !== null ? 'pointer' : 'not-allowed',
                    opacity: selected !== null ? 1 : 0.35,
                  }}
                >
                  {t('valider')}
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="w-full py-3 lg:py-4 rounded-xl font-black text-base press-scale btn-glow-green"
                  style={{ background: 'var(--success)', color: '#ffffff' }}
                >
                  {isLastQuestion ? (lastLabel ?? t('voir_resultats')) : t('question_suivante')}
                </button>
              )}
            </div>
          </div>

          {/* ── Right sidebar (40%) — desktop only ── */}
          {sidebar && (
            <div className="hidden lg:block lg:flex-[2] lg:max-w-[280px] xl:max-w-[380px]">
              <div className="sticky top-20 flex flex-col gap-5">
                {sidebar}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
