'use client';

/** Parking / stationnement signs — SVG components */

interface Props { size?: number }

/** E1 — Stationnement autorisé (P blanc sur fond bleu) */
export function E1({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#2E5FA1" stroke="#1A3F6F" strokeWidth="3" />
      <rect x="5" y="5" width="90" height="90" rx="5" fill="none" stroke="white" strokeWidth="2" />
      <text x="50" y="72" textAnchor="middle" fontSize="60" fontWeight="900" fill="white" fontFamily="Arial">P</text>
    </svg>
  );
}

/** E3 — Stationnement alterné semi-mensuel (P avec dates) */
export function E3({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#2E5FA1" stroke="#1A3F6F" strokeWidth="3" />
      <rect x="5" y="5" width="90" height="90" rx="5" fill="none" stroke="white" strokeWidth="2" />
      <text x="50" y="58" textAnchor="middle" fontSize="42" fontWeight="900" fill="white" fontFamily="Arial">P</text>
      <line x1="20" y1="66" x2="80" y2="66" stroke="white" strokeWidth="1.5" />
      <text x="35" y="82" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="Arial">1-15</text>
      <text x="65" y="82" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="Arial">16-31</text>
      <line x1="50" y1="68" x2="50" y2="88" stroke="white" strokeWidth="1" />
    </svg>
  );
}

/** E5 — Zone bleue / stationnement à durée limitée avec disque */
export function E5({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#2E5FA1" stroke="#1A3F6F" strokeWidth="3" />
      <rect x="5" y="5" width="90" height="90" rx="5" fill="none" stroke="white" strokeWidth="2" />
      <text x="50" y="52" textAnchor="middle" fontSize="38" fontWeight="900" fill="white" fontFamily="Arial">P</text>
      {/* Disque de stationnement */}
      <rect x="30" y="58" width="40" height="30" rx="3" fill="white" />
      <rect x="33" y="61" width="34" height="10" rx="1" fill="#2E5FA1" />
      <text x="50" y="69" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" fontFamily="Arial">ZONE</text>
      <line x1="50" y1="74" x2="50" y2="80" stroke="#333" strokeWidth="1.5" />
      <line x1="50" y1="74" x2="55" y2="77" stroke="#333" strokeWidth="1.5" />
      <circle cx="50" cy="74" r="1.5" fill="#333" />
    </svg>
  );
}

/** E7 — Stationnement payant */
export function E7({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#2E5FA1" stroke="#1A3F6F" strokeWidth="3" />
      <rect x="5" y="5" width="90" height="90" rx="5" fill="none" stroke="white" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fontSize="42" fontWeight="900" fill="white" fontFamily="Arial">P</text>
      <rect x="18" y="64" width="64" height="20" rx="3" fill="white" />
      <text x="50" y="79" textAnchor="middle" fontSize="13" fontWeight="900" fill="#2E5FA1" fontFamily="Arial">PAYANT</text>
    </svg>
  );
}

/** E9a — Parking (P avec symbole voiture) */
export function E9a({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#2E5FA1" stroke="#1A3F6F" strokeWidth="3" />
      <rect x="5" y="5" width="90" height="90" rx="5" fill="none" stroke="white" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fontSize="42" fontWeight="900" fill="white" fontFamily="Arial">P</text>
      {/* Petite voiture */}
      <rect x="32" y="68" width="36" height="14" rx="4" fill="white" />
      <rect x="38" y="62" width="24" height="10" rx="3" fill="white" />
      <circle cx="40" cy="82" r="3.5" fill="white" />
      <circle cx="40" cy="82" r="1.5" fill="#2E5FA1" />
      <circle cx="60" cy="82" r="3.5" fill="white" />
      <circle cx="60" cy="82" r="1.5" fill="#2E5FA1" />
    </svg>
  );
}

/** E9b — Parking relais P+R */
export function E9b({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#2E5FA1" stroke="#1A3F6F" strokeWidth="3" />
      <rect x="5" y="5" width="90" height="90" rx="5" fill="none" stroke="white" strokeWidth="2" />
      <text x="50" y="68" textAnchor="middle" fontSize="48" fontWeight="900" fill="white" fontFamily="Arial">P+R</text>
    </svg>
  );
}

/** E9c — Stationnement réservé handicapés */
export function E9c({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx="8" fill="#2E5FA1" stroke="#1A3F6F" strokeWidth="3" />
      <rect x="5" y="5" width="90" height="90" rx="5" fill="none" stroke="white" strokeWidth="2" />
      <text x="50" y="45" textAnchor="middle" fontSize="32" fontWeight="900" fill="white" fontFamily="Arial">P</text>
      {/* Symbole handicapé simplifié */}
      <circle cx="50" cy="58" r="4" fill="white" />
      <line x1="50" y1="62" x2="50" y2="74" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="66" x2="43" y2="70" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="66" x2="57" y2="70" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M46 74 Q46 84, 54 84 Q62 84, 62 76" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="46" cy="80" r="5" fill="none" stroke="white" strokeWidth="2" />
    </svg>
  );
}

/** E1_interdit — Stationnement interdit (C37 style - rond bleu, barre rouge) */
export function StationnementInterdit({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#2E5FA1" stroke="#CC0000" strokeWidth="6" />
      <circle cx="50" cy="50" r="35" fill="#2E5FA1" />
      <line x1="20" y1="20" x2="80" y2="80" stroke="#CC0000" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/** E3_interdit — Arrêt et stationnement interdits (C39 style - rond bleu, X rouge) */
export function ArretStationnementInterdit({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#2E5FA1" stroke="#CC0000" strokeWidth="6" />
      <circle cx="50" cy="50" r="35" fill="#2E5FA1" />
      <line x1="20" y1="20" x2="80" y2="80" stroke="#CC0000" strokeWidth="6" strokeLinecap="round" />
      <line x1="80" y1="20" x2="20" y2="80" stroke="#CC0000" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
