import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  sub?: string;
  back?: string;
  right?: React.ReactNode;
  eyebrow?: string;
}

export default function PageHeader({ title, sub, back, right, eyebrow }: PageHeaderProps) {
  return (
    <div
      style={{
        background: 'var(--bg-header)',
        borderBottom: '1px solid var(--border-header)',
        paddingTop: 52,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 18,
      }}
    >
      {eyebrow && (
        <p style={{
          margin: '0 0 6px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '1.4px',
          textTransform: 'uppercase',
          color: 'var(--text-hint)',
          fontFamily: 'Sora, sans-serif',
        }}>
          {eyebrow}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          {back && (
            <Link
              href={back}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1.5px solid var(--border-card)',
                background: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-sub)',
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          )}
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--text-title)',
              lineHeight: 1.2,
              fontFamily: 'Sora, sans-serif',
              letterSpacing: -0.5,
            }}>
              {title}
            </h1>
            {sub && (
              <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 400, color: 'var(--text-sub)', fontFamily: 'Sora, sans-serif' }}>
                {sub}
              </p>
            )}
          </div>
        </div>
        {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      </div>
    </div>
  );
}
