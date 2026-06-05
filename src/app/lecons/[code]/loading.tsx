export default function LoadingLeconCode() {
  return (
    <div style={{ padding: '16px', maxWidth: 920, margin: '0 auto' }}>
      <div className="skeleton-row" style={{ height: 120, borderRadius: 20, marginBottom: 16 }} />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-row" style={{ height: 64, borderRadius: 14, marginBottom: 10 }} />
      ))}
    </div>
  );
}
