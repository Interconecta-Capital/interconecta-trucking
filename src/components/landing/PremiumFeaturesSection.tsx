
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileSpreadsheet, Zap, FileText, Bot, Users, BarChart3, Shield, Sparkles } from "lucide-react";

const PremiumFeaturesSection = () => {
  const features = [
    {
      icon: "🤖",
      title: "IA 100% mexicana",
      description: "Primera inteligencia artificial entrenada exclusivamente en regulaciones SAT mexicanas. Entiende tu negocio y automatiza sin errores.",
      badge: "SAT Compliant"
    },
    {
      icon: "⚡",
      title: "Automatización total",
      description: "Desde la generación hasta el timbrado automático. Tu única responsabilidad es confirmar. Todo lo demás es instantáneo y perfecto.",
      badge: "3.2 min promedio"
    },
    {
      icon: "📱",
      title: "Diseño humano",
      description: "Interfaz pensada para transportistas reales. Funciona en carretera, sincroniza automáticamente y respeta tu forma de trabajar.",
      badge: "Mobile-first"
    }
  ];

  return (
    <section id="características" className="py-space-32 px-space-6 bg-pure-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-space-20 max-w-4xl mx-auto scroll-reveal">
          <div className="inline-flex items-center gap-space-2 bg-gray-10 border border-gray-20 px-space-4 py-space-2 rounded-radius-full text-caption text-gray-70 mb-space-8">
            <span>🧠</span>
            <span>Inteligencia artificial</span>
          </div>
          
          <h2 className="text-display mb-space-6">
            Pensado para transportistas.<br />
            Potenciado por IA mexicana.
          </h2>
          
          <p className="text-body-lg text-gray-60">
            No es solo software. Es tu compañero inteligente que entiende el transporte mexicano 
            y automatiza todo lo que necesitas para cumplir perfectamente con el SAT.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-pure-white border border-gray-20 rounded-radius-16 p-space-8 text-center relative overflow-hidden group scroll-reveal transition-all duration-500 hover:-translate-y-2 hover:shadow-shadow-xl hover:border-gray-30"
            >
              {/* Gradient Border on Hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-interconecta to-blue-hover scale-x-0 origin-left transition-transform duration-700 group-hover:scale-x-100"></div>
              
              {/* Icon */}
              <div className="w-20 h-20 bg-blue-light rounded-radius-16 flex items-center justify-center mx-auto mb-space-6 text-4xl transition-all duration-300 group-hover:bg-blue-interconecta group-hover:scale-110">
                <span className="group-hover:filter group-hover:invert">{feature.icon}</span>
              </div>
              
              <h3 className="text-subtitle mb-space-4 text-pure-black">{feature.title}</h3>
              
              <p className="text-gray-60 mb-space-6 leading-relaxed">{feature.description}</p>
              
              <span className="inline-block bg-blue-light text-blue-hover px-space-3 py-space-2 rounded-radius-full text-caption font-bold">
                {feature.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumFeaturesSection;
