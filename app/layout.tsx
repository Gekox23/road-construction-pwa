import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vezénylő Rendszer',
  description: 'Útépítés – mélyépítés irányító rendszer',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
  icons: { icon: '/favicon.ico', apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  themeColor: '#141312',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body>{children}</body>
    </html>
  );
}
