interface RoadBarProps {
  pct: number;       // 0–100
  height?: number;
  showLabel?: boolean;
}

export default function RoadBar({ pct, height = 12, showLabel = false }: RoadBarProps) {
  const clamped = Math.min(100, Math.max(0, pct));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          flex: 1,
          height,
          borderRadius: height,
          background: '#1a2035',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* dashed center line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 1,
            transform: 'translateY(-50%)',
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0px, rgba(255,255,255,0.25) 8px, transparent 8px, transparent 16px)',
          }}
        />
        {/* fill */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, #d97706, #f59e0b)',
            borderRadius: height,
            transition: 'width 0.6s ease-out',
          }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b', minWidth: 36, textAlign: 'right' }}>
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
