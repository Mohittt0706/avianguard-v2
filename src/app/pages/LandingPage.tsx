import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { ProblemSolutionSection } from '../components/landing/ProblemSolutionSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { StatsSection } from '../components/landing/StatsSection';
import { FlowSection } from '../components/landing/FlowSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';
import ScrollVelocitySection from '../components/dashboard/ScrollVelocitySection';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white font-['Inter',sans-serif]" style={{ backgroundColor: '#030712' }}>
      <Navbar />
      <Hero />
      <ScrollVelocitySection
        topText="AI Powered Monitoring  •  Real-Time Wetland Protection  •  IoT Sensor Network  •  Environmental Intelligence  •  Predictive AI  •  Instant SMS Alerts  •  "
        bottomText="Government Command Center  •  Nal Sarovar Pilot Project  •  Future Gujarat Expansion  •  Wetland Conservation  •  AI Powered Monitoring  •  Real-Time Wetland Protection  •  "
        topSpeed={3}
        bottomSpeed={-4}
        topOpacity={22}
        bottomOpacity={18}
        topSize="clamp(2.5rem, 5vw, 4.5rem)"
        bottomSize="clamp(2rem, 4vw, 3.5rem)"
        border={false}
      />
      <ProblemSolutionSection />
      <FeaturesSection />
      <StatsSection />
      <FlowSection />
      <CTASection />
      <Footer />
    </div>
  );
}
