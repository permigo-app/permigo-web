'use client';

import { useParams, useRouter } from 'next/navigation';
import { PANNEAU_CATEGORIES } from '@/lib/constants';
import { SIGNS_BY_CATEGORY } from '@/lib/signsData';
import SignImage from '@/components/SignImage';
import Gaston from '@/components/Gaston';

export default function PanneauCategoriePage() {
  const params = useParams();
  const router = useRouter();
  const catId = params.categorie as string;

  const category = PANNEAU_CATEGORIES.find(c => c.id === catId);
  const signs = SIGNS_BY_CATEGORY[catId] || [];

  if (!category) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-xl font-bold">Catégorie introuvable</p>
        <button onClick={() => router.push('/panneaux')} className="mt-4 px-6 py-3 rounded-2xl font-black press-scale" style={{ background: '#00B894' }}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <button onClick={() => router.push('/panneaux')} className="text-sm mb-4 block press-scale" style={{ color: '#8B9DC3' }}>
        ← Retour
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: category.color + '20' }}>
          {category.emoji}
        </div>
        <div>
          <h1 className="text-xl font-extrabold">{category.name}</h1>
          <p className="text-xs" style={{ color: '#8B9DC3' }}>{signs.length} panneaux</p>
        </div>
      </div>

      {signs.length === 0 ? (
        <Gaston expression="thinking" message="Les panneaux de cette catégorie arrivent bientôt !" />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#16213E' }}>
          {signs.map((sign, i) => (
            <div key={sign.code}>
              <div className="flex items-center gap-4 p-4">
                <span className="text-xs font-bold w-6 text-center" style={{ color: '#5A6B8A' }}>{i + 1}</span>
                <SignImage code={sign.code} size={56} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{sign.name}</p>
                </div>
              </div>
              {i < signs.length - 1 && (
                <div className="h-[1px] ml-[76px]" style={{ background: '#2A3550' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
