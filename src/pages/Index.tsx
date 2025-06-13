
import EnhancedHeader from "@/components/landing/Header";
import EnhancedHeroSection from "@/components/landing/EnhancedHeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import USPSection from "@/components/landing/USPSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import InteractiveDemoSection from "@/components/landing/InteractiveDemoSection";
import TrustElementsSection from "@/components/landing/TrustElementsSection";
import ROICalculator from "@/components/landing/ROICalculator";
import PricingSection from "@/components/landing/PricingSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import CTASection from "@/components/landing/CTASection";
import EnhancedFooter from "@/components/landing/EnhancedFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <EnhancedHeader />
      <EnhancedHeroSection />
      <FeaturesSection />
      <USPSection />
      <TestimonialsSection />
      <InteractiveDemoSection />
      <TrustElementsSection />
      <ROICalculator />
      <PricingSection />
      <BenefitsSection />
      <CTASection />
      <EnhancedFooter />
    </div>
  );
};

export default Index;
