
import React from 'react';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import NewPricingSection from '@/components/landing/NewPricingSection';
import { AddOnsSection } from '@/components/landing/AddOnsSection';
import ProvenResultsSection from '@/components/landing/ProvenResultsSection';
import TestimonialSection from '@/components/landing/TestimonialSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-pure-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <ProvenResultsSection />
      <TestimonialSection />
      <NewPricingSection />
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 max-w-screen-xl">
          <AddOnsSection />
        </div>
      </div>
      <CTASection />
      <Footer />
    </div>
  );
}
