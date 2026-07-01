import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vezénylő Rendszer',
  description: 'PWA-alapú leltározó és vezénylési rendszer',
  manifest: '/manifest.json',
  themeColor: '#f97316',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Vezénylő' },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <body className={`${inter.className} bg-gray-950 antialiased`}>{children}</body>
    </html>
  );
}
