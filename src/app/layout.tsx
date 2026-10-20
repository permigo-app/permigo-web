import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { SITE_URL } from '@/lib/site';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sora',
});

export const metadata: Metadata = {
  title: {
    default: 'MyPermiGo · Permis Théorique Belge Gratuit',
    template: '%s | MyPermiGo',
  },
  description: 'MyPermiGo : prépare ton permis théorique belge gratuitement. plus de 1 500 questions, mode Turbo, examen blanc, panneaux. FR et NL.',
  keywords: 'mypermigo, permis théorique belge, code de la route belgique, examen théorique permis, questions permis belge, rijbewijs theorie belgie',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'MyPermiGo · Permis Théorique Belge',
    description: 'Prépare ton permis belge gratuitement. plus de 1 500 questions, FR + NL.',
    url: SITE_URL,
    siteName: 'MyPermiGo',
    locale: 'fr_BE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'MyPermiGo · Permis Théorique Belge',
    description: 'Prépare ton permis belge gratuitement. plus de 1 500 questions.',
  },
  // PAS de canonical global ici : il s'appliquerait à TOUTES les pages, qui
  // déclareraient alors la page d'accueil comme leur version de référence.
  // Google les traiterait comme des doublons et n'en indexerait aucune.
  // Chaque page publique déclare sa propre canonical.
  verification: {
    google: 'XRHdIgFO0_O_ZQ4RDynByQDcXc0x4mdUtx3RlTgx4C4',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={sora.variable}>
      <head>
        <meta name="google-site-verification" content="XRHdIgFO0_O_ZQ4RDynByQDcXc0x4mdUtx3RlTgx4C4" />
        {/* Ouvre la connexion vers Supabase pendant que la page se charge,
            au lieu d'attendre le premier appel d'authentification pour le faire */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        {/* Anti-flash: applique le thème avant tout rendu CSS */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){try{var t=localStorage.getItem('permigo_theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'night':'day';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
        `}} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppShell>
              {children}
            </AppShell>
            <footer className="pied-site py-3 px-6 text-center" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>© 2025-2026 MyPermiGo</span>

                <Link href="/privacy" style={{ fontSize: '12px', color: 'var(--text-disabled)', textDecoration: 'none' }}>
                  Confidentialité et cookies
                </Link>

                <Link href="/terms" style={{ fontSize: '12px', color: 'var(--text-disabled)', textDecoration: 'none' }}>
                  CGU
                </Link>
              </div>
            </footer>
          </AuthProvider>
        </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
