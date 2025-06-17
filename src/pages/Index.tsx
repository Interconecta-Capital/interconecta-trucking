
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

const Index = () => {
  const { loading } = useAuthRedirect();

  // Mostrar un loader premium mientras verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-blue-interconecta border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-70 font-medium">Cargando experiencia premium...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pure-white">
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
