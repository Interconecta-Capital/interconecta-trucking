
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import ROICalculator from "@/components/landing/ROICalculator";
import USPSection from "@/components/landing/USPSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-interconecta-bg-alternate to-white">
      <Header />
      <HeroSection />
      <ROICalculator />
      <USPSection />
      <FeaturesSection />
      <PricingSection />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
