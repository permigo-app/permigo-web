'use client';

import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';

interface PremiumGateProps {
  children: React.ReactNode;
}

export default function PremiumGate({ children }: PremiumGateProps) {
  const { t } = useLang();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="bg-[#1e293b] rounded-2xl p-8 border border-yellow-500/30">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {t('premium_bloque_titre')}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {t('premium_bloque_msg')}
          </p>
          <button
            onClick={() => router.push('/premium')}
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-400 hover:to-orange-400 transition-all"
          >
            {t('premium_bloque_btn')}
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
