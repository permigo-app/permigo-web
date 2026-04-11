'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PremiumBanner from '@/components/PremiumBanner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    const done = localStorage.getItem('@onboarding_done') === 'true';
    setOnboardingDone(done);
  }, [pathname]);

  const isFullPage = pathname === '/onboarding' || pathname === '/auth' || pathname === '/login' || pathname === '/register' || pathname === '/landing';

  // Full-page routes — no navbar, no margin, no redirect
  if (isFullPage) {
    return <>{children}</>;
  }

  // Still loading — fond opaque pour éviter le FOUC
  if (onboardingDone === null) return <div style={{ background: '#0a0e2a', width: '100vw', height: '100vh' }} />;

  // Normal app layout
  return (
    <>
      <Navbar />
      <PremiumBanner />
      <main className="pt-11 lg:pt-0 lg:ml-[250px] pb-20 lg:pb-6">
        {children}
      </main>
    </>
  );
}
