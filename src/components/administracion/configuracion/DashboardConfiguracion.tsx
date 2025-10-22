import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Shield, 
  FileText, 
  Truck,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';
import { useCertificadosDigitales } from '@/hooks/useCertificadosDigitales';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function DashboardConfiguracion() {
  const { configuracion, isLoading } = useConfiguracionEmpresarial();
  const { certificados, certificadoActivo, esCertificadoValido, diasHastaVencimiento } = useCertificadosDigitales();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted" />
            <CardContent className="h-32 bg-muted/50" />
          </Card>
        ))}
      </div>
    );
  }

  // Calcular completitud de configuración
  const calcularCompletitud = () => {
    let puntos = 0;
    const total = 8;

    if (configuracion?.rfc_emisor) puntos++;
    if (configuracion?.razon_social) puntos++;
    if (configuracion?.regimen_fiscal) puntos++;
    if (configuracion?.codigo_postal) puntos++;
    if (configuracion?.seguro_resp_civil_empresa) puntos++;
    if (configuracion?.seguro_carga_empresa) puntos++;
    if (configuracion?.proveedor_timbrado) puntos++;
    if (certificadoActivo) puntos++;

    return Math.round((puntos / total) * 100);
  };

  const completitud = calcularCompletitud();

  // Determinar estado del sistema
  const getEstadoSistema = () => {
    if (!certificadoActivo || !configuracion?.rfc_emisor || !configuracion?.proveedor_timbrado) {
      return { estado: 'critico', color: 'destructive', icon: XCircle, texto: 'Sistema no operativo' };
    }
    if (completitud < 80) {
      return { estado: 'advertencia', color: 'warning', icon: AlertTriangle, texto: 'Configuración incompleta' };
    }
    return { estado: 'operativo', color: 'success', icon: CheckCircle2, texto: 'Sistema operativo' };
  };

  const estadoSistema = getEstadoSistema();

  // Calcular certificados próximos a vencer
  const certificadosProximosVencer = certificados.filter((cert) => {
    if (!esCertificadoValido(cert)) return false;
    const dias = diasHastaVencimiento(cert);
    return dias <= 30 && dias > 0;
  }).length;

  const certificadosVencidos = certificados.filter((cert) => !esCertificadoValido(cert)).length;

  // Warnings activos
  const warnings = [];
  if (!configuracion?.rfc_emisor) warnings.push('RFC no configurado');
  if (!certificadoActivo) warnings.push('Sin certificado digital activo');
  if (!configuracion?.proveedor_timbrado) warnings.push('Proveedor de timbrado no configurado');
  if (!configuracion?.seguro_carga_empresa) warnings.push('Seguro de carga no configurado');
  if (certificadosProximosVencer > 0) warnings.push(`${certificadosProximosVencer} certificado(s) próximo(s) a vencer`);
  if (configuracion?.modo_pruebas) warnings.push('Sistema en modo de pruebas');

  const IconoEstado = estadoSistema.icon;

  return (
    <div className="space-y-6">
      {/* Estado General del Sistema */}
      <Alert className={`border-2 ${
        estadoSistema.estado === 'operativo' ? 'border-green-500 bg-green-50' :
        estadoSistema.estado === 'advertencia' ? 'border-yellow-500 bg-yellow-50' :
        'border-red-500 bg-red-50'
      }`}>
        <IconoEstado className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">
          {estadoSistema.texto}
        </AlertTitle>
        <AlertDescription>
          {estadoSistema.estado === 'operativo' && 'Su configuración está completa y el sistema está listo para operar.'}
          {estadoSistema.estado === 'advertencia' && 'Complete la configuración para habilitar todas las funcionalidades.'}
          {estadoSistema.estado === 'critico' && 'Complete la configuración obligatoria para poder generar documentos fiscales.'}
        </AlertDescription>
      </Alert>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Completitud */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completitud de Configuración
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{completitud}%</div>
              <Progress value={completitud} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completitud === 100 ? 'Configuración completa' : `${8 - Math.round(completitud / 12.5)} campos pendientes`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Certificados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certificados Digitales
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{certificados.length}</div>
              <div className="flex gap-2">
                {certificadoActivo && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    1 Activo
                  </Badge>
                )}
                {certificadosProximosVencer > 0 && (
                  <Badge variant="warning" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {certificadosProximosVencer} Próx. vencer
                  </Badge>
                )}
                {certificadosVencidos > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {certificadosVencidos} Vencido(s)
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentos Fiscales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estado Fiscal
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {configuracion?.rfc_emisor ? 'RFC Configurado' : 'Pendiente'}
              </div>
              <div className="space-y-1">
                {configuracion?.rfc_emisor && (
                  <Badge variant="outline" className="text-xs">
                    {configuracion.rfc_emisor}
                  </Badge>
                )}
                {configuracion?.regimen_fiscal && (
                  <p className="text-xs text-muted-foreground">
                    Régimen: {configuracion.regimen_fiscal}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Viajes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Viajes Bloqueados
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {completitud < 100 ? '∞' : '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {completitud < 100 
                  ? 'Complete configuración para crear viajes'
                  : 'Sin restricciones'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings Activos */}
      {warnings.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Advertencias Activas ({warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Última Actualización */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Última actualización:</span>
            <span className="font-medium">
              {new Date().toLocaleString('es-MX', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
