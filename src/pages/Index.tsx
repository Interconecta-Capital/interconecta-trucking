
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import USPSection from "@/components/landing/USPSection";
import ROICalculator from "@/components/landing/ROICalculator";
import PricingSection from "@/components/landing/PricingSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { usePremiumAnimations } from "@/hooks/usePremiumAnimations";
import { useEffect } from "react";

const Index = () => {
  const { loading } = useAuthRedirect();
  
  // Initialize premium animations
  usePremiumAnimations();

  // Mostrar un loader simple mientras verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-interconecta-bg-alternate to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interconecta-primary mx-auto mb-4"></div>
          <p className="text-interconecta-text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <USPSection />
      <ROICalculator />
      <PricingSection />
      <BenefitsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
