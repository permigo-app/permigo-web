import { absoluteUrl } from '@/lib/site';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Pages sans intérêt pour la recherche : réservées aux comptes connectés,
      // ou purement techniques. Les exclure évite de gaspiller le budget de
      // crawl de Google sur des écrans qu'il ne verra jamais vraiment.
      disallow: ['/api/', '/admin/', '/resultats', '/premium/success'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
