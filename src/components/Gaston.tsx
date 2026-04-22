'use client';

import Image from 'next/image';

type GastonExpression = 'happy' | 'encouraging' | 'unhappy' | 'impressed' | 'party' | 'thinking' | 'surprised' | 'proud' | 'sleepy';

interface GastonProps {
  message?: string;
  expression?: GastonExpression;
  size?: 'normal' | 'small' | 'large';
  title?: string;
  compact?: boolean;
}

// ── Gaston SVG — exact copy of GastonMascot.tsx from the RN app ──
// viewBox 0 0 160 120
function GastonSVG({ expression = 'happy', w, h }: { expression: GastonExpression; w: number; h: number }) {
  const eyelidColor = '#152D56';

  const getEyes = () => {
    switch (expression) {
      case 'sleepy':
        return (
          <g>
            <ellipse cx={62} cy={36} rx={13} ry={11} fill="white" />
            <circle cx={64} cy={38} r={4} fill="#1A1A4E" />
            <path d="M49 30 Q62 22 75 30 L75 36 Q62 28 49 36 Z" fill={eyelidColor} />
            <ellipse cx={98} cy={36} rx={13} ry={11} fill="white" />
            <circle cx={100} cy={38} r={4} fill="#1A1A4E" />
            <path d="M85 30 Q98 22 111 30 L111 36 Q98 28 85 36 Z" fill={eyelidColor} />
            <circle cx={98} cy={36} r={15} fill="none" stroke="#DAA520" strokeWidth={1.5} />
            <line x1={111} y1={44} x2={118} y2={58} stroke="#DAA520" strokeWidth={1} />
            <text x={120} y={16} fontSize={9} fontWeight="700" fill="#8B9DC3" opacity={0.7}>Z</text>
            <text x={126} y={10} fontSize={6} fontWeight="700" fill="#8B9DC3" opacity={0.5}>z</text>
          </g>
        );
      case 'impressed':
      case 'surprised':
        return (
          <g>
            <ellipse cx={62} cy={36} rx={14} ry={12} fill="white" />
            <circle cx={64} cy={35} r={6} fill="#1A1A4E" />
            <circle cx={60} cy={32} r={2} fill="white" />
            <ellipse cx={98} cy={36} rx={14} ry={12} fill="white" />
            <circle cx={100} cy={35} r={6} fill="#1A1A4E" />
            <circle cx={96} cy={32} r={2} fill="white" />
            <circle cx={98} cy={36} r={15} fill="none" stroke="#DAA520" strokeWidth={1.5} />
            <line x1={111} y1={44} x2={118} y2={58} stroke="#DAA520" strokeWidth={1} />
          </g>
        );
      case 'unhappy':
        return (
          <g>
            <ellipse cx={62} cy={36} rx={13} ry={11} fill="white" />
            <circle cx={64} cy={38} r={5} fill="#1A1A4E" />
            <line x1={50} y1={26} x2={72} y2={30} stroke="#152D56" strokeWidth={2.5} strokeLinecap="round" />
            <ellipse cx={98} cy={36} rx={13} ry={11} fill="white" />
            <circle cx={100} cy={38} r={5} fill="#1A1A4E" />
            <line x1={88} y1={30} x2={110} y2={26} stroke="#152D56" strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={98} cy={36} r={15} fill="none" stroke="#DAA520" strokeWidth={1.5} />
            <line x1={111} y1={44} x2={118} y2={58} stroke="#DAA520" strokeWidth={1} />
          </g>
        );
      case 'encouraging':
        return (
          <g>
            <ellipse cx={62} cy={36} rx={13} ry={11} fill="white" />
            <circle cx={64} cy={36} r={5} fill="#1A1A4E" />
            <circle cx={60} cy={33} r={2} fill="white" />
            <path d="M49 28 Q62 22 75 28 L75 33 Q62 27 49 33 Z" fill={eyelidColor} />
            <ellipse cx={98} cy={36} rx={13} ry={11} fill="white" />
            <path d="M87 37 Q98 44 109 37" stroke="#1A1A4E" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <circle cx={98} cy={36} r={15} fill="none" stroke="#DAA520" strokeWidth={1.5} />
            <line x1={111} y1={44} x2={118} y2={58} stroke="#DAA520" strokeWidth={1} />
          </g>
        );
      case 'party':
      case 'proud':
        return (
          <g>
            <ellipse cx={62} cy={36} rx={13} ry={11} fill="white" />
            <text x={62} y={41} fontSize={14} textAnchor="middle" fill="#FFD700" fontWeight="900">{'★'}</text>
            <ellipse cx={98} cy={36} rx={13} ry={11} fill="white" />
            <text x={98} y={41} fontSize={14} textAnchor="middle" fill="#FFD700" fontWeight="900">{'★'}</text>
            <circle cx={98} cy={36} r={15} fill="none" stroke="#DAA520" strokeWidth={1.5} />
            <line x1={111} y1={44} x2={118} y2={58} stroke="#DAA520" strokeWidth={1} />
            <circle cx={30} cy={12} r={2.5} fill="#FF6B6B" />
            <circle cx={130} cy={8} r={2.5} fill="#74B9FF" />
            <circle cx={80} cy={5} r={2} fill="#FFD700" />
          </g>
        );
      case 'thinking':
        return (
          <g>
            <ellipse cx={62} cy={36} rx={13} ry={11} fill="white" />
            <circle cx={60} cy={36} r={5} fill="#1A1A4E" />
            <circle cx={57} cy={33} r={2} fill="white" />
            <path d="M49 28 Q62 22 75 28 L75 32 Q62 26 49 32 Z" fill={eyelidColor} />
            <ellipse cx={98} cy={36} rx={13} ry={11} fill="white" />
            <circle cx={102} cy={34} r={5} fill="#1A1A4E" />
            <circle cx={99} cy={31} r={2} fill="white" />
            <path d="M85 28 Q98 22 111 28 L111 32 Q98 26 85 32 Z" fill={eyelidColor} />
            <circle cx={98} cy={36} r={15} fill="none" stroke="#DAA520" strokeWidth={1.5} />
            <line x1={111} y1={44} x2={118} y2={58} stroke="#DAA520" strokeWidth={1} />
            <text x={128} y={14} fontSize={11} fontWeight="700" fill="#8B9DC3" opacity={0.6}>?</text>
          </g>
        );
      default: // happy
        return (
          <g>
            {/* Left eye */}
            <ellipse cx={62} cy={36} rx={13} ry={11} fill="white" />
            <circle cx={64} cy={36} r={5} fill="#1A1A4E" />
            <circle cx={60} cy={33} r={2} fill="white" />
            {/* Eyelid half-closed */}
            <path d="M49 28 Q62 22 75 28 L75 33 Q62 27 49 33 Z" fill={eyelidColor} />
            {/* Right eye */}
            <ellipse cx={98} cy={36} rx={13} ry={11} fill="white" />
            <circle cx={100} cy={36} r={5} fill="#1A1A4E" />
            <circle cx={96} cy={33} r={2} fill="white" />
            {/* Eyelid half-closed */}
            <path d="M85 28 Q98 22 111 28 L111 33 Q98 27 85 33 Z" fill={eyelidColor} />
            {/* Monocle on right eye */}
            <circle cx={98} cy={36} r={15} fill="none" stroke="#DAA520" strokeWidth={1.5} />
            {/* Monocle chain */}
            <line x1={111} y1={44} x2={118} y2={58} stroke="#DAA520" strokeWidth={1} />
            <circle cx={119} cy={60} r={1.5} fill="#DAA520" />
          </g>
        );
    }
  };

  const getMouth = () => {
    switch (expression) {
      case 'unhappy':
        return <path d="M60 97 Q80 91 100 97" fill="none" stroke="#999" strokeWidth={2} strokeLinecap="round" />;
      case 'impressed':
      case 'surprised':
        return <circle cx={80} cy={96} r={4} fill="#888" />;
      case 'sleepy':
        return <line x1={65} y1={95} x2={95} y2={95} stroke="#999" strokeWidth={2} strokeLinecap="round" />;
      case 'party':
      case 'proud':
        return (
          <g>
            <path d="M55 93 Q80 104 105 93" fill="none" stroke="#999" strokeWidth={2} strokeLinecap="round" />
            <path d="M60 93 Q80 102 100 93" fill="#C0392B" opacity={0.15} />
          </g>
        );
      default:
        return <path d="M58 93 Q80 102 102 93" fill="none" stroke="#999" strokeWidth={2} strokeLinecap="round" />;
    }
  };

  return (
    <svg width={w} height={h} viewBox="0 0 160 120">
      {/* Shadow under car */}
      <ellipse cx={80} cy={114} rx={55} ry={5} fill="#000000" opacity={0.12} />

      {/* Main body (blue night) */}
      <rect x={18} y={50} width={124} height={50} rx={16} fill="#1B3A6B" />
      {/* Upper body / cabin */}
      <rect x={35} y={18} width={90} height={42} rx={14} fill="#1B3A6B" />
      {/* Fill gap */}
      <rect x={35} y={45} width={90} height={15} fill="#1B3A6B" />

      {/* Body reflections */}
      <path d="M30 62 Q55 56 80 62" stroke="#4A7AB5" strokeWidth={1.5} fill="none" opacity={0.35} />
      <path d="M35 70 Q60 65 85 70" stroke="#4A7AB5" strokeWidth={1} fill="none" opacity={0.25} />
      <path d="M100 55 Q115 52 130 55" stroke="#4A7AB5" strokeWidth={1} fill="none" opacity={0.2} />

      {/* Windshield */}
      <rect x={42} y={22} width={76} height={28} rx={8} fill="#87CEEB" />
      <rect x={46} y={24} width={20} height={6} rx={3} fill="#FFFFFF" opacity={0.15} />

      {/* Eyes */}
      {getEyes()}

      {/* Headlights (yellow cheeks) */}
      <circle cx={28} cy={72} r={9} fill="#FFD93D" />
      <circle cx={28} cy={72} r={4} fill="#FFFFFF" opacity={0.6} />
      <circle cx={132} cy={72} r={9} fill="#FFD93D" />
      <circle cx={132} cy={72} r={4} fill="#FFFFFF" opacity={0.6} />

      {/* Chrome bumper */}
      <rect x={25} y={88} width={110} height={10} rx={5} fill="#C0C0C0" />
      <rect x={28} y={89} width={104} height={4} rx={2} fill="#D8D8D8" opacity={0.5} />

      {/* Mouth on bumper */}
      {getMouth()}

      {/* Bow tie */}
      <g>
        <path d="M72 100 L80 104 L88 100 L80 102 Z" fill="#C0392B" />
        <circle cx={80} cy={101} r={2} fill="#A93226" />
      </g>

      {/* License plate (Belgian) */}
      <rect x={62} y={80} width={36} height={8} rx={1.5} fill="#FFFFFF" stroke="#333" strokeWidth={0.8} />
      <rect x={62} y={80} width={6} height={8} rx={1.5} fill="#003399" />
      <text x={65} y={87} fontSize={4} fill="#FFD700" fontWeight="bold">B</text>
      <text x={80} y={87} fontSize={5} fill="#333" fontWeight="bold" textAnchor="middle">GASTON</text>

      {/* Graduation cap on roof */}
      <g transform="rotate(-8, 95, 14)">
        <rect x={75} y={8} width={35} height={4} rx={1} fill="#1A1A1A" />
        <path d="M80 12 L92 18 L110 12 L92 8 Z" fill="#1A1A1A" />
        <line x1={92} y1={8} x2={108} y2={4} stroke="#DAA520" strokeWidth={1} />
        <circle cx={109} cy={3} r={2.5} fill="#DAA520" />
      </g>

      {/* Antenna with Belgian flag */}
      <line x1={60} y1={18} x2={55} y2={2} stroke="#888" strokeWidth={1.5} />
      <circle cx={55} cy={2} r={1} fill="#888" />
      <rect x={42} y={0} width={4} height={6} fill="#1A1A1A" />
      <rect x={46} y={0} width={4} height={6} fill="#FFD700" />
      <rect x={50} y={0} width={4} height={6} fill="#E30613" />

      {/* Left wheel */}
      <circle cx={42} cy={106} r={9} fill="#222" />
      <circle cx={42} cy={106} r={4.5} fill="#777" />
      <circle cx={42} cy={106} r={2} fill="#555" />
      {/* Right wheel */}
      <circle cx={118} cy={106} r={9} fill="#222" />
      <circle cx={118} cy={106} r={4.5} fill="#777" />
      <circle cx={118} cy={106} r={2} fill="#555" />
    </svg>
  );
}

export default function Gaston({ message, expression = 'happy', size = 'normal', title, compact }: GastonProps) {
  const isSmall = size === 'small' || compact;
  const isLarge = size === 'large';
  const gastonH = isSmall ? 40 : isLarge ? 100 : 55;
  const gastonW = gastonH * (160 / 120);

  return (
    <div className="animate-drive-in flex items-start gap-1">
      {/* Gaston avatar */}
      <div className="flex-shrink-0" style={{ width: isSmall ? 54 : isLarge ? 135 : 74, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
        <Image src="/images/gaston.png" width={gastonW} height={gastonH} alt="Prof. Gaston" style={{ objectFit: 'contain' }} />
      </div>

      {/* Speech bubble — cream color like RN */}
      {message && (
        <div className="flex items-start flex-1">
          {/* Triangle arrow pointing to Gaston */}
          <div className="flex-shrink-0" style={{
            width: 0,
            height: 0,
            marginTop: 18,
            borderTop: '9px solid transparent',
            borderBottom: '9px solid transparent',
            borderRight: '12px solid #1B3A6B',
            marginRight: -2,
          }} />
          <div
            className={`flex-1 ${isSmall ? 'rounded-xl p-2.5' : 'rounded-2xl p-3.5 pt-2.5'}`}
            style={{
              background: '#FFF8E7',
              border: `${isSmall ? 1.5 : 2}px solid #1B3A6B`,
              boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
            }}
          >
            {title && (
              <p className={`font-black uppercase tracking-wider ${isSmall ? 'text-[11px] mb-0.5' : 'text-[13px] mb-1'}`} style={{ color: '#1B3A6B', letterSpacing: 1 }}>
                {title}
              </p>
            )}
            <p className={`font-semibold ${isSmall ? 'text-[14px] leading-5' : 'text-[15px] leading-relaxed'}`} style={{ color: '#1A1A2E' }}>
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
