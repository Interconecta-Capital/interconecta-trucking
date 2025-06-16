
import React from 'react';
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { usePremiumAnimations } from "@/hooks/usePremiumAnimations";
import PremiumHeader from "@/components/landing/PremiumHeader";
import PremiumHeroSection from "@/components/landing/PremiumHeroSection";
import PremiumFeaturesSection from "@/components/landing/PremiumFeaturesSection";
import PremiumTrustSection from "@/components/landing/PremiumTrustSection";
import PremiumTestimonialSection from "@/components/landing/PremiumTestimonialSection";
import PremiumPricingSection from "@/components/landing/PremiumPricingSection";
import PremiumCTASection from "@/components/landing/PremiumCTASection";
import PremiumFooter from "@/components/landing/PremiumFooter";

const Index = () => {
  const { loading } = useAuthRedirect();
  usePremiumAnimations();

  // Show premium loading experience
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-8 h-8 border-2 border-blue-interconecta border-t-transparent rounded-full mx-auto mb-4"
            style={{ animation: 'spin 1s linear infinite' }}
          ></div>
          <p className="text-gray-60">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial">
      <PremiumHeader />
      <PremiumHeroSection />
      <PremiumTrustSection />
      <PremiumFeaturesSection />
      <PremiumTestimonialSection />
      <PremiumPricingSection />
      <PremiumCTASection />
      <PremiumFooter />
    </div>
  );
};

export default Index;
