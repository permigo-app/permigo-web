import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'MyPermiGo — Permis Théorique Belge en Mode Jeu',
  description: 'Prépare ton examen théorique belge avec 2286 questions officielles. Gamifié, interactif, FR + NL. Essai gratuit 7 jours.',
  keywords: 'permis belge, code de la route belgique, examen théorique belgique',
  openGraph: {
    title: 'MyPermiGo — Permis Théorique Belge',
    description: "Prépare ton permis belge en t'amusant. 2286 questions officielles.",
    url: 'https://mypermigo.be',
    siteName: 'MyPermiGo',
    locale: 'fr_BE',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
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
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <LanguageProvider>
          <AuthProvider>
            <AppShell>
              {children}
            </AppShell>
            <footer style={{ background: '#0a0e2a', padding: '12px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>© 2025 MyPermiGo</span>

                <a href="https://www.iubenda.com/privacy-policy/43486445"
                   className="iubenda-white iubenda-noiframe iubenda-embed"
                   target="_blank"
                   style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                  Politique de confidentialité
                </a>

                <a href="https://www.iubenda.com/privacy-policy/43486445/cookie-policy"
                   className="iubenda-white iubenda-noiframe iubenda-embed"
                   target="_blank"
                   style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                  Politique relative aux Cookies
                </a>

                <Link href="/terms" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                  CGU
                </Link>
              </div>

              <Script id="iubenda-script" strategy="lazyOnload">
                {`(function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src="https://cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);`}
              </Script>
            </footer>
          </AuthProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
