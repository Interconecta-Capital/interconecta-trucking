
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, TrendingUp, Users, Star, BarChart3, Phone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const UrgencySection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-red-900 to-orange-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-red-100 border border-red-200 rounded-full px-4 py-2 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm font-inter font-medium text-red-700">
              Acción Urgente Requerida
            </span>
          </div>
          <h3 className="text-4xl font-bold font-sora mb-4">
            El Costo de NO Actuar
          </h3>
          <p className="text-xl font-inter text-red-100 max-w-2xl mx-auto">
            Cada día sin automatización es dinero perdido y riesgo acumulado
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {/* Riesgos Actuales */}
          <Card className="bg-red-800/30 border-red-600 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h4 className="text-2xl font-bold font-sora text-red-100 mb-2">
                  ⚠️ Riesgos Actuales
                </h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-red-100">Multas SAT: $50,000 - $500,000 MXN</div>
                    <div className="text-sm text-red-200">Por cada incumplimiento detectado</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-red-100">Paralización de operaciones</div>
                    <div className="text-sm text-red-200">Vehículos detenidos hasta regularización</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-red-100">Pérdida de clientes</div>
                    <div className="text-sm text-red-200">Por incumplimiento y retrasos</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-red-100">20+ horas/semana perdidas</div>
                    <div className="text-sm text-red-200">En procesos manuales ineficientes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Con Interconecta */}
          <Card className="bg-green-800/30 border-green-600 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Shield className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-2xl font-bold font-sora text-green-100 mb-2">
                  🛡️ Con Interconecta Trucking
                </h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-green-100">Cero riesgo de multas SAT</div>
                    <div className="text-sm text-green-200">Validación automática 99.9% precisa</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-green-100">Operación 100% automatizada</div>
                    <div className="text-sm text-green-200">15 minutos vs 2 horas por carta porte</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-green-100">Cumplimiento garantizado</div>
                    <div className="text-sm text-green-200">Actualizaciones automáticas SAT</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-green-100">ROI positivo desde mes 1</div>
                    <div className="text-sm text-green-200">Ahorro inmediato en tiempo y costos</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas de Éxito */}
        <div className="text-center mb-12">
          <h4 className="text-3xl font-bold font-sora mb-8">
            Estadísticas que Hablan por Sí Solas
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-interconecta-primary-light mx-auto mb-2" />
              <div className="text-3xl font-bold font-sora text-white">500+</div>
              <div className="text-sm font-inter text-interconecta-primary-light">Cartas porte diarias</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-interconecta-primary-light mx-auto mb-2" />
              <div className="text-3xl font-bold font-sora text-white">50+</div>
              <div className="text-sm font-inter text-interconecta-primary-light">Empresas confían en nosotros</div>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 text-interconecta-primary-light mx-auto mb-2" />
              <div className="text-3xl font-bold font-sora text-white">4.9/5</div>
              <div className="text-sm font-inter text-interconecta-primary-light">Rating de satisfacción</div>
            </div>
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-interconecta-primary-light mx-auto mb-2" />
              <div className="text-3xl font-bold font-sora text-white">$2.5M</div>
              <div className="text-sm font-inter text-interconecta-primary-light">En multas evitadas</div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center max-w-4xl mx-auto">
          <h4 className="text-3xl font-bold font-sora mb-6">
            ¿Listo para Proteger tu Negocio?
          </h4>
          <p className="text-xl font-inter text-interconecta-primary-light mb-8">
            No esperes a recibir la primera multa. Actúa ahora y protege tu empresa.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/auth/trial">
              <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 text-xl font-sora font-semibold">
                <Calendar className="mr-2 h-6 w-6" />
                Solicitar Demo Personalizada
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-900 px-8 py-4 text-xl font-sora font-medium">
                <Phone className="mr-2 h-6 w-6" />
                Hablar con un Especialista
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm font-inter text-interconecta-primary-light">
            <div>✅ Demo de 14 días sin agregar tarjeta</div>
            <div>✅ Análisis gratuito de riesgos SAT</div>
            <div>✅ Sin compromisos</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UrgencySection;
