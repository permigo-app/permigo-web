'use client';

interface CarSVGProps {
  type?: string;
  color?: string;
  size?: number;
}

export default function CarSVG({ type = 'berline', color = '#1E88E5', size = 120 }: CarSVGProps) {
  const w = size;
  const h = Math.round(size * 0.5);
  const g = '#a8d8f0';

  const inner = (() => {
    switch (type) {
      case 'suv': return <>
        <rect x="15" y="30" width="170" height="52" rx="8" fill={color}/>
        <rect x="25" y="15" width="150" height="25" rx="6" fill={color}/>
        <rect x="32" y="18" width="55" height="18" rx="3" fill={g} opacity="0.8"/>
        <rect x="93" y="18" width="55" height="18" rx="3" fill={g} opacity="0.8"/>
        <circle cx="50" cy="82" r="16" fill="#222"/><circle cx="50" cy="82" r="7" fill="#555"/>
        <circle cx="150" cy="82" r="16" fill="#222"/><circle cx="150" cy="82" r="7" fill="#555"/>
        <rect x="15" y="38" width="14" height="10" rx="3" fill="#FFD700"/>
        <rect x="171" y="38" width="14" height="10" rx="3" fill="#FFD700"/>
      </>;
      case 'sportive': return <>
        <rect x="10" y="55" width="180" height="28" rx="6" fill={color}/>
        <path d="M30 55 Q60 30 100 28 Q140 28 170 55Z" fill={color}/>
        <path d="M55 53 Q75 35 105 33 Q130 33 148 53Z" fill={g} opacity="0.8"/>
        <circle cx="50" cy="83" r="13" fill="#222"/><circle cx="50" cy="83" r="5" fill="#555"/>
        <circle cx="150" cy="83" r="13" fill="#222"/><circle cx="150" cy="83" r="5" fill="#555"/>
        <rect x="12" y="58" width="16" height="7" rx="3" fill="#FFD700"/>
        <rect x="172" y="58" width="16" height="7" rx="3" fill="#FFD700"/>
      </>;
      case 'mini': return <>
        <rect x="35" y="45" width="130" height="38" rx="10" fill={color}/>
        <ellipse cx="100" cy="45" rx="50" ry="25" fill={color}/>
        <rect x="48" y="28" width="104" height="25" rx="12" fill={color}/>
        <rect x="55" y="31" width="38" height="17" rx="5" fill={g} opacity="0.8"/>
        <rect x="98" y="31" width="38" height="17" rx="5" fill={g} opacity="0.8"/>
        <circle cx="62" cy="82" r="13" fill="#222"/><circle cx="62" cy="82" r="5" fill="#555"/>
        <circle cx="138" cy="82" r="13" fill="#222"/><circle cx="138" cy="82" r="5" fill="#555"/>
        <rect x="35" y="52" width="12" height="8" rx="3" fill="#FFD700"/>
        <rect x="153" y="52" width="12" height="8" rx="3" fill="#FFD700"/>
      </>;
      case 'van': return <>
        <rect x="10" y="22" width="180" height="60" rx="8" fill={color}/>
        <rect x="15" y="28" width="35" height="25" rx="4" fill={g} opacity="0.8"/>
        <rect x="58" y="28" width="35" height="20" rx="3" fill={g} opacity="0.8"/>
        <rect x="100" y="28" width="35" height="20" rx="3" fill={g} opacity="0.8"/>
        <circle cx="45" cy="82" r="15" fill="#222"/><circle cx="45" cy="82" r="6" fill="#555"/>
        <circle cx="155" cy="82" r="15" fill="#222"/><circle cx="155" cy="82" r="6" fill="#555"/>
        <rect x="10" y="32" width="12" height="12" rx="3" fill="#FFD700"/>
      </>;
      case 'pickup': return <>
        <rect x="10" y="35" width="85" height="47" rx="8" fill={color}/>
        <rect x="18" y="20" width="70" height="25" rx="6" fill={color}/>
        <rect x="95" y="48" width="95" height="34" rx="4" fill={color}/>
        <rect x="22" y="23" width="55" height="18" rx="4" fill={g} opacity="0.8"/>
        <circle cx="45" cy="82" r="15" fill="#222"/><circle cx="45" cy="82" r="6" fill="#555"/>
        <circle cx="155" cy="82" r="15" fill="#222"/><circle cx="155" cy="82" r="6" fill="#555"/>
        <rect x="10" y="44" width="13" height="9" rx="3" fill="#FFD700"/>
      </>;
      default: return <>
        <rect x="20" y="45" width="160" height="40" rx="8" fill={color}/>
        <ellipse cx="100" cy="45" rx="55" ry="22" fill={color}/>
        <rect x="35" y="28" width="130" height="25" rx="10" fill={color}/>
        <rect x="45" y="31" width="45" height="18" rx="4" fill={g} opacity="0.8"/>
        <rect x="95" y="31" width="45" height="18" rx="4" fill={g} opacity="0.8"/>
        <circle cx="55" cy="82" r="14" fill="#222"/><circle cx="55" cy="82" r="6" fill="#555"/>
        <circle cx="145" cy="82" r="14" fill="#222"/><circle cx="145" cy="82" r="6" fill="#555"/>
        <rect x="20" y="52" width="14" height="8" rx="3" fill="#FFD700"/>
        <rect x="166" y="52" width="14" height="8" rx="3" fill="#FFD700"/>
      </>;
    }
  })();

  return (
    <svg viewBox="0 0 200 100" width={w} height={h}>
      {inner}
    </svg>
  );
}

export function getCarTypes() {
  return [
    { id: 'berline',  label: 'Berline' },
    { id: 'suv',      label: 'SUV' },
    { id: 'sportive', label: 'Sportive' },
    { id: 'mini',     label: 'Mini' },
    { id: 'van',      label: 'Van' },
    { id: 'pickup',   label: 'Pick-up' },
  ];
}

export const CAR_COLORS = [
  { id: '#E53935', label: 'Rouge', labelKey: 'color_rouge' },
  { id: '#1E88E5', label: 'Bleu',  labelKey: 'color_bleu' },
  { id: '#43A047', label: 'Vert',  labelKey: 'color_vert' },
  { id: '#FDD835', label: 'Jaune', labelKey: 'color_jaune' },
  { id: '#FF9800', label: 'Orange',labelKey: 'color_orange' },
  { id: '#E91E63', label: 'Rose',  labelKey: 'color_rose' },
  { id: '#8E24AA', label: 'Violet',labelKey: 'color_violet' },
  { id: '#424242', label: 'Noir',  labelKey: 'color_noir' },
];
