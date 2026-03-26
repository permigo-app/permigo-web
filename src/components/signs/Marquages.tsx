'use client';

/** Road markings (marquages au sol) — SVG components */

interface Props { size?: number }

export function LigneContinue({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#505050" />
      <rect x="48" y="5" width="4" height="90" rx="1" fill="#FFFFFF" />
      <rect x="15" y="85" width="70" height="2" rx="1" fill="#666" opacity={0.3} />
    </svg>
  );
}

export function LigneDiscontinue({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#505050" />
      {[8, 24, 40, 56, 72, 88].map((y) => (
        <rect key={y} x="48" y={y} width="4" height="10" rx="1" fill="#FFFFFF" />
      ))}
    </svg>
  );
}

export function DoubleContinue({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#505050" />
      <rect x="44" y="5" width="4" height="90" rx="1" fill="#FFFFFF" />
      <rect x="52" y="5" width="4" height="90" rx="1" fill="#FFFFFF" />
    </svg>
  );
}

export function LigneMixte({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#505050" />
      <rect x="44" y="5" width="4" height="90" rx="1" fill="#FFFFFF" />
      {[8, 24, 40, 56, 72, 88].map((y) => (
        <rect key={y} x="52" y={y} width="4" height="10" rx="1" fill="#FFFFFF" />
      ))}
    </svg>
  );
}

export function MarquageStop({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#505050" />
      <rect x="10" y="55" width="80" height="5" rx="1" fill="#FFFFFF" />
      <text x="50" y="45" textAnchor="middle" fontSize="18" fontWeight="900" fill="#FFFFFF" fontFamily="Arial">STOP</text>
      {[15, 35, 55, 75].map((x) => (
        <rect key={x} x={x} y="65" width="4" height="10" rx="1" fill="#FFFFFF" opacity={0.5} />
      ))}
    </svg>
  );
}

export function MarquageCedez({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#505050" />
      <polygon points="50,25 25,65 75,65" fill="none" stroke="#FFFFFF" strokeWidth="4" />
      {[15, 35, 55, 75].map((x) => (
        <rect key={x} x={x} y="75" width="4" height="10" rx="1" fill="#FFFFFF" opacity={0.5} />
      ))}
    </svg>
  );
}

export function Zebras({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#505050" />
      {[15, 27, 39, 51, 63, 75].map((x) => (
        <rect key={x} x={x} y="20" width="8" height="60" rx="1" fill="#FFFFFF" />
      ))}
    </svg>
  );
}

export function Chevrons({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#505050" />
      {[20, 40, 60, 80].map((y) => (
        <g key={y}>
          <line x1="30" y1={y} x2="50" y2={y - 12} stroke="#FFFFFF" strokeWidth="3" />
          <line x1="50" y1={y - 12} x2="70" y2={y} stroke="#FFFFFF" strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}

export function Damier({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#505050" />
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          (row + col) % 2 === 0 && (
            <rect key={`${row}-${col}`} x={20 + col * 12} y={20 + row * 12} width="12" height="12" fill="#FFFFFF" />
          )
        ))
      )}
    </svg>
  );
}
