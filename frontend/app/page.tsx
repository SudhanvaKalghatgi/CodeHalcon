import HalconHero from '@/components/HalconHero';
import HowItWorks from '@/components/landing/HowItWorks';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import StatsBar from '@/components/landing/StatsBar';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/Footer';
import ScrollbarObserver from '@/components/landing/ScrollbarObserver';

export const metadata = {
  title: 'CodeHalcon — AI-Powered Pull Request Review',
  description:
    'CodeHalcon is an AI code review tool that observes, detects, and eliminates critical issues before they reach production.',
};

export default function HomePage() {
  return (
    <>
      <ScrollbarObserver />
      <HalconHero />
      <main className="relative z-20 bg-[#0a0a0a] text-white">
        <HowItWorks />
        <FeaturesGrid />
        <StatsBar />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
