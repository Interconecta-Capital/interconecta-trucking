
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Shield, BarChart3, Globe, ArrowRight, CheckCircle, Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-interconecta-bg-alternate to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-interconecta-border-subtle sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
              alt="Interconecta Trucking Logo"
              className="h-10 w-10 rounded-lg"
            />
            <h1 className="text-2xl font-bold font-sora text-interconecta-text-primary">
              Interconecta Trucking
            </h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter">
              Características
            </a>
            <a href="#benefits" className="text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter">
              Beneficios
            </a>
            <a href="#pricing" className="text-interconecta-text-body hover:text-interconecta-primary transition-colors font-inter">
              Precios
            </a>
          </nav>
          <div className="flex items-center space-x-3">
            <Link to="/auth/login">
              <Button variant="outline" className="border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light font-sora font-medium">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/auth/trial">
              <Button className="bg-interconecta-primary hover:bg-interconecta-accent text-white font-sora font-medium">
                Prueba 14 días gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="inline-flex items-center bg-interconecta-primary-light border border-interconecta-border-subtle rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-interconecta-primary mr-2" />
            <span className="text-sm font-inter font-medium text-interconecta-text-body">
              #1 en Gestión de Cartas Porte en México
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold font-sora text-interconecta-text-primary mb-6 leading-tight">
            La Plataforma Completa para
            <br />
            <span className="gradient-text">Transportistas Mexicanos</span>
          </h2>
          
          <p className="text-xl font-inter text-interconecta-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
            Gestiona cartas porte, controla tu flota y administra socios desde una sola plataforma. 
            Cumple con todas las regulaciones SAT de manera fácil y eficiente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth/trial">
              <Button size="lg" className="bg-interconecta-primary hover:bg-interconecta-accent text-white px-8 py-4 text-lg font-sora font-semibold">
                <Calendar className="mr-2 h-5 w-5" />
                Prueba 14 días gratis
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light px-8 py-4 text-lg font-sora font-medium">
                Iniciar Sesión
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto text-center">
            <div>
              <div className="text-2xl font-bold font-sora text-interconecta-text-primary">+500</div>
              <div className="text-sm font-inter text-interconecta-text-secondary">Empresas</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-sora text-interconecta-text-primary">+10K</div>
              <div className="text-sm font-inter text-interconecta-text-secondary">Cartas Porte</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-sora text-interconecta-text-primary">99.9%</div>
              <div className="text-sm font-inter text-interconecta-text-secondary">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-sora text-interconecta-text-primary">24/7</div>
              <div className="text-sm font-inter text-interconecta-text-secondary">Soporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold font-sora text-interconecta-text-primary mb-4">
            Características Principales
          </h3>
          <p className="text-xl font-inter text-interconecta-text-secondary max-w-2xl mx-auto">
            Todo lo que necesitas para gestionar tu empresa de transporte de manera eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-interconecta-border-subtle hover:shadow-lg transition-shadow duration-300 hover:border-interconecta-primary">
            <CardHeader className="text-center pb-4">
              <div className="interconecta-gradient p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-sora text-interconecta-text-primary">Cartas Porte Digitales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-interconecta-text-secondary text-center font-inter">
                Crea, edita y gestiona cartas porte cumpliendo con todas las regulaciones mexicanas
              </p>
            </CardContent>
          </Card>

          <Card className="border-interconecta-border-subtle hover:shadow-lg transition-shadow duration-300 hover:border-interconecta-primary">
            <CardHeader className="text-center pb-4">
              <div className="interconecta-gradient p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-sora text-interconecta-text-primary">Multi-Tenant</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-interconecta-text-secondary text-center font-inter">
                Cada cliente transportista tiene su propia cuenta con datos completamente separados
              </p>
            </CardContent>
          </Card>

          <Card className="border-interconecta-border-subtle hover:shadow-lg transition-shadow duration-300 hover:border-interconecta-primary">
            <CardHeader className="text-center pb-4">
              <div className="interconecta-gradient p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-sora text-interconecta-text-primary">Control de Flota</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-interconecta-text-secondary text-center font-inter">
                Gestiona vehículos, conductores y asigna rutas de manera eficiente
              </p>
            </CardContent>
          </Card>

          <Card className="border-interconecta-border-subtle hover:shadow-lg transition-shadow duration-300 hover:border-interconecta-primary">
            <CardHeader className="text-center pb-4">
              <div className="interconecta-gradient p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-sora text-interconecta-text-primary">Reportes y Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-interconecta-text-secondary text-center font-inter">
                Dashboards en tiempo real con métricas clave para tu negocio
              </p>
            </CardContent>
          </Card>

          <Card className="border-interconecta-border-subtle hover:shadow-lg transition-shadow duration-300 hover:border-interconecta-primary">
            <CardHeader className="text-center pb-4">
              <div className="interconecta-gradient p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-sora text-interconecta-text-primary">Seguridad Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-interconecta-text-secondary text-center font-inter">
                Cifrado de datos, backups automáticos y cumplimiento normativo
              </p>
            </CardContent>
          </Card>

          <Card className="border-interconecta-border-subtle hover:shadow-lg transition-shadow duration-300 hover:border-interconecta-primary">
            <CardHeader className="text-center pb-4">
              <div className="interconecta-gradient p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-sora text-interconecta-text-primary">Acceso Web</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-interconecta-text-secondary text-center font-inter">
                Accede desde cualquier dispositivo, en cualquier lugar y momento
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="bg-gradient-interconecta py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold font-sora text-white mb-4">
              ¿Por qué Interconecta Trucking?
            </h3>
            <p className="text-xl font-inter text-interconecta-primary-light max-w-2xl mx-auto">
              Diseñado específicamente para el mercado mexicano de transporte
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4 text-white">
              <CheckCircle className="h-6 w-6 text-interconecta-primary-light mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-semibold font-sora mb-2">Cumplimiento Normativo</h4>
                <p className="font-inter text-interconecta-primary-light">
                  Totalmente alineado con las regulaciones SAT y normas mexicanas de transporte
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 text-white">
              <CheckCircle className="h-6 w-6 text-interconecta-primary-light mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-semibold font-sora mb-2">Escalabilidad</h4>
                <p className="font-inter text-interconecta-primary-light">
                  Crece desde 1 vehículo hasta flotas de cientos sin cambiar de plataforma
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 text-white">
              <CheckCircle className="h-6 w-6 text-interconecta-primary-light mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-semibold font-sora mb-2">Soporte 24/7</h4>
                <p className="font-inter text-interconecta-primary-light">
                  Equipo de soporte técnico mexicano disponible cuando lo necesites
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 text-white">
              <CheckCircle className="h-6 w-6 text-interconecta-primary-light mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xl font-semibold font-sora mb-2">ROI Comprobado</h4>
                <p className="font-inter text-interconecta-primary-light">
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
          <h3 className="text-4xl font-bold font-sora text-interconecta-text-primary mb-6">
            ¿Listo para revolucionar tu negocio?
          </h3>
          <p className="text-xl font-inter text-interconecta-text-secondary mb-8">
            Únete a cientos de transportistas que ya confían en Interconecta Trucking para gestionar su negocio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/trial">
              <Button size="lg" className="bg-interconecta-primary hover:bg-interconecta-accent text-white px-12 py-4 text-xl font-sora font-semibold">
                <Calendar className="mr-2 h-6 w-6" />
                Comenzar Prueba Gratuita
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" variant="outline" className="border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light px-12 py-4 text-xl font-sora font-medium">
                Ver Demo
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-interconecta-text-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
                  alt="Interconecta Trucking Logo"
                  className="h-8 w-8 rounded-lg"
                />
                <h5 className="text-xl font-bold font-sora">Interconecta Trucking</h5>
              </div>
              <p className="font-inter text-interconecta-primary-light">
                La plataforma líder en gestión de transporte en México.
              </p>
            </div>
            <div>
              <h6 className="font-semibold font-sora mb-4">Producto</h6>
              <ul className="space-y-2 font-inter text-interconecta-primary-light">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold font-sora mb-4">Soporte</h6>
              <ul className="space-y-2 font-inter text-interconecta-primary-light">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold font-sora mb-4">Empresa</h6>
              <ul className="space-y-2 font-inter text-interconecta-primary-light">
                <li><a href="#" className="hover:text-white transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-interconecta-accent mt-8 pt-8 text-center font-inter text-interconecta-primary-light">
            <p>&copy; 2024 Interconecta Trucking. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
