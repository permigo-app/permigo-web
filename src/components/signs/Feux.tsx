'use client';

/** Traffic lights (feux de signalisation) — SVG components */

interface Props { size?: number }

function LightBox({ children, size = 80, width = 36, height = 90 }: Props & { children: React.ReactNode; width?: number; height?: number }) {
  const s = size;
  const vw = 50 + width;
  const vh = height + 20;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${vw} ${vh}`}>
      <rect x={(vw - width) / 2} y="5" width={width} height={height} rx="6" fill="#1A1A1A" stroke="#333" strokeWidth="2" />
      {children}
      <rect x={(vw - 6) / 2} y={height + 5} width="6" height="12" rx="1" fill="#555" />
    </svg>
  );
}

export function FeuTricolore({ size = 80 }: Props) {
  const cx = 43;
  return (
    <LightBox size={size}>
      <circle cx={cx} cy="24" r="11" fill="#FF0000" />
      <circle cx={cx} cy="24" r="7" fill="#FF3333" opacity={0.5} />
      <circle cx={cx} cy="50" r="11" fill="#FF8C00" />
      <circle cx={cx} cy="50" r="7" fill="#FFB347" opacity={0.5} />
      <circle cx={cx} cy="76" r="11" fill="#00CC00" />
      <circle cx={cx} cy="76" r="7" fill="#33FF33" opacity={0.5} />
    </LightBox>
  );
}

export function FeuRouge({ size = 80 }: Props) {
  const cx = 43;
  return (
    <LightBox size={size}>
      <circle cx={cx} cy="24" r="11" fill="#FF0000" />
      <circle cx={cx} cy="24" r="7" fill="#FF3333" opacity={0.6} />
      <circle cx={cx} cy="50" r="11" fill="#333" />
      <circle cx={cx} cy="76" r="11" fill="#333" />
    </LightBox>
  );
}

export function FeuOrange({ size = 80 }: Props) {
  const cx = 43;
  return (
    <LightBox size={size}>
      <circle cx={cx} cy="24" r="11" fill="#333" />
      <circle cx={cx} cy="50" r="11" fill="#FF8C00" />
      <circle cx={cx} cy="50" r="7" fill="#FFB347" opacity={0.6} />
      <circle cx={cx} cy="76" r="11" fill="#333" />
    </LightBox>
  );
}

export function FeuVert({ size = 80 }: Props) {
  const cx = 43;
  return (
    <LightBox size={size}>
      <circle cx={cx} cy="24" r="11" fill="#333" />
      <circle cx={cx} cy="50" r="11" fill="#333" />
      <circle cx={cx} cy="76" r="11" fill="#00CC00" />
      <circle cx={cx} cy="76" r="7" fill="#33FF33" opacity={0.6} />
    </LightBox>
  );
}

export function FeuClignotant({ size = 80 }: Props) {
  const cx = 43;
  return (
    <LightBox size={size}>
      <circle cx={cx} cy="24" r="11" fill="#333" />
      <circle cx={cx} cy="50" r="11" fill="#FF8C00" />
      <circle cx={cx} cy="50" r="7" fill="#FFB347" opacity={0.6} />
      {/* Rays to indicate blinking */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * 13;
        const y1 = 50 + Math.sin(rad) * 13;
        const x2 = cx + Math.cos(rad) * 17;
        const y2 = 50 + Math.sin(rad) * 17;
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFB347" strokeWidth="1.5" opacity={0.7} />;
      })}
      <circle cx={cx} cy="76" r="11" fill="#333" />
    </LightBox>
  );
}

export function FeuFlecheVerte({ size = 80 }: Props) {
  const cx = 43;
  return (
    <LightBox size={size}>
      <circle cx={cx} cy="24" r="11" fill="#333" />
      <circle cx={cx} cy="50" r="11" fill="#333" />
      <circle cx={cx} cy="76" r="11" fill="#00CC00" />
      {/* Arrow pointing right */}
      <polygon points={`${cx - 5},73 ${cx + 3},76 ${cx - 5},79`} fill="#003300" />
      <line x1={cx - 8} y1={76} x2={cx - 3} y2={76} stroke="#003300" strokeWidth="2" />
    </LightBox>
  );
}

export function FeuPietonRouge({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 70 100">
      <rect x="10" y="5" width="50" height="90" rx="6" fill="#1A1A1A" stroke="#333" strokeWidth="2" />
      {/* Red standing person */}
      <circle cx="35" cy="25" r="12" fill="#FF0000" />
      <circle cx="35" cy="22" r="3" fill="#CC0000" />
      <line x1="35" y1="25" x2="35" y2="33" stroke="#CC0000" strokeWidth="2" />
      <line x1="30" y1="28" x2="40" y2="28" stroke="#CC0000" strokeWidth="2" />
      <line x1="35" y1="33" x2="31" y2="38" stroke="#CC0000" strokeWidth="2" />
      <line x1="35" y1="33" x2="39" y2="38" stroke="#CC0000" strokeWidth="2" />
      {/* Green off */}
      <circle cx="35" cy="65" r="12" fill="#333" />
      <rect x="29" y="87" width="12" height="6" rx="1" fill="#555" />
    </svg>
  );
}

export function FeuPietonVert({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 70 100">
      <rect x="10" y="5" width="50" height="90" rx="6" fill="#1A1A1A" stroke="#333" strokeWidth="2" />
      {/* Red off */}
      <circle cx="35" cy="25" r="12" fill="#333" />
      {/* Green walking person */}
      <circle cx="35" cy="65" r="12" fill="#00CC00" />
      <circle cx="35" cy="59" r="3" fill="#009900" />
      <line x1="35" y1="62" x2="35" y2="69" stroke="#009900" strokeWidth="2" />
      <line x1="30" y1="65" x2="40" y2="65" stroke="#009900" strokeWidth="2" />
      <line x1="35" y1="69" x2="30" y2="75" stroke="#009900" strokeWidth="2" />
      <line x1="35" y1="69" x2="40" y2="75" stroke="#009900" strokeWidth="2" />
      <rect x="29" y="87" width="12" height="6" rx="1" fill="#555" />
    </svg>
  );
}

export function FeuVeloRouge({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 70 100">
      <rect x="10" y="5" width="50" height="90" rx="6" fill="#1A1A1A" stroke="#333" strokeWidth="2" />
      <circle cx="35" cy="30" r="15" fill="#FF0000" />
      {/* Bicycle silhouette */}
      <circle cx="28" cy="33" r="5" fill="none" stroke="#800000" strokeWidth="1.5" />
      <circle cx="42" cy="33" r="5" fill="none" stroke="#800000" strokeWidth="1.5" />
      <line x1="28" y1="33" x2="35" y2="26" stroke="#800000" strokeWidth="1.5" />
      <line x1="35" y1="26" x2="42" y2="33" stroke="#800000" strokeWidth="1.5" />
      <line x1="35" y1="26" x2="38" y2="26" stroke="#800000" strokeWidth="1.5" />
      <circle cx="35" cy="70" r="15" fill="#333" />
      <rect x="29" y="87" width="12" height="6" rx="1" fill="#555" />
    </svg>
  );
}

export function FeuVeloVert({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 70 100">
      <rect x="10" y="5" width="50" height="90" rx="6" fill="#1A1A1A" stroke="#333" strokeWidth="2" />
      <circle cx="35" cy="30" r="15" fill="#333" />
      <circle cx="35" cy="70" r="15" fill="#00CC00" />
      {/* Bicycle silhouette */}
      <circle cx="28" cy="73" r="5" fill="none" stroke="#006600" strokeWidth="1.5" />
      <circle cx="42" cy="73" r="5" fill="none" stroke="#006600" strokeWidth="1.5" />
      <line x1="28" y1="73" x2="35" y2="66" stroke="#006600" strokeWidth="1.5" />
      <line x1="35" y1="66" x2="42" y2="73" stroke="#006600" strokeWidth="1.5" />
      <line x1="35" y1="66" x2="38" y2="66" stroke="#006600" strokeWidth="1.5" />
      <rect x="29" y="87" width="12" height="6" rx="1" fill="#555" />
    </svg>
  );
}

export function CroixRougeVoie({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <rect width="80" height="80" rx="8" fill="#1A1A1A" stroke="#333" strokeWidth="2" />
      <line x1="20" y1="20" x2="60" y2="60" stroke="#FF0000" strokeWidth="6" strokeLinecap="round" />
      <line x1="60" y1="20" x2="20" y2="60" stroke="#FF0000" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function FlecheVerteVoie({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <rect width="80" height="80" rx="8" fill="#1A1A1A" stroke="#333" strokeWidth="2" />
      <polygon points="40,18 58,45 48,45 48,62 32,62 32,45 22,45" fill="#00CC00" />
    </svg>
  );
}

export function FeuTram({ size = 80 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 110">
      <rect x="15" y="5" width="60" height="100" rx="6" fill="#1A1A1A" stroke="#333" strokeWidth="2" />
      {/* T-shape signal (white) */}
      <rect x="30" y="18" width="30" height="6" rx="2" fill="#FFFFFF" />
      <rect x="42" y="18" width="6" height="25" rx="2" fill="#FFFFFF" />
      {/* Orange circle below */}
      <circle cx="45" cy="60" r="10" fill="#FF8C00" />
      <circle cx="45" cy="60" r="6" fill="#FFB347" opacity={0.5} />
      {/* Bottom bar */}
      <rect x="30" y="80" width="30" height="6" rx="2" fill="#FFFFFF" />
      <rect x="37" y="97" width="16" height="6" rx="1" fill="#555" />
    </svg>
  );
}
