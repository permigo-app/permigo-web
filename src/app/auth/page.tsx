'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Page dépréciée — remplacée par /login et /register (design unifié).
export default function AuthPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/register'); }, [router]);
  return null;
}
