
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import VisionSection from "@/components/landing/VisionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WizardFlowSection from "@/components/landing/WizardFlowSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Index() {
  const navigate = useNavigate();
  const { user, initialized } = useAuth();

  // Redirigir usuarios autenticados al dashboard
  useEffect(() => {
    if (initialized && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, initialized, navigate]);

  // Mostrar landing page inmediatamente
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Header />
      <HeroSection />
      
      <main className="max-w-7xl mx-auto">
        <VisionSection />
        <FeaturesSection />
        <WizardFlowSection />
        <PricingSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}
