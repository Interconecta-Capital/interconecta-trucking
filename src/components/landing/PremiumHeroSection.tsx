
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PremiumHeroSection = () => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Trigger animations on mount
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center px-space-6 py-space-32 overflow-hidden">
      {/* Animated Grid Background */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 49%, var(--gray-10) 50%, transparent 51%), linear-gradient(0deg, transparent 49%, var(--gray-10) 50%, transparent 51%)',
          backgroundSize: '80px 80px',
          animation: 'grid-move 60s linear infinite'
        }}
      />
      
      {/* Radial Gradients */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(26, 105, 250, 0.03) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(26, 105, 250, 0.02) 0%, transparent 50%)'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div 
          className={`inline-flex items-center gap-space-2 bg-gray-10 border border-gray-20 px-space-4 py-space-2 rounded-radius-full text-caption text-gray-70 mb-space-8 transition-all duration-1000 ${
            revealed ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'
          }`}
          style={{ animationDelay: '0.2s', animation: revealed ? 'float 6s ease-in-out infinite' : 'none' }}
        >
          <span>⚡</span>
          <span>Primera IA mexicana para transportistas</span>
        </div>

        {/* Title */}
        <h1 
          className={`text-hero mb-space-6 transition-all duration-1000 ${
            revealed ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'
          }`}
          style={{ 
            animationDelay: '0.4s',
            background: 'linear-gradient(135deg, var(--pure-black) 0%, var(--gray-60) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Carta Porte.<br />
          Completamente<br />
          <em 
            style={{
              fontStyle: 'normal',
              background: 'linear-gradient(135deg, var(--blue-interconecta), var(--blue-hover))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            automática
          </em>.
        </h1>

        {/* Subtitle */}
        <p 
          className={`text-body-xl text-gray-60 mb-space-10 max-w-2xl mx-auto transition-all duration-1000 ${
            revealed ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'
          }`}
          style={{ animationDelay: '0.6s' }}
        >
          La única plataforma que genera, valida y timbra tus cartas porte SAT en menos de 4 minutos. Sin errores. Sin multas. Sin complicaciones.
        </p>

        {/* Actions */}
        <div 
          className={`flex flex-col sm:flex-row gap-space-4 justify-center items-center mb-space-16 transition-all duration-1000 ${
            revealed ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'
          }`}
          style={{ animationDelay: '0.8s' }}
        >
          <Link to="/auth/trial">
            <button className="btn-primary interactive">
              <span>Ver demo en vivo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <a href="#características">
            <button className="btn-secondary interactive">
              <span>Cómo funciona</span>
            </button>
          </a>
        </div>

        {/* Device Mockup */}
        <div 
          className={`max-w-4xl mx-auto transition-all duration-1000 ${
            revealed ? 'opacity-100 transform-none' : 'opacity-0 translate-y-10'
          }`}
          style={{ animationDelay: '1.0s' }}
        >
          <div className="relative bg-pure-white rounded-radius-24 p-space-6 overflow-hidden border border-gray-20">
            {/* Floating Notifications */}
            <div 
              className="absolute top-1/5 -right-5 bg-pure-white border border-gray-20 rounded-radius-12 px-space-4 py-space-3 text-body-sm text-gray-70 z-10"
              style={{ 
                boxShadow: 'var(--shadow-lg)',
                animation: 'float-notification 8s ease-in-out infinite',
                animationDelay: '-2s'
              }}
            >
              ✅ Carta CP-2847 generada
            </div>
            
            <div 
              className="absolute bottom-1/3 -left-8 bg-pure-white border border-gray-20 rounded-radius-12 px-space-4 py-space-3 text-body-sm text-gray-70 z-10"
              style={{ 
                boxShadow: 'var(--shadow-lg)',
                animation: 'float-notification 8s ease-in-out infinite',
                animationDelay: '-4s'
              }}
            >
              🚛 TRK-005 en ruta a Guadalajara
            </div>

            <div 
              className="absolute top-3/5 -right-10 bg-pure-white border border-gray-20 rounded-radius-12 px-space-4 py-space-3 text-body-sm text-gray-70 z-10"
              style={{ 
                boxShadow: 'var(--shadow-lg)',
                animation: 'float-notification 8s ease-in-out infinite',
                animationDelay: '-6s'
              }}
            >
              💡 IA sugiere ruta optimizada
            </div>

            {/* Device Header */}
            <div className="flex items-center gap-space-2 pb-space-4 border-b border-gray-20 mb-space-6">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-auto text-body-sm font-semibold text-gray-70">
                Interconecta — Panel de control
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-4 mb-space-6">
              <div className="bg-gray-05 border border-gray-20 rounded-radius-12 p-space-5 text-left group hover:bg-pure-white hover:shadow-shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-caption text-gray-60 mb-space-2">Viajes activos</div>
                <div className="text-mono text-3xl font-bold text-pure-black mb-space-1">12</div>
                <div className="text-body-sm font-semibold text-blue-interconecta">+3 esta semana</div>
              </div>
              
              <div className="bg-gray-05 border border-gray-20 rounded-radius-12 p-space-5 text-left group hover:bg-pure-white hover:shadow-shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-caption text-gray-60 mb-space-2">Ingresos mensuales</div>
                <div className="text-mono text-3xl font-bold text-pure-black mb-space-1">$287K</div>
                <div className="text-body-sm font-semibold text-blue-interconecta">+18% vs. anterior</div>
              </div>
              
              <div className="bg-gray-05 border border-gray-20 rounded-radius-12 p-space-5 text-left group hover:bg-pure-white hover:shadow-shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-caption text-gray-60 mb-space-2">Tiempo promedio</div>
                <div className="text-mono text-3xl font-bold text-pure-black mb-space-1">
                  3.2<span className="text-lg text-gray-60">mín</span>
                </div>
                <div className="text-body-sm font-semibold text-blue-interconecta">Automatización IA</div>
              </div>
              
              <div className="bg-gray-05 border border-gray-20 rounded-radius-12 p-space-5 text-left group hover:bg-pure-white hover:shadow-shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-caption text-gray-60 mb-space-2">Errores SAT</div>
                <div className="text-mono text-3xl font-bold text-pure-black mb-space-1">0</div>
                <div className="text-body-sm font-semibold text-blue-interconecta">Perfección total</div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="bg-blue-light border border-blue-interconecta/20 rounded-radius-8 px-space-4 py-space-3 text-center text-body-sm font-semibold text-blue-interconecta">
              ✨ Todas las cartas se generan automáticamente
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumHeroSection;
