
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, Suspense } from "react";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import VisionSection from "@/components/landing/VisionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WizardFlowSection from "@/components/landing/WizardFlowSection";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

// Skeleton loaders para mejor UX
const ContentSkeleton = () => (
  <div className="animate-pulse space-y-8 p-8">
    <div className="h-64 bg-gray-800 rounded-lg"></div>
    <div className="h-32 bg-gray-800 rounded-lg"></div>
    <div className="h-48 bg-gray-800 rounded-lg"></div>
  </div>
);

export default function Index() {
  const navigate = useNavigate();
  const { user, loading, initialized } = useAuth();

  // Redirigir usuarios autenticados al dashboard
  useEffect(() => {
    if (initialized && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, initialized, navigate]);

  // Mostrar landing page inmediatamente (Header y Hero)
  // Auth check se hace en segundo plano
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Header />
      <HeroSection />
      
      <main className="max-w-7xl mx-auto">
        {/* Suspense boundaries para cargar contenido no crítico */}
        <Suspense fallback={<ContentSkeleton />}>
          <VisionSection />
          <FeaturesSection />
          <WizardFlowSection />
          <PricingSection />
          <CTASection />
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}
