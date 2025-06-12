
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Users, 
  FileSpreadsheet, 
  BarChart3, 
  Phone, 
  Smartphone,
  CheckCircle
} from "lucide-react";

const addOns = [
  {
    name: "Seguros y Garantías",
    price: "$99 USD/mes",
    icon: Shield,
    features: [
      "Seguros especializados en transporte",
      "Garantías extendidas para mercancías",
      "Cobertura de responsabilidad civil",
      "Protección contra robo y daños"
    ]
  },
  {
    name: "Gestión Multi-Usuario",
    price: "$49 USD/mes",
    icon: Users,
    features: [
      "Usuarios ilimitados",
      "Roles y permisos personalizados",
      "Auditoría de actividades",
      "Control de acceso granular"
    ]
  },
  {
    name: "Importación Masiva",
    price: "$79 USD/mes",
    icon: FileSpreadsheet,
    features: [
      "Procesamiento OCR avanzado",
      "Importación desde múltiples formatos",
      "Validación automática de datos",
      "Corrección inteligente de errores"
    ]
  },
  {
    name: "Analytics Avanzados",
    price: "$129 USD/mes",
    icon: BarChart3,
    features: [
      "Dashboards personalizables",
      "Reportes automáticos",
      "Predicciones con IA",
      "Insights de negocio"
    ]
  },
  {
    name: "Soporte Telefónico",
    price: "$199 USD/mes",
    icon: Phone,
    features: [
      "Soporte 24/7 en español",
      "Línea directa dedicada",
      "Resolución prioritaria",
      "Consultoría especializada"
    ]
  },
  {
    name: "App Móvil Premium",
    price: "$39 USD/mes",
    icon: Smartphone,
    features: [
      "App nativa iOS y Android",
      "Funcionalidad offline",
      "Notificaciones push",
      "Firma digital móvil"
    ]
  }
];

export function AddOnsSection() {
  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <h4 className="text-3xl font-bold font-sora text-interconecta-text-primary mb-4">
          ADD-ONS PREMIUM
        </h4>
        <p className="text-xl font-inter text-interconecta-text-secondary max-w-2xl mx-auto">
          Potencia tu plataforma con funciones especializadas
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addOns.map((addon, index) => (
          <Card key={index} className="border-interconecta-border-subtle hover:shadow-md transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-to-r from-interconecta-primary to-interconecta-accent p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <addon.icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-lg font-sora text-interconecta-text-primary">{addon.name}</CardTitle>
              <div className="text-2xl font-bold font-sora text-interconecta-primary">{addon.price}</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {addon.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span className="font-inter text-interconecta-text-body text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
