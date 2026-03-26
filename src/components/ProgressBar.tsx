'use client';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  className?: string;
}

export default function ProgressBar({ value, color = '#00B894', height = 8, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full rounded-full overflow-hidden ${className}`} style={{ height, background: '#1E2D4A' }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}
