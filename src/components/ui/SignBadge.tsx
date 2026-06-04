interface SignBadgeProps {
  shape: 'triangle' | 'circle' | 'rect';
  size?: number;
  color?: string;
  children?: React.ReactNode;
}

export default function SignBadge({ shape, size = 40, color = '#f59e0b', children }: SignBadgeProps) {
  if (shape === 'triangle') {
    const h = size * 0.866;
    return (
      <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`}>
        <polygon
          points={`${size / 2},4 ${size - 4},${h - 4} 4,${h - 4}`}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {children && (
          <foreignObject x={8} y={h * 0.35} width={size - 16} height={h * 0.55}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              {children}
            </div>
          </foreignObject>
        )}
      </svg>
    );
  }

  if (shape === 'circle') {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 3} fill="none" stroke={color} strokeWidth="3" />
        {children && (
          <foreignObject x={6} y={6} width={size - 12} height={size - 12}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              {children}
            </div>
          </foreignObject>
        )}
      </svg>
    );
  }

  // rect (panneau rectangulaire / information)
  return (
    <svg width={size * 1.4} height={size} viewBox={`0 0 ${size * 1.4} ${size}`}>
      <rect x={3} y={3} width={size * 1.4 - 6} height={size - 6} rx={4} fill="none" stroke={color} strokeWidth="3" />
      {children && (
        <foreignObject x={6} y={6} width={size * 1.4 - 12} height={size - 12}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {children}
          </div>
        </foreignObject>
      )}
    </svg>
  );
}
