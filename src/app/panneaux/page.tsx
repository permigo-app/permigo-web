'use client';

import Link from 'next/link';
import { PANNEAU_CATEGORIES } from '@/lib/constants';

export default function PanneauxPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <h1 className="text-[28px] font-extrabold mb-1">Panneaux</h1>
      <p className="text-sm mb-6" style={{ color: '#8B9DC3' }}>Apprends à reconnaître tous les panneaux</p>

      <div className="flex flex-col gap-3">
        {PANNEAU_CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            href={`/panneaux/${cat.id}`}
            className="flex items-center gap-3 rounded-xl p-3.5 press-scale"
            style={{ background: '#16213E', borderLeft: `4px solid ${cat.color}` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: cat.color + '20' }}
            >
              {cat.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm">{cat.name}</h3>
              <p className="text-[11px]" style={{ color: '#8B9DC3' }}>Catégorie {cat.id}</p>
            </div>
            <span style={{ color: '#5A6B8A' }}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
