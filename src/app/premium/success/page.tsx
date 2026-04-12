'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';
import { setPremium } from '@/lib/premium';
import Gaston from '@/components/Gaston';

export default function PremiumSuccessPage() {
  const { t } = useLang();
  const router = useRouter();

  useEffect(() => {
    setPremium(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Gaston */}
        <div className="flex justify-center mb-6">
          <Gaston expression="happy" />
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] rounded-2xl p-8 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <h1 className="text-2xl font-bold text-white mb-4">
            {t('premium_success_titre')} 🎉
          </h1>

          <p className="text-gray-300 mb-6">
            {t('premium_success_msg')}
          </p>

          {/* Gaston bubble */}
          <div className="bg-[#0f172a] rounded-xl p-4 mb-8 border border-cyan-500/20">
            <p className="text-cyan-300 italic text-sm">
              &ldquo;{t('premium_success_gaston')}&rdquo;
            </p>
            <p className="text-gray-500 text-xs mt-1">— Prof. Gaston</p>
          </div>

          <button
            onClick={() => router.push('/app')}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-all"
          >
            {t('premium_success_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
