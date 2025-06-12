
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Shield, Users, Clock, Phone, BookOpen } from 'lucide-react';

export function FuncionesEnterprise() {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            Plan Enterprise Sin Límites
            <Badge className="bg-yellow-100 text-yellow-800">Activo</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Acceso completo a todas las funcionalidades empresariales avanzadas.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  SLA Garantizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime Garantizado</span>
                    <span className="font-semibold">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Uptime actual: 99.97%
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerente Dedicado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Ana Rodríguez</p>
                    <p className="text-sm text-muted-foreground">Gerente de Cuenta</p>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-3">
                  <Phone className="h-4 w-4 mr-2" />
                  Contactar
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Soporte Prioritario 24/7
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">&lt; 5min</div>
                <p className="text-sm text-muted-foreground">Tiempo de Respuesta</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">24/7</div>
                <p className="text-sm text-muted-foreground">Disponibilidad</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">98%</div>
                <p className="text-sm text-muted-foreground">Satisfacción</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Llamar Soporte
            </Button>
            <Button variant="outline" className="flex-1">
              Chat en Vivo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Capacitación Personalizada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Capacitación en sitio y personalizada para su equipo.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Programas Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Capacitación básica del sistema</li>
                  <li>• Configuración avanzada</li>
                  <li>• Integración con sistemas existentes</li>
                  <li>• Mejores prácticas</li>
                  <li>• Resolución de problemas</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximas Sesiones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <p className="font-semibold">Configuración Avanzada</p>
                    <p className="text-sm text-muted-foreground">15 Jun 2024 - 10:00 AM</p>
                  </div>
                  <Button size="sm" className="w-full">
                    Programar Nueva Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementación Personalizada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Desarrollo de funciones específicas según las necesidades de su empresa.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Módulo de Facturación Personalizado</h4>
                <Badge className="bg-blue-100 text-blue-800">En Desarrollo</Badge>
              </div>
              <Progress value={75} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">75% completado - Entrega estimada: 20 Jun 2024</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Integración API Terceros</h4>
                <Badge className="bg-green-100 text-green-800">Completado</Badge>
              </div>
              <Progress value={100} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">Entregado el 10 Jun 2024</p>
            </div>
            
            <Button className="w-full">
              Solicitar Nueva Funcionalidad
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
