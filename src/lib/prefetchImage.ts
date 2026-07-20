'use client';

/**
 * Précharge une image en arrière-plan pendant que l'utilisateur lit la
 * question courante, pour que le passage à la question suivante affiche
 * son illustration instantanément (déjà en cache navigateur).
 */
export function prefetchImage(url: string | undefined | null): void {
  if (!url || typeof window === 'undefined') return;
  const img = new window.Image();
  img.src = url;
}
