
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileSpreadsheet, Zap, FileText, Bot, Users, BarChart3, Shield, Sparkles } from "lucide-react";

const PremiumFeaturesSection = () => {
  const features = [
    {
      icon: "🧠",
      title: "Asistente IA Avanzado",
      description: "Inteligencia artificial que genera descripciones automáticamente y valida mercancías según catálogos SAT",
      badge: "IA Mexicana"
    },
    {
      icon: "📊",
      title: "Importación Masiva",
      description: "Importa mercancías desde Excel, PDF o XML con OCR y procesamiento automático de documentos",
      badge: "Automatizado"
    },
    {
      icon: "⚡",
      title: "Automatización Total",
      description: "Automatiza timbrado, generación de XML y validaciones con inteligencia artificial integrada",
      badge: "15 min promedio"
    },
    {
      icon: "📄",
      title: "Cartas Porte Inteligentes",
      description: "Genera cartas porte con sugerencias de IA y cumplimiento automático de regulaciones mexicanas",
      badge: "SAT Compliant"
    },
    {
      icon: "🤖",
      title: "Procesamiento Documental",
      description: "Extrae datos automáticamente de facturas, remisiones y documentos con tecnología OCR avanzada",
      badge: "OCR Avanzado"
    },
    {
      icon: "🏢",
      title: "Multi-Tenant Avanzado",
      description: "Cada empresa tiene su entorno aislado con datos completamente separados y configuraciones personalizadas",
      badge: "Enterprise"
    },
    {
      icon: "📈",
      title: "Analytics Inteligentes",
      description: "Dashboards con IA que analizan patrones y generan insights automáticos para tu negocio",
      badge: "Business Intelligence"
    },
    {
      icon: "🔒",
      title: "Seguridad Enterprise",
      description: "Cifrado avanzado, backups automáticos y cumplimiento total con normativas de privacidad mexicanas",
      badge: "Certificado"
    },
    {
      icon: "✨",
      title: "Plantillas Inteligentes",
      description: "Plantillas que se adaptan automáticamente y aprenden de tus patrones para acelerar la creación",
      badge: "Adaptativo"
    }
  ];

  return (
    <section id="características" className="features">
      <div className="features-container">
        <div className="section-header scroll-reveal">
          <div className="section-eyebrow">
            <span>🧠</span>
            <span>Inteligencia artificial</span>
          </div>
          
          <h2 className="text-display">
            Características Principales
          </h2>
          
          <p className="text-body-lg" style={{ color: 'var(--gray-60)', marginTop: 'var(--space-6)' }}>
            Tecnología avanzada con IA para revolucionar tu empresa de transporte
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card scroll-reveal">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="text-subtitle feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <span className="feature-badge">{feature.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumFeaturesSection;
