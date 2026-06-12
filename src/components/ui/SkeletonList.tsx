'use client';

export function SkeletonList({ count = 5, height = 64 }: { count?: number; height?: number }) {
  return (
    <div style={{ padding: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse"
          style={{
            background: 'var(--border-subtle)',
            borderRadius: 10,
            height,
            marginBottom: 10,
            opacity: 1 - i * 0.08,
          }}
        />
      ))}
    </div>
  );
}
