'use client';

interface CarSVGProps {
  type?: string;
  color?: string;
  size?: number;
}

const CAR_SHAPES: Record<string, { body: string; roof: string; label: string }> = {
  berline: {
    body: 'M20,70 L20,55 Q20,50 25,50 L135,50 Q140,50 140,55 L140,70 Q140,75 135,75 L25,75 Q20,75 20,70 Z',
    roof: 'M45,50 L55,30 Q58,25 65,25 L95,25 Q102,25 105,30 L115,50 Z',
    label: 'Berline',
  },
  suv: {
    body: 'M18,72 L18,52 Q18,48 22,48 L138,48 Q142,48 142,52 L142,72 Q142,76 138,76 L22,76 Q18,76 18,72 Z',
    roof: 'M40,48 L48,26 Q50,22 56,22 L104,22 Q110,22 112,26 L120,48 Z',
    label: 'SUV',
  },
  sportive: {
    body: 'M15,68 L15,56 Q15,52 20,52 L140,52 Q145,52 145,56 L145,68 Q145,72 140,72 L20,72 Q15,72 15,68 Z',
    roof: 'M55,52 L62,35 Q64,32 68,32 L92,32 Q96,32 98,35 L105,52 Z',
    label: 'Sportive',
  },
  mini: {
    body: 'M25,68 L25,55 Q25,51 30,51 L130,51 Q135,51 135,55 L135,68 Q135,72 130,72 L30,72 Q25,72 25,68 Z',
    roof: 'M50,51 L56,33 Q58,29 63,29 L97,29 Q102,29 104,33 L110,51 Z',
    label: 'Mini',
  },
  van: {
    body: 'M20,72 L20,48 Q20,44 24,44 L136,44 Q140,44 140,48 L140,72 Q140,76 136,76 L24,76 Q20,76 20,72 Z',
    roof: 'M20,44 L28,24 Q30,20 35,20 L125,20 Q130,20 132,24 L140,44 Z',
    label: 'Van',
  },
  pickup: {
    body: 'M18,72 L18,52 Q18,48 22,48 L142,48 Q146,48 146,52 L146,72 Q146,76 142,76 L22,76 Q18,76 18,72 Z',
    roof: 'M35,48 L42,28 Q44,24 48,24 L90,24 Q94,24 96,28 L103,48 Z',
    label: 'Pick-up',
  },
};

export default function CarSVG({ type = 'berline', color = '#1E88E5', size = 120 }: CarSVGProps) {
  const car = CAR_SHAPES[type] || CAR_SHAPES.berline;
  const ratio = size / 160;

  return (
    <svg width={size} height={size * 0.625} viewBox="0 0 160 100">
      {/* Shadow */}
      <ellipse cx={80} cy={92} rx={55} ry={5} fill="#000" opacity={0.15} />

      {/* Body */}
      <path d={car.body} fill={color} />
      {/* Roof */}
      <path d={car.roof} fill={color} />

      {/* Body highlight */}
      <path d={car.body} fill="white" opacity={0.08} />

      {/* Windshield */}
      <path d={car.roof} fill="#87CEEB" opacity={0.7} transform="scale(0.85) translate(12, 8)" />

      {/* Headlights */}
      <circle cx={25} cy={62} r={5} fill="#FFD93D" />
      <circle cx={25} cy={62} r={2.5} fill="white" opacity={0.7} />
      <circle cx={135} cy={62} r={5} fill="#FF4444" opacity={0.6} />

      {/* Bumper */}
      <rect x={28} y={73} width={104} height={5} rx={2.5} fill="#C0C0C0" opacity={0.6} />

      {/* Wheels */}
      <circle cx={48} cy={80} r={10} fill="#333" />
      <circle cx={48} cy={80} r={5} fill="#777" />
      <circle cx={48} cy={80} r={2} fill="#555" />
      <circle cx={112} cy={80} r={10} fill="#333" />
      <circle cx={112} cy={80} r={5} fill="#777" />
      <circle cx={112} cy={80} r={2} fill="#555" />
    </svg>
  );
}

export function getCarTypes() {
  return Object.entries(CAR_SHAPES).map(([key, val]) => ({
    id: key,
    label: val.label,
  }));
}

export const CAR_COLORS = [
  { id: '#E53935', label: 'Rouge' },
  { id: '#1E88E5', label: 'Bleu' },
  { id: '#43A047', label: 'Vert' },
  { id: '#FDD835', label: 'Jaune' },
  { id: '#FF9800', label: 'Orange' },
  { id: '#E91E63', label: 'Rose' },
  { id: '#8E24AA', label: 'Violet' },
  { id: '#424242', label: 'Noir' },
];
