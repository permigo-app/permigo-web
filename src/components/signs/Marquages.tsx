'use client';

/**
 * Marquages au sol — icônes vectorielles.
 *
 * Toutes partagent le même gabarit : une case d'asphalte 100×100, vue du
 * dessus, et de la peinture blanche qui occupe largement le cadre. Un seul
 * gris d'asphalte pour les onze (l'ancienne version en mélangeait deux) et
 * aucun mot écrit : le site est bilingue, un mot gravé ne se traduit pas.
 */

interface Props { size?: number }

const ASPHALTE = '#3A3F45';
const BORD = '#2B2F34';
const PEINTURE = '#F5F7FA';

function Case({ children, size = 80 }: Props & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="10" fill={ASPHALTE} />
      <rect x="0.75" y="0.75" width="98.5" height="98.5" rx="9.25" fill="none" stroke={BORD} strokeWidth="1.5" />
      {children}
    </svg>
  );
}

export function LigneContinue({ size = 80 }: Props) {
  return (
    <Case size={size}>
      <rect x="46" y="8" width="8" height="84" rx="2" fill={PEINTURE} />
    </Case>
  );
}

export function LigneDiscontinue({ size = 80 }: Props) {
  return (
    <Case size={size}>
      {[9, 30, 51, 72].map(y => (
        <rect key={y} x="46" y={y} width="8" height="13" rx="2" fill={PEINTURE} />
      ))}
    </Case>
  );
}

export function DoubleContinue({ size = 80 }: Props) {
  return (
    <Case size={size}>
      <rect x="38" y="8" width="8" height="84" rx="2" fill={PEINTURE} />
      <rect x="54" y="8" width="8" height="84" rx="2" fill={PEINTURE} />
    </Case>
  );
}

/** Continue d'un côté, discontinue de l'autre : c'est la ligne la plus proche qui compte. */
export function LigneMixte({ size = 80 }: Props) {
  return (
    <Case size={size}>
      <rect x="38" y="8" width="8" height="84" rx="2" fill={PEINTURE} />
      {[9, 30, 51, 72].map(y => (
        <rect key={y} x="54" y={y} width="8" height="13" rx="2" fill={PEINTURE} />
      ))}
    </Case>
  );
}

/**
 * Ligne d'arrêt du STOP : une LARGE bande blanche continue en travers de la
 * bande. L'ancienne version peignait le mot « STOP » au sol — ce mot n'est
 * pas un marquage belge, et il ne se traduirait pas en néerlandais.
 */
export function MarquageStop({ size = 80 }: Props) {
  return (
    <Case size={size}>
      <rect x="8" y="42" width="84" height="16" rx="2" fill={PEINTURE} />
    </Case>
  );
}

/**
 * Cédez le passage : les « dents de requin », une rangée de TRIANGLES blancs
 * pointant vers le conducteur. L'ancienne version dessinait un grand triangle
 * creux, ce qui ne correspond à aucun marquage réel — et l'énoncé de la
 * question parle bien de « triangles blancs peints en travers de la bande ».
 */
export function MarquageCedez({ size = 80 }: Props) {
  return (
    <Case size={size}>
      {[12, 30, 48, 66].map(x => (
        <polygon key={x} points={`${x},40 ${x + 22},40 ${x + 11},66`} fill={PEINTURE} />
      ))}
    </Case>
  );
}

/** Passage pour piétons. */
export function Zebras({ size = 80 }: Props) {
  return (
    <Case size={size}>
      {[13, 28, 43, 58, 73].map(x => (
        <rect key={x} x={x} y="16" width="10" height="68" rx="1.5" fill={PEINTURE} />
      ))}
    </Case>
  );
}

/** Zone hachurée interdite à la circulation et au stationnement. */
export function Chevrons({ size = 80 }: Props) {
  return (
    <Case size={size}>
      <defs>
        <clipPath id="zoneHachuree">
          <rect x="24" y="14" width="52" height="72" rx="2" />
        </clipPath>
      </defs>
      <rect x="22" y="12" width="56" height="76" rx="3" fill="none" stroke={PEINTURE} strokeWidth="4" />
      <g clipPath="url(#zoneHachuree)">
        {[14, 30, 46, 62, 78, 94, 110].map(y => (
          <line key={y} x1="20" y1={y} x2="80" y2={y - 32} stroke={PEINTURE} strokeWidth="3.5" />
        ))}
      </g>
    </Case>
  );
}

/** Damier : zone tampon entre deux bandes, interdite à la circulation. */
export function Damier({ size = 80 }: Props) {
  const cases: { x: number; y: number }[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 4; c++) {
      if ((r + c) % 2 === 0) cases.push({ x: 18 + c * 16, y: 12 + r * 15 });
    }
  }
  return (
    <Case size={size}>
      {cases.map(k => (
        <rect key={`${k.x}-${k.y}`} x={k.x} y={k.y} width="16" height="15" fill={PEINTURE} />
      ))}
    </Case>
  );
}

/** Flèche de sélection de voie — obligation de tourner à gauche. */
export function FlecheSolGauche({ size = 80 }: Props) {
  return (
    <Case size={size}>
      <path
        d="M42 92 L54 92 L54 58 L24 58 L24 68 L8 52 L24 36 L24 46 L42 46 Z"
        fill={PEINTURE}
      />
    </Case>
  );
}

/** Flèche de sélection de voie — obligation de continuer tout droit. */
export function FlecheSolToutDroit({ size = 80 }: Props) {
  return (
    <Case size={size}>
      <path d="M43 90 L43 38 L28 38 L50 10 L72 38 L57 38 L57 90 Z" fill={PEINTURE} />
    </Case>
  );
}
