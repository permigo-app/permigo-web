'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Page dépréciée — l'accueil (thème par thème) remplace cette liste globale.
export default function LeconsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/app'); }, [router]);
  return null;
}
