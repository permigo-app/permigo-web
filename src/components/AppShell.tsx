'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PremiumBanner from '@/components/PremiumBanner';
import RewardOverlay from '@/components/RewardOverlay';
import { supabase, hasSupabase } from '@/lib/supabase';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/auth';
  const isAdminPage = pathname.startsWith('/admin');

  useEffect(() => {
    const localDone = localStorage.getItem('@onboarding_done') === 'true';
    if (localDone) {
      setOnboardingDone(true);
      return;
    }

    // localStorage vide — vérifie si une session Supabase active existe avant de rediriger
    if (hasSupabase && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Session active → restaure les marqueurs et laisse passer
          localStorage.setItem('@onboarding_done', 'true');
          document.cookie = 'onboarding_done=true; path=/; max-age=31536000; SameSite=Lax';
          setOnboardingDone(true);
        } else {
          setOnboardingDone(false);
        }
      });
    } else {
      setOnboardingDone(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (onboardingDone === null) return;
    if (!onboardingDone && !isAuthPage && !isAdminPage) {
      router.replace('/login');
    }
  }, [onboardingDone, isAuthPage, isAdminPage, router]);

  // Still loading — fond opaque pour éviter le FOUC
  if (onboardingDone === null) return <div style={{ background: 'var(--bg-primary)', width: '100vw', height: '100vh' }} />;

  // Auth / admin pages — no navbar, no margin
  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  // Normal app layout
  return (
    <>
      <Navbar />
      <PremiumBanner />
      <main className="pt-11 lg:pt-16 lg:ml-[240px] pb-20 lg:pb-6">
        {children}
      </main>
      {/* Animations de récompense — persistantes entre navigations */}
      <RewardOverlay />
    </>
  );
}
