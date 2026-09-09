/**
 * Adresse canonique du site — source unique de vérité.
 *
 * IMPORTANT : c'est bien la version **www**. Le domaine nu (mypermigo.be)
 * redirige vers www.mypermigo.be côté Vercel. Tant que le code déclarait
 * l'apex comme adresse officielle, on disait à Google « la version de
 * référence est ici » en le renvoyant vers une adresse qui le redirige
 * ailleurs — c'est la raison principale pour laquelle le site n'était pas
 * indexé.
 *
 * Si un jour la redirection est inversée dans Vercel (www → apex), c'est
 * cette constante qu'il faut changer, et elle seule.
 */
export const SITE_URL = 'https://www.mypermigo.be';

/** URL absolue d'une page, à partir d'un chemin ('/premium'). */
export function absoluteUrl(path = '/'): string {
  return path === '/' ? SITE_URL : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
