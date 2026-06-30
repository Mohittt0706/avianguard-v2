import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { ProblemSection } from '../components/landing/ProblemSection';
import { SolutionSection } from '../components/landing/SolutionSection';
import { DashboardPreviewSection } from '../components/landing/DashboardPreviewSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { UsersSection } from '../components/landing/UsersSection';
import { StatsSection } from '../components/landing/StatsSection';
import { TechStackSection } from '../components/landing/TechStackSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-['Inter',sans-serif]">
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <DashboardPreviewSection />
      <FeaturesSection />
      <UsersSection />
      <StatsSection />
      <TechStackSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
