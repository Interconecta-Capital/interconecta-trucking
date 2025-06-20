
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/landing/Header';
import { 
  CheckCircle, 
  FileText, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  Truck,
  Globe,
  Clock,
  Award
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: "Cartas Porte SAT",
      description: "Generación automática conforme a la normativa mexicana v3.1"
    },
    {
      icon: <Truck className="h-6 w-6 text-blue-600" />,
      title: "Gestión de Flota",
      description: "Control completo de vehículos, conductores y socios"
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Cumplimiento Fiscal",
      description: "100% conforme con las regulaciones del SAT"
    },
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: "Automatización",
      description: "Reduce tiempo y errores en la documentación"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
      title: "Reportes Avanzados",
      description: "Analíticas y reportes para toma de decisiones"
    },
    {
      icon: <Globe className="h-6 w-6 text-blue-600" />,
      title: "Acceso en la Nube",
      description: "Disponible 24/7 desde cualquier dispositivo"
    }
  ];

  const plans = [
    {
      name: "Plan Esencial SAT",
      price: "$299",
      period: "/mes",
      description: "Perfecto para pequeñas empresas de transporte",
      features: [
        "Hasta 50 Cartas Porte/mes",
        "5 Vehículos",
        "5 Conductores",
        "Soporte por email",
        "Almacenamiento básico"
      ],
      badge: "Más Popular",
      highlighted: true
    },
    {
      name: "Plan Profesional",
      price: "$599",
      period: "/mes",
      description: "Para empresas medianas en crecimiento",
      features: [
        "Hasta 200 Cartas Porte/mes",
        "20 Vehículos",
        "20 Conductores",
        "Soporte prioritario",
        "Reportes avanzados",
        "API Access"
      ]
    },
    {
      name: "Plan Enterprise",
      price: "Personalizado",
      period: "",
      description: "Para grandes flotas y necesidades específicas",
      features: [
        "Cartas Porte ilimitadas",
        "Vehículos ilimitados",
        "Conductores ilimitados",
        "Soporte 24/7",
        "Integración personalizada",
        "Gestión dedicada"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-screen-xl text-center">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              <Award className="h-4 w-4 mr-2" />
              Certificado SAT v3.1
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Sistema de Gestión de
            <span className="text-blue-600"> Cartas Porte</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            La plataforma más completa para empresas de transporte en México. 
            Genera Cartas Porte conformes al SAT, gestiona tu flota y mantén el 
            cumplimiento fiscal automatizado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth?tab=register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full">
                Comenzar Prueba Gratuita
              </Button>
            </Link>
            <Link to="/auth?tab=login">
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-full">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>14 días gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Cancelación flexible</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="características" className="py-16 px-6">
        <div className="container mx-auto max-w-screen-xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu empresa de transporte
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Funciones diseñadas específicamente para el sector transportista mexicano
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto max-w-screen-xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes para cada tamaño de empresa
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desde pequeñas empresas hasta grandes flotas, tenemos el plan perfecto para ti
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`border-gray-200 ${plan.highlighted ? 'ring-2 ring-blue-600 shadow-xl' : ''} relative`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mt-4">
                    <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>
                  <CardDescription className="mt-4">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-6">
                    <Link to="/auth?tab=register">
                      <Button 
                        className={`w-full ${plan.highlighted ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
                        size="lg"
                      >
                        Comenzar Ahora
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-16 px-6">
        <div className="container mx-auto max-w-screen-xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para modernizar tu empresa de transporte?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a cientos de empresas que ya confían en Interconecta Trucking
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full">
                Comenzar Prueba Gratuita
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-full">
              Contactar Ventas
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Configuración en 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Soporte especializado</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Datos seguros</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto max-w-screen-xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                  alt="Interconecta Trucking Logo"
                  className="w-8 h-8 rounded-lg"
                />
                <span className="text-xl font-bold">Interconecta Trucking</span>
              </div>
              <p className="text-gray-400 mb-4">
                La plataforma líder para la gestión de transporte en México
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#características" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#precios" className="hover:text-white transition-colors">Precios</a></li>
                <li><Link to="/auth?tab=register" className="hover:text-white transition-colors">Prueba Gratuita</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contacto" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Interconecta Trucking. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
