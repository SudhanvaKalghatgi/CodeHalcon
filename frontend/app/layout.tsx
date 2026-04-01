import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import AISystemBackground from '@/components/AISystemBackground';
import AuthProvider from '@/components/AuthProvider';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CodeHalcon — AI-Powered Code Review',
  description: 'AI-powered pull request review that detects critical issues before they reach production.',
  icons: {
    icon: '/icon.svg?v=7',
    apple: '/icon.svg?v=7',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-[#050505] text-white">
        <div className="relative min-h-screen overflow-x-hidden">
          {/*
            Single static gradient layer — replaces the previous three overlapping
            background divs (gradient + glow + grid + noise). They all painted
            independently. Now the grid and noise come from globals.css classes
            which have contain: strict and only paint once.
          */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#040404] to-[#0a0a0a]" />
            {/* Top center glow — pre-baked radial gradient, no filter:blur */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: '800px',
                height: '400px',
                background:
                  'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)',
              }}
            />
            {/* Grid and noise — static layers with contain:strict in globals.css */}
            <div className="absolute inset-0 ambient-grid pointer-events-none" />
            <div className="absolute inset-0 ambient-noise pointer-events-none" />
          </div>

          {/* Inner page background — only renders on non-home routes */}
          <AISystemBackground />

          <AuthProvider>
            <div className="relative z-10 flex flex-col min-h-screen">
              {children}
              <BottomNav />
            </div>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}