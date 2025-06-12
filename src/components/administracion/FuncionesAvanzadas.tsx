
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Code, BarChart3, Database, Settings } from 'lucide-react';

export function FuncionesAvanzadas() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API Completa
            <Badge className="bg-green-100 text-green-800">Disponible</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Acceso completo a la API REST para integración con sistemas externos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Endpoints Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• GET /api/cartas-porte</li>
                  <li>• POST /api/cartas-porte</li>
                  <li>• GET /api/vehiculos</li>
                  <li>• GET /api/conductores</li>
                  <li>• GET /api/tracking</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuración API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="api-enabled">API Habilitada</Label>
                  <Switch id="api-enabled" defaultChecked />
                </div>
                <Button className="w-full">
                  Generar Nueva API Key
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Avanzados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Análisis profundo de datos y métricas de rendimiento.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">89.5%</div>
                <p className="text-sm text-muted-foreground">Eficiencia de Entregas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">24.3</div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio (hrs)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <p className="text-sm text-muted-foreground">Rutas Optimizadas</p>
              </CardContent>
            </Card>
          </div>
          
          <Button className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Dashboard Completo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Integración ERP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Conecte con sistemas ERP populares para sincronización automática.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sistemas Compatibles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• SAP Business One</li>
                  <li>• Microsoft Dynamics</li>
                  <li>• Oracle NetSuite</li>
                  <li>• Odoo</li>
                  <li>• QuickBooks Enterprise</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado de Conexiones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">SAP Connection</span>
                  <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dynamics Sync</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                </div>
                <Button size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Integraciones
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
