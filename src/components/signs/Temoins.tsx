'use client';

/** Dashboard indicator lights (témoins tableau de bord) — SVG components */

interface Props { size?: number }

function DashPanel({ children, size = 80 }: Props & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <rect width="80" height="80" rx="10" fill="#1C1C1C" />
      <rect x="3" y="3" width="74" height="74" rx="8" fill="#111" stroke="#333" strokeWidth="1" />
      {children}
    </svg>
  );
}

export function TemoinVeilleuses({ size = 80 }: Props) {
  return (
    <DashPanel size={size}>
      {/* Headlight icon — green for position lights */}
      <ellipse cx="40" cy="40" rx="14" ry="12" fill="none" stroke="#00CC00" strokeWidth="2.5" />
      <line x1="26" y1="34" x2="16" y2="30" stroke="#00CC00" strokeWidth="2" />
      <line x1="26" y1="40" x2="14" y2="40" stroke="#00CC00" strokeWidth="2" />
      <line x1="26" y1="46" x2="16" y2="50" stroke="#00CC00" strokeWidth="2" />
      <text x="40" y="67" textAnchor="middle" fontSize="8" fill="#666" fontFamily="Arial">VEILLEUSES</text>
    </DashPanel>
  );
}

export function TemoinCroisement({ size = 80 }: Props) {
  return (
    <DashPanel size={size}>
      {/* Dipped beam — green, lines go down */}
      <ellipse cx="40" cy="38" rx="14" ry="12" fill="none" stroke="#00CC00" strokeWidth="2.5" />
      <line x1="26" y1="34" x2="14" y2="38" stroke="#00CC00" strokeWidth="2" />
      <line x1="26" y1="40" x2="14" y2="44" stroke="#00CC00" strokeWidth="2" />
      <line x1="26" y1="46" x2="14" y2="50" stroke="#00CC00" strokeWidth="2" />
      <text x="40" y="67" textAnchor="middle" fontSize="7" fill="#666" fontFamily="Arial">CROISEMENT</text>
    </DashPanel>
  );
}

export function TemoinRoute({ size = 80 }: Props) {
  return (
    <DashPanel size={size}>
      {/* Full beam — blue, lines go straight */}
      <ellipse cx="40" cy="38" rx="14" ry="12" fill="none" stroke="#3399FF" strokeWidth="2.5" />
      <line x1="26" y1="32" x2="12" y2="32" stroke="#3399FF" strokeWidth="2" />
      <line x1="26" y1="38" x2="12" y2="38" stroke="#3399FF" strokeWidth="2" />
      <line x1="26" y1="44" x2="12" y2="44" stroke="#3399FF" strokeWidth="2" />
      <line x1="26" y1="50" x2="12" y2="50" stroke="#3399FF" strokeWidth="2" />
      <text x="40" y="67" textAnchor="middle" fontSize="8" fill="#666" fontFamily="Arial">ROUTE</text>
    </DashPanel>
  );
}

export function TemoinBrouillardAvant({ size = 80 }: Props) {
  return (
    <DashPanel size={size}>
      {/* Front fog light — green, wavy line through beam */}
      <ellipse cx="42" cy="38" rx="14" ry="12" fill="none" stroke="#00CC00" strokeWidth="2.5" />
      <line x1="28" y1="32" x2="14" y2="36" stroke="#00CC00" strokeWidth="2" />
      <line x1="28" y1="38" x2="14" y2="42" stroke="#00CC00" strokeWidth="2" />
      <line x1="28" y1="44" x2="14" y2="48" stroke="#00CC00" strokeWidth="2" />
      {/* Wavy fog line */}
      <path d="M12 38 Q16 34, 20 38 Q24 42, 28 38" fill="none" stroke="#00CC00" strokeWidth="1.5" opacity={0.6} />
      <text x="40" y="67" textAnchor="middle" fontSize="6.5" fill="#666" fontFamily="Arial">BROUILLARD</text>
    </DashPanel>
  );
}
