import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { ProblemSolutionSection } from '../components/landing/ProblemSolutionSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { StatsSection } from '../components/landing/StatsSection';
import { FlowSection } from '../components/landing/FlowSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      <Navbar />
      <Hero />
      <ProblemSolutionSection />
      <FeaturesSection />
      <StatsSection />
      <FlowSection />
      <CTASection />
      <Footer />
    </div>
  );
}
