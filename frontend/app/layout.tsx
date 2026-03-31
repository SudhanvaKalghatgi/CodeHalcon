import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import AISystemBackground from '@/components/AISystemBackground';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Code Halcon — AI-Powered Bug Detection',
  description:
    'Code Halcon: an AI system that observes, detects, and eliminates bugs with the precision of a hawk.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="bg-[#050505] text-white">
        
        {/* Global App Background Wrapper */}
        <div className="relative min-h-screen overflow-x-hidden">
          
          {/* Base Gradient Layer — static, paints once */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#040404] to-[#0a0a0a] -z-10" />
          
          {/* 
            Top Center Light Glow — replaced blur-[100px] with a pre-blurred 
            radial gradient. blur() is a paint-time filter that costs ~5ms per 
            repaint. A gradient achieves the same visual at zero cost.
          */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 pointer-events-none"
            style={{
              width: '800px',
              height: '400px',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)',
            }}
          />
          
          {/* Subtle Grid & Noise — static layers with contain: strict */}
          <div className="absolute inset-0 ambient-grid pointer-events-none -z-10" />
          <div className="absolute inset-0 ambient-noise pointer-events-none -z-10" />
          
          {/* Dynamic interactive Data Stream/Neural Net mimicking hero process */}
          <AISystemBackground />

          {/* Content Wrapper */}
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
            <BottomNav />
          </div>

        </div>

      </body>
    </html>
  );
}
