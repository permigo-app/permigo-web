interface ProgressBarProps {
  pct: number;
  height?: number;
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  pct,
  height = 8,
  color = '#0b2659',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          flex: 1,
          height,
          borderRadius: height,
          background: '#e8eaed',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            borderRadius: height,
            background: color,
            transition: 'width 0.5s ease-out',
            minWidth: clamped > 0 ? 6 : 0,
          }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 36, textAlign: 'right', flexShrink: 0 }}>
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
