'use client';

/**
 * Témoins de tableau de bord — symboles ISO.
 *
 * L'ancienne version écrivait le NOM du témoin sous l'icône (« VEILLEUSES »,
 * « ROUTE »…). Deux problèmes : le mot donnait la réponse de la question qui
 * s'appuie dessus, et il était en français sur un site bilingue. Plus aucun
 * mot ici — c'est la forme qui doit se reconnaître, comme sur un vrai
 * tableau de bord.
 *
 * Les quatre symboles se distinguent par trois signes, et par rien d'autre :
 *   · la COULEUR   — vert pour tout, SAUF les feux de route qui sont bleus ;
 *   · l'INCLINAISON des traits — descendants pour les codes, horizontaux
 *     pour les feux de route ;
 *   · la forme du corps — deux demi-lampes dos à dos pour les veilleuses,
 *     une seule lampe pour les autres ; une onde verticale pour l'antibrouillard.
 */

interface Props { size?: number }

const PANNEAU = '#14161A';
const CONTOUR = '#2A2E34';
const VERT = '#22C55E';
const BLEU = '#3B82F6';

function Tableau({ children, size = 80 }: Props & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="12" fill={PANNEAU} />
      <rect x="2" y="2" width="96" height="96" rx="10" fill="none" stroke={CONTOUR} strokeWidth="2" />
      {children}
    </svg>
  );
}

/** Corps de lampe : un « D » dont la panse regarde à gauche, comme sur un vrai témoin. */
function Lampe({ couleur }: { couleur: string }) {
  return (
    <path
      d="M68 26 L68 74 L58 74 C 42 74, 34 63, 34 50 C 34 37, 42 26, 58 26 Z"
      fill={couleur}
    />
  );
}

/** Traits du faisceau, partant de la lampe vers la gauche. `pente` en unités verticales. */
function Faisceau({ couleur, pente }: { couleur: string; pente: number }) {
  return (
    <g stroke={couleur} strokeWidth="5" strokeLinecap="round">
      {[32, 43, 54, 65].map(y => (
        <line key={y} x1="28" y1={y} x2="8" y2={y + pente} />
      ))}
    </g>
  );
}

/**
 * Feux de position (veilleuses) : deux demi-lampes dos à dos, traits des
 * DEUX côtés. C'est la forme qui le distingue des trois autres — l'ancienne
 * version dessinait une lampe unique, impossible à différencier des codes.
 */
export function TemoinVeilleuses({ size = 80 }: Props) {
  return (
    <Tableau size={size}>
      <path d="M46 28 L46 72 L40 72 C 28 72, 22 62, 22 50 C 22 38, 28 28, 40 28 Z" fill={VERT} />
      <path d="M54 28 L54 72 L60 72 C 72 72, 78 62, 78 50 C 78 38, 72 28, 60 28 Z" fill={VERT} />
      <g stroke={VERT} strokeWidth="4.5" strokeLinecap="round">
        {[38, 50, 62].map(y => <line key={`g${y}`} x1="17" y1={y} x2="5" y2={y} />)}
        {[38, 50, 62].map(y => <line key={`d${y}`} x1="83" y1={y} x2="95" y2={y} />)}
      </g>
    </Tableau>
  );
}

/** Feux de croisement (codes) : VERT, faisceau incliné vers le BAS. */
export function TemoinCroisement({ size = 80 }: Props) {
  return (
    <Tableau size={size}>
      <Lampe couleur={VERT} />
      <Faisceau couleur={VERT} pente={11} />
    </Tableau>
  );
}

/** Feux de route (phares) : BLEU, faisceau HORIZONTAL. La couleur suffit à les reconnaître. */
export function TemoinRoute({ size = 80 }: Props) {
  return (
    <Tableau size={size}>
      <Lampe couleur={BLEU} />
      <Faisceau couleur={BLEU} pente={0} />
    </Tableau>
  );
}

/**
 * Antibrouillard avant : VERT, faisceau horizontal TRAVERSÉ par une onde
 * verticale. L'ancienne version posait une ondulation pâle par-dessus les
 * traits, presque invisible — c'est pourtant le seul signe qui le distingue
 * des feux de croisement.
 */
export function TemoinBrouillardAvant({ size = 80 }: Props) {
  return (
    <Tableau size={size}>
      <Lampe couleur={VERT} />
      <Faisceau couleur={VERT} pente={0} />
      <path
        d="M18 22 C 26 32, 10 42, 18 52 C 26 62, 10 72, 18 82"
        fill="none"
        stroke={VERT}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </Tableau>
  );
}
