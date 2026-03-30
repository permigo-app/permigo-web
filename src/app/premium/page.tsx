'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Gaston from '@/components/Gaston';

export default function PremiumPage() {
  const { t } = useLang();
  const { supabaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: supabaseUser?.id || 'guest',
          email: supabaseUser?.email || '',
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(t('premium_erreur'));
        setLoading(false);
      }
    } catch {
      setError(t('premium_erreur'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Gaston */}
        <div className="flex justify-center mb-6">
          <Gaston expression="happy" />
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] rounded-2xl p-8 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {t('premium_titre')} 🚗
          </h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            {t('premium_subtitle')}
          </p>

          {/* Avantages */}
          <div className="space-y-4 mb-8">
            {[
              { icon: '📚', text: t('premium_avantage_1') },
              { icon: '📝', text: t('premium_avantage_2') },
              { icon: '⚡', text: t('premium_avantage_3') },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#0f172a] rounded-xl p-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-white font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Prix */}
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-cyan-400">{t('premium_prix')}</span>
            <p className="text-gray-400 text-sm mt-1">{t('premium_annulable')}</p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          )}

          {/* Bouton subscribe */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50"
          >
            {loading ? t('premium_loading') : t('premium_souscrire')}
          </button>

          {/* Lien gratuit */}
          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 text-gray-500 text-sm hover:text-gray-300 transition-colors"
          >
            {t('premium_gratuit')}
          </button>
        </div>
      </div>
    </div>
  );
}
