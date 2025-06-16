
import React from 'react';
import { Link } from 'react-router-dom';

const PremiumPricingSection = () => {
  const features = [
    'Asistente IA Avanzado',
    'Importación Masiva Excel/PDF/XML',
    'Automatización Total de Timbrado',
    'Cartas Porte Inteligentes',
    'Procesamiento Documental OCR',
    'Multi-Tenant Avanzado',
    'Analytics Inteligentes',
    'Seguridad Enterprise',
    'Plantillas Inteligentes'
  ];

  return (
    <section id="precios" className="pricing">
      <div className="pricing-container">
        <div className="section-header scroll-reveal">
          <div className="section-eyebrow">
            <span>💰</span>
            <span>Precios transparentes</span>
          </div>
          
          <h2 className="text-display">
            Precios
          </h2>
          
          <p className="text-body-lg" style={{ color: 'var(--gray-60)', marginTop: 'var(--space-6)' }}>
            Tecnología avanzada con IA para revolucionar tu empresa de transporte
          </p>
        </div>

        <div className="pricing-card scroll-reveal">
          <div className="pricing-badge">MÁS POPULAR</div>
          
          <div className="pricing-amount">
            <span className="pricing-currency">$</span>
            <span className="pricing-price text-mono">Contacto</span>
            <span className="pricing-period">/mes</span>
          </div>
          
          <p className="pricing-description">
            Precio personalizado según necesidades
          </p>
          
          <ul className="pricing-features">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          
          <Link to="/auth/trial" className="block w-full">
            <button className="btn-primary pricing-cta interactive">
              Prueba 14 días gratis
            </button>
          </Link>
          
          <p className="pricing-note">
            Sin tarjeta de crédito • Sin compromiso • Cancelación inmediata
          </p>
        </div>
      </div>
    </section>
  );
};

export default PremiumPricingSection;
