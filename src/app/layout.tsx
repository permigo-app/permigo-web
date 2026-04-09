import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'MyPermiGo — Permis de conduire belge',
  description: 'Prépare ton permis de conduire théorique belge avec MyPermiGo !',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
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
            <footer style={{ background: '#0a0e2a', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span>© 2025 MyPermiGo</span>
                <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Politique de confidentialité</Link>
                <Link href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>CGU</Link>
              </p>
            </footer>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
