interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export default function StatCard({ label, value, sub, accent = '#0b2659' }: StatCardProps) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1.5px solid #e8eaed',
      borderRadius: 16,
      padding: '16px 14px',
      textAlign: 'center',
    }}>
      <p style={{
        margin: 0,
        fontSize: 28,
        fontWeight: 800,
        color: accent,
        lineHeight: 1,
        fontFamily: 'Sora, sans-serif',
      }}>
        {value}
      </p>
      <p style={{ margin: '5px 0 0', fontSize: 11, fontWeight: 700, color: '#a0a8b8', letterSpacing: '0.5px' }}>
        {label}
      </p>
      {sub && (
        <p style={{ margin: '2px 0 0', fontSize: 10, color: '#a0a8b8' }}>{sub}</p>
      )}
    </div>
  );
}
