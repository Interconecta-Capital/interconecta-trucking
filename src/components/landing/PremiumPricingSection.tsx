
import React from 'react';
import { Link } from 'react-router-dom';

const PremiumPricingSection = () => {
  const features = [
    'Cartas porte ilimitadas con IA',
    'Timbrado automático SAT',
    'Dashboard en tiempo real',
    'Aplicación móvil completa',
    'Automatización 24/7',
    'Soporte especializado',
    'Actualizaciones automáticas',
    'Respaldo y seguridad total'
  ];

  return (
    <section id="precios" className="py-space-32 px-space-6 bg-pure-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-space-20 scroll-reveal">
          <div className="inline-flex items-center gap-space-2 bg-gray-10 border border-gray-20 px-space-4 py-space-2 rounded-radius-full text-caption text-gray-70 mb-space-8">
            <span>💰</span>
            <span>Precios transparentes</span>
          </div>
          
          <h2 className="text-display mb-space-6">
            Un precio.<br />
            Todo incluido.
          </h2>
          
          <p className="text-body-lg text-gray-60">
            Sin sorpresas, sin costos ocultos. Automatización completa por menos de lo que cuesta un solo error del SAT.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="relative bg-pure-white border-2 border-blue-interconecta rounded-radius-24 p-space-10 scroll-reveal">
          {/* Badge */}
          <div 
            className="absolute -top-3 left-1/2 bg-blue-interconecta text-pure-white px-space-6 py-space-2 rounded-radius-full text-caption font-bold"
            style={{ transform: 'translateX(-50%)' }}
          >
            MÁS POPULAR
          </div>
          
          {/* Price */}
          <div className="flex items-baseline justify-center gap-space-2 my-space-6">
            <span className="text-2xl font-semibold text-gray-60">$</span>
            <span className="text-mono font-extrabold text-pure-black" style={{ fontSize: '64px' }}>4,500</span>
            <span className="text-lg font-medium text-gray-60">/mes</span>
          </div>
          
          <p className="text-gray-60 mb-space-8 text-center">
            Por empresa, cartas porte ilimitadas
          </p>
          
          {/* Features */}
          <ul className="text-left mb-space-10 space-y-space-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-space-3 text-body text-gray-70">
                <span className="text-blue-interconecta font-bold text-lg">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          
          {/* CTA */}
          <Link to="/auth/trial" className="block w-full mb-space-4">
            <button className="btn-primary w-full interactive">
              Comenzar prueba gratuita de 30 días
            </button>
          </Link>
          
          <p className="text-caption text-gray-50 text-center">
            Sin tarjeta de crédito • Sin compromiso • Cancelación inmediata
          </p>
        </div>
      </div>
    </section>
  );
};

export default PremiumPricingSection;
