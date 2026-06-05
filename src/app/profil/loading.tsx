export default function LoadingProfil() {
  return (
    <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto' }}>
      <div className="skeleton-row" style={{ height: 140, borderRadius: 20, marginBottom: 16 }} />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton-row" style={{ height: 72, borderRadius: 14, marginBottom: 10 }} />
      ))}
    </div>
  );
}
