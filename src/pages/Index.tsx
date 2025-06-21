
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, FileText, Shield, BarChart3, LogIn, UserPlus, CheckCircle, Clock, Zap, TrendingUp, Users, Target, Award, Star, ArrowRight, Calculator, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [viajesCount, setViajesCount] = useState(50);
  const [multasCount, setMultasCount] = useState(2);

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

  // Cálculos ROI
  const ahorroTiempo = viajesCount * 1.25 * 500 * 12; // 1.25 horas ahorradas * $500/hora * 12 meses
  const multasEvitadas = multasCount * 500000 * 12; // $500,000 por multa * 12 meses
  const ahorroTotal = ahorroTiempo + multasEvitadas;
  const ahorroMensual = ahorroTotal / 12;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Interconecta Trucking</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost"
                onClick={() => navigate('/auth?tab=login')}
                className="text-gray-600 hover:text-gray-900"
              >
                Iniciar Sesión
              </Button>
              <Button 
                onClick={() => navigate('/auth?tab=register')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Prueba Gratis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            La Plataforma
            <br />
            <span className="text-blue-600">Completa para</span>
            <br />
            <span className="text-blue-600">Transportistas Mexicanos</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Gestiona cartas porte con inteligencia artificial, importa datos 
            masivamente y automatiza procesos. Cumple con todas las 
            regulaciones SAT de manera fácil y eficiente.
          </p>

          {/* Estadísticas Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">$2.5M</div>
              <div className="text-sm text-gray-600">En multas evitadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">500+</div>
              <div className="text-sm text-gray-600">Cartas porte diarias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">99.9%</div>
              <div className="text-sm text-gray-600">Precisión IA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">15 min</div>
              <div className="text-sm text-gray-600">vs 2 horas manual</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth?tab=register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              Comenzar Prueba Gratuita
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg"
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Interconecta — Dashboard
            </h2>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Viajes activos</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
                <div className="text-green-600 text-sm">+3 esta semana</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Ingresos mes</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">$287K</div>
                <div className="text-green-600 text-sm">+18% vs anterior</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Cartas porte</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">847</div>
                <div className="text-blue-600 text-sm">Automatización IA</div>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-xl">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Errores SAT</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
                <div className="text-green-600 text-sm">Perfección total</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                Todas las cartas porte generadas automáticamente
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Resultados que cambian el juego
            </h2>
            <p className="text-xl text-gray-600">
              Más de 2,500 transportistas confían en Interconecta para automatizar completamente sus operaciones SAT.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600">Reducción errores</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">2,847</div>
              <div className="text-gray-600">Cartas porte</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-gray-600">Multas SAT</div>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Automatización</div>
            </div>
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600">
              Tecnología avanzada con IA para revolucionar tu empresa de transporte
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Asistente IA Avanzado</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Inteligencia artificial que genera descripciones automáticamente y valida mercancías según catálogos SAT
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Importación Masiva</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Importa mercancías desde Excel, PDF o XML con OCR y procesamiento automático de documentos
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Automatización Total</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Automatiza timbrado, generación de XML y validaciones con inteligencia artificial integrada
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Calculadora ROI */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Calculadora de Pérdidas
            </h2>
            <p className="text-xl text-gray-600">
              ¿Cuánto pierdes SIN Interconecta Trucking?
            </p>
            <p className="text-lg text-gray-500">
              Calcula el costo real de seguir con procesos manuales y el riesgo de multas SAT
            </p>
          </div>
          
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">Calculadora de ROI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de viajes por mes: {viajesCount}
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="300" 
                  value={viajesCount}
                  onChange={(e) => setViajesCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Multas SAT evitadas por mes: {multasCount}
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={multasCount}
                  onChange={(e) => setMultasCount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ahorro Anual Estimado</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  ${(ahorroTotal).toLocaleString()} MXN
                </div>
                <div className="text-lg text-gray-600">
                  ${(ahorroMensual).toLocaleString()} MXN por mes
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <div className="text-sm text-gray-600">Ahorro en tiempo:</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${ahorroTiempo.toLocaleString()} MXN
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Multas evitadas:</div>
                    <div className="text-2xl font-bold text-red-600">
                      ${multasEvitadas.toLocaleString()} MXN
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-600">$500,000</div>
                  <div className="text-sm text-gray-600">Multa máxima SAT</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">15 min</div>
                  <div className="text-sm text-gray-600">vs 1.5 horas manual</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-gray-600">Precisión IA</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">#1</div>
                  <div className="text-sm text-gray-600">Plataforma IA México</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Testimonial */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-2xl font-medium text-gray-900 mb-8">
            "Antes nos tomaba 3 horas hacer una carta porte y siempre había errores del SAT. 
            Ahora son 3 minutos y nunca falla. Es como tener un contador experto trabajando 24/7."
          </blockquote>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="font-semibold text-gray-900">Carlos Mendoza</div>
              <div className="text-gray-600">Director de Operaciones, Transportes del Norte</div>
            </div>
          </div>
        </div>
      </div>

      {/* Precios */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Precios transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Planes que Protegen tu Negocio
            </p>
            <p className="text-lg text-gray-500">
              Elige el plan perfecto para tu empresa y comienza a ahorrar desde el primer día
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Plan Esencial SAT</CardTitle>
                <div className="text-3xl font-bold">$149 <span className="text-base font-normal text-gray-600">USD/mes + IVA</span></div>
                <CardDescription>Ideal para empresas pequeñas que inician con cumplimiento SAT</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Hasta 50 cartas porte mensuales</li>
                  <li>✓ Generación automática de XML</li>
                  <li>✓ Validación SAT en tiempo real</li>
                  <li>✓ Timbrado automático</li>
                  <li>✓ Soporte por email</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">Más popular</span>
              </div>
              <CardHeader>
                <CardTitle>Plan Gestión IA</CardTitle>
                <div className="text-3xl font-bold">$299 <span className="text-base font-normal text-gray-600">USD/mes + IVA</span></div>
                <CardDescription>Para empresas en crecimiento que buscan automatización</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Hasta 200 cartas porte mensuales</li>
                  <li>✓ Asistente IA para descripciones</li>
                  <li>✓ Gestión de ubicaciones inteligente</li>
                  <li>✓ Plantillas automatizadas</li>
                  <li>✓ Analytics básicos</li>
                  <li>✓ Soporte prioritario</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Plan Automatización Total</CardTitle>
                <div className="text-3xl font-bold">$499 <span className="text-base font-normal text-gray-600">USD/mes + IVA</span></div>
                <CardDescription>Solución completa para empresas establecidas</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Cartas porte ilimitadas</li>
                  <li>✓ IA avanzada para procesamiento</li>
                  <li>✓ Integración con sistemas ERP</li>
                  <li>✓ API completa disponible</li>
                  <li>✓ Analytics avanzados</li>
                  <li>✓ Soporte telefónico</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-500">
              <CardHeader>
                <CardTitle>Plan Enterprise Sin Límites</CardTitle>
                <div className="text-3xl font-bold">Contactar con <span className="text-base font-normal text-gray-600">ventas</span></div>
                <CardDescription>Solución personalizada para grandes empresas</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Todo incluido de planes anteriores</li>
                  <li>✓ Implementación personalizada</li>
                  <li>✓ Desarrollo de funciones específicas</li>
                  <li>✓ SLA garantizado</li>
                  <li>✓ Gerente de cuenta dedicado</li>
                  <li>✓ Capacitación en sitio</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Listo para nunca más preocuparte por el SAT?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a más de 2,500 transportistas que ya automatizaron completamente sus cartas porte. 
            Prueba gratis durante 30 días.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/auth?tab=register')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium"
          >
            Comenzar Prueba Gratuita
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Interconecta Trucking</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white">Privacidad</a>
              <a href="#" className="hover:text-white">Términos</a>
              <a href="#" className="hover:text-white">Soporte</a>
              <a href="#" className="hover:text-white">Contacto</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500">
              © 2025 Interconecta Capital. Automatización con propósito humano.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
