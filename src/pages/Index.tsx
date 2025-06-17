
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import TrustSection from "@/components/landing/TrustSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialSection from "@/components/landing/TestimonialSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const Index = () => {
  const { loading } = useAuthRedirect();

  // Mostrar un loader premium mientras verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-05 flex items-center justify-center">
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
      <TrustSection />
      <FeaturesSection />
      <TestimonialSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
