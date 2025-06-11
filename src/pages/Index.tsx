
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, FileText, Users, Shield, BarChart3, Globe, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-trucking-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-trucking-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-trucking p-2 rounded-lg">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">TruckFlow</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="text-trucking-blue-700 hover:text-trucking-orange-500 transition-colors">Características</a>
            <a href="#benefits" className="text-trucking-blue-700 hover:text-trucking-orange-500 transition-colors">Beneficios</a>
            <a href="#pricing" className="text-trucking-blue-700 hover:text-trucking-orange-500 transition-colors">Precios</a>
          </nav>
          <Link to="/dashboard">
            <Button className="bg-trucking-orange-500 hover:bg-trucking-orange-600 text-white">
              Acceder al Sistema
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold text-trucking-blue-800 mb-6">
            El <span className="gradient-text">#1</span> en Gestión de
            <br />Cartas Porte
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plataforma multi-tenant líder para transportistas. Gestiona cartas porte, 
            controla tu flota y administra socios desde una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="bg-trucking-orange-500 hover:bg-trucking-orange-600 text-white px-8 py-4 text-lg">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-trucking-blue-500 text-trucking-blue-500 hover:bg-trucking-blue-50 px-8 py-4 text-lg">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-trucking-blue-800 mb-4">
            Características Principales
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Todo lo que necesitas para gestionar tu empresa de transporte de manera eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-trucking-blue-100 hover:shadow-lg transition-shadow duration-300 hover:border-trucking-orange-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-trucking p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-trucking-blue-800">Cartas Porte Digitales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Crea, edita y gestiona cartas porte cumpliendo con todas las regulaciones mexicanas
              </p>
            </CardContent>
          </Card>

          <Card className="border-trucking-blue-100 hover:shadow-lg transition-shadow duration-300 hover:border-trucking-orange-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-trucking p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-trucking-blue-800">Multi-Tenant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Cada cliente transportista tiene su propia cuenta con datos completamente separados
              </p>
            </CardContent>
          </Card>

          <Card className="border-trucking-blue-100 hover:shadow-lg transition-shadow duration-300 hover:border-trucking-orange-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-trucking p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-trucking-blue-800">Control de Flota</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Gestiona vehículos, conductores y asigna rutas de manera eficiente
              </p>
            </CardContent>
          </Card>

          <Card className="border-trucking-blue-100 hover:shadow-lg transition-shadow duration-300 hover:border-trucking-orange-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-trucking p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-trucking-blue-800">Reportes y Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Dashboards en tiempo real con métricas clave para tu negocio
              </p>
            </CardContent>
          </Card>

          <Card className="border-trucking-blue-100 hover:shadow-lg transition-shadow duration-300 hover:border-trucking-orange-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-trucking p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-trucking-blue-800">Seguridad Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Cifrado de datos, backups automáticos y cumplimiento normativo
              </p>
            </CardContent>
          </Card>

          <Card className="border-trucking-blue-100 hover:shadow-lg transition-shadow duration-300 hover:border-trucking-orange-200">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-trucking p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-trucking-blue-800">Acceso Web</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Accede desde cualquier dispositivo, en cualquier lugar y momento
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-gradient-to-r from-trucking-blue-800 to-trucking-blue-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              ¿Por qué TruckFlow?
            </h3>
            <p className="text-xl text-trucking-blue-100 max-w-2xl mx-auto">
              Diseñado específicamente para el mercado mexicano de transporte
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4 text-white">
              <CheckCircle className="h-6 w-6 text-trucking-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-semibold mb-2">Cumplimiento Normativo</h4>
                <p className="text-trucking-blue-100">
                  Totalmente alineado con las regulaciones SAT y normas mexicanas de transporte
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 text-white">
              <CheckCircle className="h-6 w-6 text-trucking-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-semibold mb-2">Escalabilidad</h4>
                <p className="text-trucking-blue-100">
                  Crece desde 1 vehículo hasta flotas de cientos sin cambiar de plataforma
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 text-white">
              <CheckCircle className="h-6 w-6 text-trucking-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-semibold mb-2">Soporte 24/7</h4>
                <p className="text-trucking-blue-100">
                  Equipo de soporte técnico mexicano disponible cuando lo necesites
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 text-white">
              <CheckCircle className="h-6 w-6 text-trucking-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-semibold mb-2">ROI Comprobado</h4>
                <p className="text-trucking-blue-100">
                  Nuestros clientes reducen costos administrativos hasta en un 40%
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-4xl font-bold text-trucking-blue-800 mb-6">
            ¿Listo para ser el #1?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Únete a cientos de transportistas que ya confían en TruckFlow para gestionar su negocio
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="bg-trucking-orange-500 hover:bg-trucking-orange-600 text-white px-12 py-4 text-xl">
              Comenzar Prueba Gratuita
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-trucking-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-trucking p-2 rounded-lg">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <h5 className="text-xl font-bold">TruckFlow</h5>
              </div>
              <p className="text-trucking-blue-100">
                La plataforma líder en gestión de transporte en México.
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Producto</h6>
              <ul className="space-y-2 text-trucking-blue-100">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Soporte</h6>
              <ul className="space-y-2 text-trucking-blue-100">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Empresa</h6>
              <ul className="space-y-2 text-trucking-blue-100">
                <li><a href="#" className="hover:text-white transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-trucking-blue-700 mt-8 pt-8 text-center text-trucking-blue-100">
            <p>&copy; 2024 TruckFlow. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
