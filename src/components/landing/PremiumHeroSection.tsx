
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const PremiumHeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-badge">
          <span>⚡</span>
          <span>Primera Plataforma IA Especializada en Transporte Mexicano</span>
        </div>
        
        <h1 className="text-hero hero-title">
          La Plataforma Completa para<br />
          <span style={{ fontStyle: 'normal', background: 'linear-gradient(135deg, var(--blue-interconecta), var(--blue-hover))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Transportistas Mexicanos
          </span>
        </h1>
        
        <p className="text-body-xl hero-subtitle">
          Gestiona cartas porte con inteligencia artificial, importa datos masivamente y automatiza procesos. 
          Cumple con todas las regulaciones SAT de manera fácil y eficiente.
        </p>
        
        <div className="hero-actions">
          <Link to="/auth/trial">
            <button className="btn-primary interactive">
              <Calendar className="w-5 h-5" />
              <span>Prueba 14 días gratis</span>
            </button>
          </Link>
          <Link to="/auth/login">
            <button className="btn-secondary interactive">
              <LogIn className="w-5 h-5" />
              <span>Iniciar sesión</span>
            </button>
          </Link>
        </div>

        <div className="hero-device">
          <div className="device-container">
            <div className="floating-notification notification-1">
              ✅ Carta Porte CP-2847 timbrada
            </div>
            <div className="floating-notification notification-2">
              🚛 TRK-005 en ruta a Guadalajara
            </div>
            <div className="floating-notification notification-3">
              💡 IA sugiere ruta optimizada
            </div>
            
            <div className="device-header">
              <div className="traffic-light red"></div>
              <div className="traffic-light yellow"></div>
              <div className="traffic-light green"></div>
              <div className="device-title">Interconecta — Dashboard</div>
            </div>
            
            <div className="dashboard-preview">
              <div className="metric-card">
                <div className="metric-label">Multas evitadas</div>
                <div className="metric-value text-mono">$2.5M</div>
                <div className="metric-trend">Total histórico</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Cartas porte diarias</div>
                <div className="metric-value text-mono">500+</div>
                <div className="metric-trend">Automatizadas</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Precisión IA</div>
                <div className="metric-value text-mono">99.9%</div>
                <div className="metric-trend">Sin errores SAT</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Tiempo promedio</div>
                <div className="metric-value text-mono">15<span style={{ fontSize: '18px', color: 'var(--gray-60)' }}>min</span></div>
                <div className="metric-trend">vs 2 horas manual</div>
              </div>
            </div>
            
            <div className="status-indicator">
              ✨ Todas las cartas se generan automáticamente
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumHeroSection;
