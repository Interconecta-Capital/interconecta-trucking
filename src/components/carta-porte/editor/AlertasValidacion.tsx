/**
 * FASE 7: Componente de Alertas de Validación en Tiempo Real
 * Muestra alertas visuales para datos faltantes o incompletos
 */

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertaValidacion {
  tipo: 'error' | 'warning' | 'info';
  mensaje: string;
  seccion: string;
}

interface AlertasValidacionProps {
  ubicaciones: any[];
  mercancias: any[];
  autotransporte: any;
  figuras: any[];
  configuracion: any;
}

export function AlertasValidacion({
  ubicaciones,
  mercancias,
  autotransporte,
  figuras,
  configuracion
}: AlertasValidacionProps) {
  const alertas: AlertaValidacion[] = [];

  // Validar ubicaciones
  if (!ubicaciones || ubicaciones.length < 2) {
    alertas.push({
      tipo: 'error',
      mensaje: 'Se requieren al menos 2 ubicaciones (Origen y Destino)',
      seccion: 'Ubicaciones'
    });
  } else {
    const origen = ubicaciones.find(u => u.tipo_ubicacion === 'Origen' || u.tipoUbicacion === 'Origen');
    const destino = ubicaciones.find(u => u.tipo_ubicacion === 'Destino' || u.tipoUbicacion === 'Destino');
    
    if (!origen) {
      alertas.push({
        tipo: 'error',
        mensaje: 'Falta ubicación de Origen',
        seccion: 'Ubicaciones'
      });
    }
    
    if (!destino) {
      alertas.push({
        tipo: 'error',
        mensaje: 'Falta ubicación de Destino',
        seccion: 'Ubicaciones'
      });
    }

    // Validar códigos postales
    ubicaciones.forEach((ub, index) => {
      // ✅ FASE 1: Buscar en ambos formatos del domicilio
      const cp = ub.domicilio?.codigo_postal || ub.domicilio?.codigoPostal;
      if (!cp) {
        alertas.push({
          tipo: 'error',
          mensaje: `Código postal obligatorio en ubicación ${index + 1}`,
          seccion: 'Ubicaciones'
        });
      } else if (!/^\d{5}$/.test(cp)) {
        alertas.push({
          tipo: 'error',
          mensaje: `Código postal inválido en ubicación ${index + 1}: "${cp}" (debe ser 5 dígitos)`,
          seccion: 'Ubicaciones'
        });
      }
    });

    // Validar distancia recorrida en destino
    if (destino && !destino.distancia_recorrida && !destino.distanciaRecorrida) {
      alertas.push({
        tipo: 'warning',
        mensaje: 'Se recomienda especificar la distancia recorrida en el Destino',
        seccion: 'Ubicaciones'
      });
    }
  }

  // Validar mercancías
  if (!mercancias || mercancias.length === 0) {
    alertas.push({
      tipo: 'error',
      mensaje: 'Debe agregar al menos una mercancía',
      seccion: 'Mercancías'
    });
  } else {
    mercancias.forEach((m, index) => {
      if (!m.bienes_transp && !m.claveProdServ) {
        alertas.push({
          tipo: 'warning',
          mensaje: `Falta clave SAT en mercancía ${index + 1}`,
          seccion: 'Mercancías'
        });
      }
      if (!m.peso_kg || m.peso_kg <= 0) {
        alertas.push({
          tipo: 'warning',
          mensaje: `Peso obligatorio en mercancía ${index + 1}`,
          seccion: 'Mercancías'
        });
      }
    });
  }

  // Validar autotransporte
  if (!autotransporte || !autotransporte.placa_vm) {
    alertas.push({
      tipo: 'error',
      mensaje: 'Falta placa del vehículo',
      seccion: 'Autotransporte'
    });
  }
  if (!autotransporte || !autotransporte.perm_sct) {
    alertas.push({
      tipo: 'warning',
      mensaje: 'Se recomienda especificar el Permiso SCT del vehículo',
      seccion: 'Autotransporte'
    });
  }
  if (!autotransporte || !autotransporte.num_permiso_sct) {
    alertas.push({
      tipo: 'warning',
      mensaje: 'Se recomienda especificar el Número de Permiso SCT',
      seccion: 'Autotransporte'
    });
  }

  // Validar figuras de transporte
  if (!figuras || figuras.length === 0) {
    alertas.push({
      tipo: 'warning',
      mensaje: 'Se recomienda agregar al menos un operador',
      seccion: 'Figuras'
    });
  } else {
    figuras.forEach((fig, index) => {
      if (!fig.num_licencia && !fig.numLicencia) {
        alertas.push({
          tipo: 'warning',
          mensaje: `Falta número de licencia en figura ${index + 1}`,
          seccion: 'Figuras'
        });
      }
    });
  }

  // Validar configuración
  if (!configuracion.rfcEmisor) {
    alertas.push({
      tipo: 'error',
      mensaje: 'RFC del Emisor es obligatorio',
      seccion: 'Configuración'
    });
  }
  if (!configuracion.rfcReceptor) {
    alertas.push({
      tipo: 'error',
      mensaje: 'RFC del Receptor es obligatorio',
      seccion: 'Configuración'
    });
  }

  // Filtrar solo errores y warnings más críticos
  const erroresCriticos = alertas.filter(a => a.tipo === 'error');
  const warningsCriticos = alertas.filter(a => a.tipo === 'warning').slice(0, 3); // Solo 3 warnings más importantes

  const alertasMostrar = [...erroresCriticos, ...warningsCriticos];

  if (alertasMostrar.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {alertasMostrar.map((alerta, index) => {
        const Icon = alerta.tipo === 'error' ? AlertCircle : alerta.tipo === 'warning' ? AlertTriangle : Info;
        const variant = alerta.tipo === 'error' ? 'destructive' : 'default';
        
        return (
          <Alert key={index} variant={variant} className={
            alerta.tipo === 'error' 
              ? 'border-red-200 bg-red-50' 
              : alerta.tipo === 'warning'
              ? 'border-amber-200 bg-amber-50'
              : 'border-blue-200 bg-blue-50'
          }>
            <Icon className={`h-4 w-4 ${
              alerta.tipo === 'error' 
                ? 'text-red-600' 
                : alerta.tipo === 'warning'
                ? 'text-amber-600'
                : 'text-blue-600'
            }`} />
            <AlertDescription className={
              alerta.tipo === 'error' 
                ? 'text-red-800' 
                : alerta.tipo === 'warning'
                ? 'text-amber-800'
                : 'text-blue-800'
            }>
              <strong>{alerta.seccion}:</strong> {alerta.mensaje}
            </AlertDescription>
          </Alert>
        );
      })}
      
      {alertas.length > alertasMostrar.length && (
        <Alert variant="default" className="border-gray-200 bg-gray-50">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-700">
            +{alertas.length - alertasMostrar.length} advertencias adicionales. Complete los campos para mejorar la calidad del documento.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
