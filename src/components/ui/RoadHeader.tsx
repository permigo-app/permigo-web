import Link from 'next/link';

interface RoadHeaderProps {
  title: string;
  sub?: string;
  back?: string;
  right?: React.ReactNode;
}

export default function RoadHeader({ title, sub, back, right }: RoadHeaderProps) {
  return (
    <div
      style={{
        background: '#1a2035',
        paddingTop: 52,
        paddingBottom: 0,
        paddingLeft: 20,
        paddingRight: 20,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {back && (
            <Link
              href={back}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          )}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.2,
                fontFamily: 'Sora, sans-serif',
                letterSpacing: -0.5,
              }}
            >
              {title}
            </h1>
            {sub && (
              <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontFamily: 'Sora, sans-serif' }}>
                {sub}
              </p>
            )}
          </div>
        </div>
        {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      </div>

      {/* dashed amber line at the bottom — marquage au sol */}
      <div
        style={{
          height: 3,
          backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 18px, transparent 18px, transparent 30px)',
        }}
      />
    </div>
  );
}
