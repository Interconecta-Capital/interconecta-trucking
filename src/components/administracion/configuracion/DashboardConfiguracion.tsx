import { useEffect, useState } from 'react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';
import { useCertificadosDigitales } from '@/hooks/useCertificadosDigitales';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Shield,
  FileKey,
  Settings,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ConfiguracionEmisorService } from '@/services/configuracion/ConfiguracionEmisorService';

export function DashboardConfiguracion() {
  const { configuracion, isLoading, cargarConfiguracion } = useConfiguracionEmpresarial();
  const { certificados } = useCertificadosDigitales();
  const navigate = useNavigate();
  
  // Estado para validación en tiempo real desde BD
  const [validacionReal, setValidacionReal] = useState<any>(null);
  const [validando, setValidando] = useState(false);

  // Validar configuración real desde BD al montar y cuando cambie configuracion
  useEffect(() => {
    validarConfiguracionReal();
  }, [configuracion]);

  const validarConfiguracionReal = async () => {
    setValidando(true);
    try {
      const resultado = await ConfiguracionEmisorService.validarConfiguracionCompleta();
      setValidacionReal(resultado);
      console.log('📊 [DashboardConfiguracion] Validación REAL desde BD:', resultado);
    } catch (error) {
      console.error('Error validando configuración:', error);
    } finally {
      setValidando(false);
    }
  };

  const handleRecargarDesdeBD = async () => {
    await cargarConfiguracion();
    await validarConfiguracionReal();
  };

  if (isLoading || validando) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[180px]" />
          <Skeleton className="h-[180px]" />
          <Skeleton className="h-[180px]" />
          <Skeleton className="h-[180px]" />
        </div>
      </div>
    );
  }

  // Calcular completitud basado en validación REAL desde BD
  const calcularCompletitud = () => {
    if (!validacionReal) {
      return { puntos: 0, total: 6, porcentaje: 0, desglose: {}, camposPendientes: [] };
    }

    // Usar los errores de la validación real para calcular completitud
    const total = 6; // RFC, Razón Social, Régimen Fiscal, Domicilio (completo), Seguro RC, Proveedor Timbrado
    const erroresObligatorios = validacionReal.errors.length;
    const puntos = Math.max(0, total - erroresObligatorios);
    const porcentaje = Math.round((puntos / total) * 100);

    // Crear desglose basado en las categorías de validación
    const desglose = {
      rfc: validacionReal.categorias.datosFiscales.valido && 
           !validacionReal.categorias.datosFiscales.errores.some((e: string) => e.includes('RFC')),
      razon_social: validacionReal.categorias.datosFiscales.valido && 
                    !validacionReal.categorias.datosFiscales.errores.some((e: string) => e.includes('Razón social')),
      regimen_fiscal: validacionReal.categorias.datosFiscales.valido && 
                      !validacionReal.categorias.datosFiscales.errores.some((e: string) => e.includes('Régimen fiscal')),
      domicilio: validacionReal.categorias.domicilioFiscal.valido,
      seguro_rc: validacionReal.categorias.seguros.valido,
      proveedor_timbrado: !validacionReal.errors.some((e: string) => e.includes('proveedor_timbrado'))
    };

    // Identificar campos pendientes específicos
    const camposPendientes: string[] = [];
    
    if (!validacionReal.categorias.datosFiscales.valido) {
      validacionReal.categorias.datosFiscales.errores.forEach((error: string) => {
        if (error.includes('Razón social')) camposPendientes.push('Razón Social');
        if (error.includes('RFC')) camposPendientes.push('RFC');
        if (error.includes('Régimen fiscal')) camposPendientes.push('Régimen Fiscal');
      });
    }
    
    if (!validacionReal.categorias.domicilioFiscal.valido) {
      validacionReal.categorias.domicilioFiscal.errores.forEach((error: string) => {
        if (error.includes('calle')) camposPendientes.push('Calle');
        if (error.includes('código postal')) camposPendientes.push('Código Postal');
        if (error.includes('colonia')) camposPendientes.push('Colonia');
        if (error.includes('municipio')) camposPendientes.push('Municipio');
        if (error.includes('estado')) camposPendientes.push('Estado');
      });
    }
    
    if (!validacionReal.categorias.seguros.valido) {
      validacionReal.categorias.seguros.errores.forEach((error: string) => {
        if (error.includes('Responsabilidad Civil')) camposPendientes.push('Seguro RC');
      });
    }

    console.log('📊 [DashboardConfiguracion] Completitud REAL desde BD:', {
      total,
      puntos,
      porcentaje,
      erroresObligatorios,
      desglose,
      camposPendientes,
      validacionCompleta: validacionReal
    });

    return { puntos, total, porcentaje, desglose, camposPendientes };
  };

  const completitud = calcularCompletitud();

  // Determinar estado del sistema
  const getEstado_Sistema = () => {
    if (!validacionReal) return 'critico';
    if (validacionReal.isValid && certificados.length > 0) return 'operativo';
    if (completitud.porcentaje >= 50) return 'advertencia';
    return 'critico';
  };

  const estadoSistema = getEstado_Sistema();

  // Usar warnings de la validación real
  const warnings = validacionReal ? [
    ...validacionReal.errors,  // Errores obligatorios
    ...validacionReal.warnings // Advertencias/recomendaciones
  ] : [];

  const certificadosProximosVencer = certificados.filter(cert => {
    const diasRestantes = Math.ceil((new Date(cert.fecha_fin_vigencia).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes > 0 && diasRestantes <= 30;
  }).length;

  const certificadosVencidos = certificados.filter(cert => new Date(cert.fecha_fin_vigencia) < new Date()).length;

  return (
    <div className="space-y-6">
      {/* Estado General del Sistema */}
      <Alert variant={estadoSistema === 'critico' ? 'destructive' : 'default'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {estadoSistema === 'operativo' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : estadoSistema === 'advertencia' ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <div className="flex-1">
              <AlertTitle className="mb-0">
                {estadoSistema === 'operativo' && 'Sistema Operativo'}
                {estadoSistema === 'advertencia' && 'Configuración Incompleta'}
                {estadoSistema === 'critico' && 'Configuración Crítica'}
              </AlertTitle>
              <AlertDescription className="mt-2">
                {estadoSistema === 'operativo' && 'Todos los sistemas están configurados correctamente y operando normalmente.'}
                {estadoSistema === 'advertencia' && `Hay ${warnings.length} elemento${warnings.length > 1 ? 's' : ''} que requiere${warnings.length === 1 ? '' : 'n'} atención.`}
                {estadoSistema === 'critico' && 'La configuración está incompleta. Algunos módulos pueden no funcionar correctamente.'}
              </AlertDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRecargarDesdeBD}
            className="h-8 w-8 ml-4"
            title="Sincronizar con base de datos"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </Alert>

      {/* Métricas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Completitud */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completitud de Configuración</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completitud.porcentaje}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completitud.camposPendientes.length > 0 
                ? `Pendiente: ${completitud.camposPendientes.slice(0, 2).join(', ')}${completitud.camposPendientes.length > 2 ? '...' : ''}`
                : `${completitud.puntos} de ${completitud.total} campos completos`
              }
            </p>
            {completitud.porcentaje < 100 && completitud.camposPendientes.length > 0 && (
              <Badge variant="outline" className="mt-2">
                {completitud.camposPendientes.length} pendiente{completitud.camposPendientes.length > 1 ? 's' : ''}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Certificados Digitales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados Digitales</CardTitle>
            <FileKey className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificados.length}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {certificadosProximosVencer > 0 && (
                <Badge variant="warning">{certificadosProximosVencer} próx. vencer</Badge>
              )}
              {certificadosVencidos > 0 && (
                <Badge variant="destructive">{certificadosVencidos} vencidos</Badge>
              )}
              {certificados.length > 0 && certificadosVencidos === 0 && (
                <Badge variant="default">Activo</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estado Fiscal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Fiscal</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {configuracion?.rfc_emisor ? 'Configurado' : 'Pendiente'}
            </div>
            {configuracion?.rfc_emisor && (
              <Badge variant="outline" className="mt-2">{configuracion.rfc_emisor}</Badge>
            )}
            {configuracion?.regimen_fiscal && (
              <p className="text-xs text-muted-foreground mt-1">Régimen: {configuracion.regimen_fiscal}</p>
            )}
          </CardContent>
        </Card>

        {/* Viajes Bloqueados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes Bloqueados</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validacionReal?.isValid && certificados.length > 0 ? '0' : '∞'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {validacionReal?.isValid 
                ? 'Sin restricciones' 
                : 'Complete la configuración'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advertencias Activas */}
      {warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Advertencias Activas ({warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Última Actualización */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Última actualización:</span>
        <span className="font-medium">{format(new Date(), 'PPp', { locale: es })}</span>
      </div>
    </div>
  );
}
