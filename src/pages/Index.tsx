
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Truck, FileText, Users, Calendar, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Interconecta Trucking</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="mr-2">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Gestión Integral de
            <span className="text-blue-600"> Transporte</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Plataforma completa para la gestión de cartas porte, vehículos, conductores y rutas de transporte.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Cartas Porte Digitales</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Genera y gestiona cartas porte de forma digital con cumplimiento normativo completo.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-green-500 rounded-md shadow-lg">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Gestión de Flota</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Administra tu flota de vehículos, mantenimientos y documentación de forma centralizada.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-purple-500 rounded-md shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Control de Conductores</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Gestiona licencias, documentos y asignaciones de conductores de manera eficiente.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-yellow-500 rounded-md shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Planificación de Rutas</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Optimiza rutas y horarios para maximizar la eficiencia operativa.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-red-500 rounded-md shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Cumplimiento Normativo</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Asegura el cumplimiento de todas las regulaciones mexicanas de transporte.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Reportes y Analytics</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Obtén insights detallados sobre tu operación con reportes avanzados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-blue-600 rounded-lg">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">
                ¿Listo para transformar tu negocio de transporte?
              </h2>
              <p className="mt-4 text-lg text-blue-100">
                Únete a cientos de empresas que ya confían en Interconecta Trucking
              </p>
              <div className="mt-8">
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-50">
                    Prueba Gratuita por 7 Días
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 Interconecta Trucking. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
