export default function LoadingLecons() {
  return (
    <div style={{ padding: '16px', maxWidth: 920, margin: '0 auto' }}>
      {[...Array(9)].map((_, i) => (
        <div key={i} className="skeleton-row" style={{ height: 72, borderRadius: 16, marginBottom: 10 }} />
      ))}
    </div>
  );
}
