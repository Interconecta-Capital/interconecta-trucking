
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Truck, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                alt="Interconecta Trucking Logo"
                className="w-10 h-10 rounded-lg"
              />
              <h1 className="text-xl font-bold text-gray-900">Interconecta Trucking</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth?tab=login">
                <Button variant="outline">Iniciar Sesión</Button>
              </Link>
              <Link to="/auth?tab=register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Primera Plataforma IA Especializada en Transporte Mexicano
            </span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            La Plataforma Completa para{' '}
            <span className="text-blue-600">Transportistas Mexicanos</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Gestiona cartas porte con inteligencia artificial, importa datos masivamente 
            y automatiza procesos. Cumple con todas las regulaciones SAT de manera fácil y eficiente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth?tab=register">
              <Button size="lg" className="px-8 py-3 text-lg">
                Prueba 14 días gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth?tab=login">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                Iniciar sesión
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">$2.5M</div>
              <div className="text-sm text-gray-600">EN MULTAS EVITADAS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">CARTAS PORTE DIARIAS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">99.9%</div>
              <div className="text-sm text-gray-600">PRECISIÓN IA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">15 min</div>
              <div className="text-sm text-gray-600">VS 2 HORAS MANUAL</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          ¿Por qué elegir Interconecta Trucking?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Cartas Porte Inteligentes
              </CardTitle>
              <CardDescription>
                Genera documentos SAT 3.1 con IA. Automatiza validaciones y reduce errores al 0%.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-green-600" />
                Gestión de Flota
              </CardTitle>
              <CardDescription>
                Administra vehículos, conductores y rutas desde una sola plataforma.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                Socios Comerciales
              </CardTitle>
              <CardDescription>
                Gestiona clientes, proveedores y partners con datos fiscales actualizados.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-orange-600" />
                Reportes Avanzados
              </CardTitle>
              <CardDescription>
                Dashboard en tiempo real con métricas de operación y cumplimiento.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-red-600" />
                Cumplimiento SAT
              </CardTitle>
              <CardDescription>
                100% compatible con regulaciones mexicanas. Actualizaciones automáticas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                Automatización IA
              </CardTitle>
              <CardDescription>
                Reduce tiempo de procesamiento de 2 horas a 15 minutos por documento.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Optimiza tu operación con IA
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Reducción de errores del 95%</h3>
                    <p className="text-gray-600">IA especializada en normativas SAT mexicanas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Procesamiento 8x más rápido</h3>
                    <p className="text-gray-600">De 2 horas manuales a 15 minutos automatizados</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Cumplimiento garantizado</h3>
                    <p className="text-gray-600">Validaciones automáticas en tiempo real</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Dashboard en Tiempo Real</h3>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Viajes Activos</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$287K</div>
                  <div className="text-sm text-gray-600">Ingresos del Mes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de transportistas que ya optimizaron sus operaciones con IA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=register">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Comenzar prueba gratuita
              </Button>
            </Link>
            <Link to="/auth?tab=login">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
              alt="Interconecta Trucking Logo"
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-white font-bold">Interconecta Trucking</span>
          </div>
          <p className="text-gray-400">
            © 2024 Interconecta Trucking. La plataforma más avanzada para el transporte mexicano.
          </p>
        </div>
      </footer>
    </div>
  );
}
