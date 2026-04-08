'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PremiumBanner from '@/components/PremiumBanner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    const done = localStorage.getItem('@onboarding_done') === 'true';
    setOnboardingDone(done);
  }, [pathname]);

  const isOnboardingPage = pathname === '/onboarding';

  useEffect(() => {
    if (onboardingDone === null) return;
    if (!onboardingDone && !isOnboardingPage) {
      router.replace('/onboarding');
    }
  }, [onboardingDone, isOnboardingPage, router]);

  // Still loading
  if (onboardingDone === null) return <div className="min-h-screen" />;

  // Onboarding page — no navbar, no margin
  if (isOnboardingPage) {
    return <>{children}</>;
  }

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
