
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

const PremiumCTASection = () => {
  return (
    <section id="demo" className="cta">
      <div className="cta-container">
        <h2 className="text-display cta-title">
          ¿Listo para revolucionar tu negocio con IA?
        </h2>
        
        <p className="text-body-xl cta-subtitle">
          Únete a cientos de transportistas que ya usan inteligencia artificial para automatizar sus procesos
        </p>
        
        <div className="cta-actions">
          <Link to="/auth/trial">
            <button className="btn-white interactive">
              <Calendar className="w-5 h-5" />
              <span>Solicitar Demo</span>
            </button>
          </Link>
          <Link to="/auth/register">
            <button className="btn-outline-white interactive">
              <span>Ver Demo</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PremiumCTASection;
