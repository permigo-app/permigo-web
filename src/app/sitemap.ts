import { absoluteUrl } from '@/lib/site';

// Le sitemap ne doit lister que des pages PUBLIQUES et indexables. Les écrans
// de l'application (accueil connecté, leçons, examen…) exigent un compte :
// les y mettre ferait crawler Google dans le vide.
export default function sitemap() {
  const now = new Date();
  return [
    { url: absoluteUrl('/'),        lastModified: now, changeFrequency: 'weekly' as const,  priority: 1.0 },
    { url: absoluteUrl('/register'), lastModified: now, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: absoluteUrl('/premium'),  lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: absoluteUrl('/login'),    lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: absoluteUrl('/privacy'),  lastModified: now, changeFrequency: 'yearly' as const,  priority: 0.3 },
    { url: absoluteUrl('/terms'),    lastModified: now, changeFrequency: 'yearly' as const,  priority: 0.3 },
  ];
}
