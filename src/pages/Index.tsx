
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, FileText, Shield, BarChart3, LogIn, UserPlus, CheckCircle, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirigir usuarios autenticados al dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Solo mostrar landing page si el usuario NO está autenticado
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header con navegación superior */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Interconecta Trucking</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#caracteristicas" className="text-slate-600 hover:text-slate-900 transition-colors">Características</a>
              <a href="#precios" className="text-slate-600 hover:text-slate-900 transition-colors">Precios</a>
              <a href="#contacto" className="text-slate-600 hover:text-slate-900 transition-colors">Contacto</a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost"
                onClick={() => navigate('/auth?tab=login')}
                className="text-slate-600 hover:text-slate-900"
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={() => navigate('/auth?tab=register')}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Probar gratis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
              <span className="mr-2">🚛</span>
              Primera Plataforma IA Especializada en Transporte Mexicano
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
              La Plataforma
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                Completa para
              </span>
              <br />
              <span className="text-blue-600">Transportistas Mexicanos</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Gestiona cartas porte con inteligencia artificial, importa datos 
              masivamente y automatiza procesos. Cumple con todas las 
              regulaciones SAT de manera fácil y eficiente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg"
                onClick={() => navigate('/auth?tab=register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Prueba 14 días gratis →
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/auth?tab=login')}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg"
              >
                ▶ Iniciar sesión
              </Button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">$2.5M</div>
                <div className="text-sm text-slate-600 uppercase tracking-wide">EN MULTAS EVITADAS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-sm text-slate-600 uppercase tracking-wide">CARTAS PORTE DIARIAS</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-sm text-slate-600 uppercase tracking-wide">PRECISIÓN IA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">15 min</div>
                <div className="text-sm text-slate-600 uppercase tracking-wide">VS 2 HORAS MANUAL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Interconecta — Dashboard
            </h2>
            <p className="text-xl text-slate-600">
              Todo lo que necesitas en una sola plataforma
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">VIAJES ACTIVOS</h3>
                <div className="text-4xl font-bold text-slate-900 mb-1">12</div>
                <div className="text-green-600 text-sm">+3 esta semana</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">INGRESOS MES</h3>
                <div className="text-4xl font-bold text-slate-900 mb-1">$287K</div>
                <div className="text-green-600 text-sm">+18% vs anterior</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Características Section */}
      <div id="caracteristicas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Características del Sistema
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Diseñado específicamente para transportistas mexicanos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Cumplimiento SAT</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600">
                  100% compatible con los requerimientos del SAT para Carta Porte 3.1
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">IA Avanzada</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600">
                  Inteligencia artificial que aprende y optimiza tus procesos automáticamente
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Gestión Completa</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600">
                  Sistema integral de documentos, viajes y recursos empresariales
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600">
                  Reportes detallados y métricas en tiempo real de tu operación
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Listo para transformar tu operación?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de transportistas que ya confían en Interconecta
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth?tab=register')}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-medium shadow-lg"
            >
              Comenzar prueba gratuita
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate('/auth?tab=login')}
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Interconecta Trucking</span>
            </div>
            <p className="text-slate-500">
              © 2024 Interconecta Trucking. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
