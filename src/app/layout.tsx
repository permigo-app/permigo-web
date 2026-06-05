import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sora',
});

export const metadata: Metadata = {
  title: {
    default: 'MyPermiGo — Permis Théorique Belge Gratuit',
    template: '%s | MyPermiGo',
  },
  description: 'MyPermiGo : prépare ton permis théorique belge gratuitement. 2286 questions officielles, mode Turbo, examen blanc, panneaux. FR et NL.',
  keywords: 'mypermigo, permis théorique belge, code de la route belgique, examen théorique permis, questions permis belge, rijbewijs theorie belgie',
  metadataBase: new URL('https://mypermigo.be'),
  openGraph: {
    title: 'MyPermiGo — Permis Théorique Belge',
    description: 'Prépare ton permis belge gratuitement. 2286 questions officielles, gamifié, FR + NL.',
    url: 'https://mypermigo.be',
    siteName: 'MyPermiGo',
    locale: 'fr_BE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'MyPermiGo — Permis Théorique Belge',
    description: 'Prépare ton permis belge gratuitement. 2286 questions officielles.',
  },
  alternates: {
    canonical: 'https://mypermigo.be',
  },
  verification: {
    google: 'XRHdIgFO0_O_ZQ4RDynByQDcXc0x4mdUtx3RlTgx4C4',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={sora.variable}>
      <head>
        <meta name="google-site-verification" content="XRHdIgFO0_O_ZQ4RDynByQDcXc0x4mdUtx3RlTgx4C4" />
        {/* Anti-flash: applique le thème avant tout rendu CSS */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){try{var t=localStorage.getItem('permigo_theme');if(!t)t=window.matchMedia('(prefers-color-scheme: dark)').matches?'night':'day';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();
        `}} />
        {/* Force-hide iubenda floating widget — links are in the footer */}
        <style>{`
          #iubenda-cs-banner, #iubenda-widget,
          [class*="iubenda"], [id*="iubenda"],
          .iubenda-tp-btn, .iubenda-tp-circle,
          ._iub_cs_activate, .__iub_opt_out_iframe {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `}</style>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          type="text/javascript"
          src="https://embeds.iubenda.com/widgets/beada13f-591a-4009-9e09-ae66b8d57cc6.js"
          async
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppShell>
              {children}
            </AppShell>
            <footer className="py-3 px-6 text-center" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-disabled)' }}>© 2025-2026 MyPermiGo</span>

                <a href="https://www.iubenda.com/privacy-policy/43486445"
                   className="iubenda-white iubenda-noiframe iubenda-embed"
                   target="_blank"
                   style={{ fontSize: '12px', color: 'var(--text-disabled)', textDecoration: 'none' }}>
                  Politique de confidentialité
                </a>

                <a href="https://www.iubenda.com/privacy-policy/43486445/cookie-policy"
                   className="iubenda-white iubenda-noiframe iubenda-embed"
                   target="_blank"
                   style={{ fontSize: '12px', color: 'var(--text-disabled)', textDecoration: 'none' }}>
                  Politique relative aux Cookies
                </a>

                <Link href="/terms" style={{ fontSize: '12px', color: 'var(--text-disabled)', textDecoration: 'none' }}>
                  CGU
                </Link>
              </div>

              <Script id="iubenda-script" strategy="lazyOnload">
                {`(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);`}
              </Script>
            </footer>
          </AuthProvider>
        </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
