'use client';

/**
 * Feux de signalisation — icônes vectorielles.
 *
 * Refonte : l'ancien gabarit laissait le boîtier flotter au milieu d'un cadre
 * deux fois trop large, les lentilles éteintes se confondaient avec le corps
 * et le halo n'était qu'un disque plus clair. Ici le boîtier occupe tout le
 * cadre, les lentilles sont grandes, et une lentille allumée porte un vrai
 * halo plus un reflet — elle se distingue d'une lentille éteinte d'un seul
 * coup d'œil, même affichée petit.
 */

interface Props { size?: number }

const CORPS = '#15181C';
const CONTOUR = '#2F343B';
const ETEINTE = '#23272C';
const CERNE = '#30363E';
const SOCLE = '#434A53';

const ROUGE = '#E8242B';
const ORANGE = '#F3A312';
const VERT = '#0FBF5A';
const BLANC = '#F2F5F8';

/** Boîtier vertical. `lentilles` = nombre de feux, pour ajuster la hauteur. */
function Boitier({ children, size = 80, lentilles = 3 }: Props & { children: React.ReactNode; lentilles?: number }) {
  const h = 22 + lentilles * 38;
  return (
    <svg width={size} height={size} viewBox={`0 0 62 ${h + 10}`}>
      <rect x="3" y="3" width="56" height={h} rx="11" fill={CORPS} stroke={CONTOUR} strokeWidth="2.5" />
      {children}
      <rect x="26" y={h + 2} width="10" height="8" rx="2" fill={SOCLE} />
    </svg>
  );
}

/** Centre vertical de la lentille n° i (0 en haut). */
const cy = (i: number) => 34 + i * 38;

function Eteinte({ i }: { i: number }) {
  return (
    <>
      <circle cx="31" cy={cy(i)} r="16" fill={ETEINTE} />
      <circle cx="31" cy={cy(i)} r="16" fill="none" stroke={CERNE} strokeWidth="1.5" />
    </>
  );
}

function Allumee({ i, couleur }: { i: number; couleur: string }) {
  return (
    <>
      <circle cx="31" cy={cy(i)} r="22" fill={couleur} opacity={0.17} />
      <circle cx="31" cy={cy(i)} r="16" fill={couleur} />
      <circle cx="26" cy={cy(i) - 5} r="5.5" fill="#FFFFFF" opacity={0.3} />
    </>
  );
}

export function FeuTricolore({ size = 80 }: Props) {
  return (
    <Boitier size={size}>
      <Allumee i={0} couleur={ROUGE} />
      <Allumee i={1} couleur={ORANGE} />
      <Allumee i={2} couleur={VERT} />
    </Boitier>
  );
}

export function FeuRouge({ size = 80 }: Props) {
  return (
    <Boitier size={size}>
      <Allumee i={0} couleur={ROUGE} />
      <Eteinte i={1} />
      <Eteinte i={2} />
    </Boitier>
  );
}

export function FeuOrange({ size = 80 }: Props) {
  return (
    <Boitier size={size}>
      <Eteinte i={0} />
      <Allumee i={1} couleur={ORANGE} />
      <Eteinte i={2} />
    </Boitier>
  );
}

export function FeuVert({ size = 80 }: Props) {
  return (
    <Boitier size={size}>
      <Eteinte i={0} />
      <Eteinte i={1} />
      <Allumee i={2} couleur={VERT} />
    </Boitier>
  );
}

/** Orange CLIGNOTANT : des traits rayonnants le distinguent de l'orange fixe. */
export function FeuClignotant({ size = 80 }: Props) {
  const y = cy(1);
  return (
    <Boitier size={size}>
      <Eteinte i={0} />
      <Allumee i={1} couleur={ORANGE} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={31 + Math.cos(r) * 24} y1={y + Math.sin(r) * 24}
            x2={31 + Math.cos(r) * 29} y2={y + Math.sin(r) * 29}
            stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" opacity={0.85}
          />
        );
      })}
      <Eteinte i={2} />
    </Boitier>
  );
}

/** Flèche verte : le passage n'est autorisé que dans la direction indiquée. */
export function FeuFlecheVerte({ size = 80 }: Props) {
  const y = cy(2);
  return (
    <Boitier size={size}>
      <Eteinte i={0} />
      <Eteinte i={1} />
      <circle cx="31" cy={y} r="22" fill={VERT} opacity={0.17} />
      <circle cx="31" cy={y} r="16" fill={CORPS} />
      <circle cx="31" cy={y} r="16" fill="none" stroke={VERT} strokeWidth="1.5" opacity={0.5} />
      <path
        d={`M22 ${y} L33 ${y} L33 ${y - 7} L42 ${y} L33 ${y + 7} L33 ${y} Z`}
        fill={VERT}
      />
      <rect x="22" y={y - 2.5} width="12" height="5" rx="1" fill={VERT} />
    </Boitier>
  );
}

/** Silhouette de piéton, debout (rouge) ou en marche (vert). */
function Pieton({ y, couleur, marche }: { y: number; couleur: string; marche: boolean }) {
  return (
    <g fill={couleur} stroke={couleur} strokeWidth="2.6" strokeLinecap="round">
      <circle cx="31" cy={y - 10} r="3.6" stroke="none" />
      <line x1="31" y1={y - 6} x2="31" y2={y + 2} />
      {marche ? (
        <>
          <line x1="31" y1={y - 3} x2="25" y2={y + 1} />
          <line x1="31" y1={y - 3} x2="37" y2={y - 6} />
          <line x1="31" y1={y + 2} x2="25" y2={y + 10} />
          <line x1="31" y1={y + 2} x2="38" y2={y + 8} />
        </>
      ) : (
        <>
          <line x1="31" y1={y - 3} x2="26" y2={y + 2} />
          <line x1="31" y1={y - 3} x2="36" y2={y + 2} />
          <line x1="31" y1={y + 2} x2="28" y2={y + 10} />
          <line x1="31" y1={y + 2} x2="34" y2={y + 10} />
        </>
      )}
    </g>
  );
}

export function FeuPietonRouge({ size = 80 }: Props) {
  return (
    <Boitier size={size} lentilles={2}>
      <circle cx="31" cy={cy(0)} r="22" fill={ROUGE} opacity={0.15} />
      <circle cx="31" cy={cy(0)} r="16" fill={CORPS} stroke={ROUGE} strokeWidth="1.5" />
      <Pieton y={cy(0)} couleur={ROUGE} marche={false} />
      <Eteinte i={1} />
    </Boitier>
  );
}

export function FeuPietonVert({ size = 80 }: Props) {
  return (
    <Boitier size={size} lentilles={2}>
      <Eteinte i={0} />
      <circle cx="31" cy={cy(1)} r="22" fill={VERT} opacity={0.15} />
      <circle cx="31" cy={cy(1)} r="16" fill={CORPS} stroke={VERT} strokeWidth="1.5" />
      <Pieton y={cy(1)} couleur={VERT} marche />
    </Boitier>
  );
}

/** Silhouette de vélo. */
function Velo({ y, couleur }: { y: number; couleur: string }) {
  return (
    <g fill="none" stroke={couleur} strokeWidth="2.2" strokeLinecap="round">
      <circle cx="23" cy={y + 4} r="5.5" />
      <circle cx="39" cy={y + 4} r="5.5" />
      <path d={`M23 ${y + 4} L29 ${y - 4} L36 ${y - 4} L39 ${y + 4}`} />
      <line x1="29" y1={y - 4} x2="33" y2={y + 4} />
      <line x1="33" y1={y - 7} x2="38" y2={y - 7} />
    </g>
  );
}

export function FeuVeloRouge({ size = 80 }: Props) {
  return (
    <Boitier size={size} lentilles={2}>
      <circle cx="31" cy={cy(0)} r="22" fill={ROUGE} opacity={0.15} />
      <circle cx="31" cy={cy(0)} r="16" fill={CORPS} stroke={ROUGE} strokeWidth="1.5" />
      <Velo y={cy(0)} couleur={ROUGE} />
      <Eteinte i={1} />
    </Boitier>
  );
}

export function FeuVeloVert({ size = 80 }: Props) {
  return (
    <Boitier size={size} lentilles={2}>
      <Eteinte i={0} />
      <circle cx="31" cy={cy(1)} r="22" fill={VERT} opacity={0.15} />
      <circle cx="31" cy={cy(1)} r="16" fill={CORPS} stroke={VERT} strokeWidth="1.5" />
      <Velo y={cy(1)} couleur={VERT} />
    </Boitier>
  );
}

/** Panneau de voie (portique autoroutier) : croix rouge = voie fermée. */
export function CroixRougeVoie({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="3" y="3" width="94" height="94" rx="12" fill={CORPS} stroke={CONTOUR} strokeWidth="3" />
      <line x1="30" y1="30" x2="70" y2="70" stroke={ROUGE} strokeWidth="11" strokeLinecap="round" />
      <line x1="70" y1="30" x2="30" y2="70" stroke={ROUGE} strokeWidth="11" strokeLinecap="round" />
    </svg>
  );
}

/** Panneau de voie : flèche verte = voie ouverte. */
export function FlecheVerteVoie({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="3" y="3" width="94" height="94" rx="12" fill={CORPS} stroke={CONTOUR} strokeWidth="3" />
      <path d="M50 76 L50 44 L34 44 L50 22 L66 44 L50 44 Z" fill={VERT} />
      <rect x="44" y="44" width="12" height="32" rx="2" fill={VERT} />
    </svg>
  );
}

/**
 * Signal réservé aux trams et aux bus : des barres BLANCHES, jamais des
 * couleurs — c'est précisément ce qui le distingue d'un feu ordinaire.
 */
export function FeuTram({ size = 80 }: Props) {
  return (
    <Boitier size={size} lentilles={3}>
      <circle cx="31" cy={cy(0)} r="16" fill={ETEINTE} stroke={CERNE} strokeWidth="1.5" />
      <rect x="18" y={cy(0) - 3} width="26" height="6" rx="2" fill={BLANC} />
      <circle cx="31" cy={cy(1)} r="16" fill={ETEINTE} stroke={CERNE} strokeWidth="1.5" />
      <rect x="28" y={cy(1) - 13} width="6" height="26" rx="2" fill={BLANC} />
      <circle cx="31" cy={cy(2)} r="16" fill={ETEINTE} stroke={CERNE} strokeWidth="1.5" />
      <circle cx="31" cy={cy(2)} r="5" fill={BLANC} />
    </Boitier>
  );
}
