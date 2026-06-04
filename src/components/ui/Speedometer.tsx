interface SpeedometerProps {
  pct: number;   // 0–100
  size?: number;
}

export default function Speedometer({ pct, size = 140 }: SpeedometerProps) {
  const clamped = Math.min(100, Math.max(0, pct));
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const strokeWidth = size * 0.07;

  // Arc: starts at 220° (left) ends at -40° (right) → 220° sweep
  const startAngle = 220;
  const endAngle = -40;
  const totalSweep = 360 - (startAngle - endAngle); // 220° total

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (start: number, sweep: number) => {
    const s = toRad(start);
    const e = toRad(start - sweep);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy - r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy - r * Math.sin(e);
    const large = sweep > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const filledSweep = (clamped / 100) * totalSweep;

  // needle angle: from startAngle to startAngle - filledSweep
  const needleAngle = startAngle - filledSweep;
  const needleRad = toRad(needleAngle);
  const needleLen = r * 0.75;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy - needleLen * Math.sin(needleRad);

  // tick marks
  const ticks = [0, 25, 50, 75, 100];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* track */}
      <path
        d={arcPath(startAngle, totalSweep)}
        fill="none"
        stroke="#1a2035"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* filled arc */}
      {clamped > 0 && (
        <path
          d={arcPath(startAngle, filledSweep)}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      )}
      {/* tick marks */}
      {ticks.map((t) => {
        const ang = toRad(startAngle - (t / 100) * totalSweep);
        const r1 = r + strokeWidth * 0.6;
        const r2 = r + strokeWidth * 1.1;
        return (
          <line
            key={t}
            x1={cx + r1 * Math.cos(ang)}
            y1={cy - r1 * Math.sin(ang)}
            x2={cx + r2 * Math.cos(ang)}
            y2={cy - r2 * Math.sin(ang)}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1.5}
          />
        );
      })}
      {/* needle */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="#f59e0b"
        strokeWidth={strokeWidth * 0.28}
        strokeLinecap="round"
      />
      {/* center dot */}
      <circle cx={cx} cy={cy} r={strokeWidth * 0.45} fill="#f59e0b" />
      <circle cx={cx} cy={cy} r={strokeWidth * 0.22} fill="#1a2035" />
      {/* percentage text */}
      <text
        x={cx}
        y={cy + r * 0.42}
        textAnchor="middle"
        fontSize={size * 0.17}
        fontWeight="800"
        fill="#f59e0b"
        fontFamily="Sora, sans-serif"
      >
        {Math.round(clamped)}%
      </text>
      <text
        x={cx}
        y={cy + r * 0.62}
        textAnchor="middle"
        fontSize={size * 0.085}
        fontWeight="600"
        fill="rgba(255,255,255,0.5)"
        fontFamily="Sora, sans-serif"
      >
        maîtrisé
      </text>
    </svg>
  );
}
