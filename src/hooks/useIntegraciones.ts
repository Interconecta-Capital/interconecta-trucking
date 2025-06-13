import { useState, useEffect } from 'react';
import { useSimpleAuth } from './useSimpleAuth';
import { webhookService } from '@/services/webhookService';
import { multiTenancyService } from '@/services/multiTenancyService';
import { mapService } from '@/services/mapService';

export const useIntegraciones = () => {
  const { user } = useSimpleAuth();
  const [tenantConfig, setTenantConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeTenant = async () => {
      if (user?.id) {
        setLoading(true);
        const config = await multiTenancyService.getCurrentTenant(user.id);
        setTenantConfig(config);
        setLoading(false);
      }
    };

    initializeTenant();
  }, [user?.id]);

  // Funciones para webhooks
  const notificarCambioEstado = async (viajeId: string, estadoAnterior: string, estadoNuevo: string) => {
    if (!user?.id) return false;
    return webhookService.viajeEstadoCambiado(viajeId, estadoAnterior, estadoNuevo, user.id);
  };

  const reportarEmergencia = async (viajeId: string, descripcion: string, ubicacion: any) => {
    if (!user?.id) return false;
    return webhookService.reportarEmergencia(viajeId, descripcion, ubicacion, user.id);
  };

  // Funciones para geocodificación
  const geocodificarDireccion = async (direccion: string) => {
    return mapService.geocodeAddress(direccion);
  };

  const calcularRuta = async (puntos: any[]) => {
    return mapService.calculateRoute(puntos);
  };

  const optimizarRuta = async (puntos: any[]) => {
    return mapService.optimizeRoute(puntos);
  };

  // Funciones para multi-tenancy
  const obtenerEstadisticasTenant = async () => {
    return multiTenancyService.getEstadisticasTenant();
  };

  const configurarTema = async (configuracion: any) => {
    return multiTenancyService.configurarTema(configuracion);
  };

  const configurarIntegraciones = async (integraciones: any) => {
    return multiTenancyService.configurarIntegraciones(integraciones);
  };

  const obtenerConfiguracionIntegraciones = async () => {
    return multiTenancyService.getConfiguracionIntegraciones();
  };

  // Verificar si las integraciones están configuradas
  const integracionesDisponibles = {
    mapbox: mapService.isConfigured(),
    webhooks: false, // Se actualizará cuando se cargue la configuración
    facturacion: false // Se actualizará cuando se cargue la configuración
  };

  // Cargar configuraciones al inicializar
  useEffect(() => {
    const cargarConfiguraciones = async () => {
      if (tenantConfig) {
        const integraciones = await obtenerConfiguracionIntegraciones();
        const facturacion = await multiTenancyService.getConfiguracionFacturacion();
        
        integracionesDisponibles.webhooks = !!integraciones?.webhook_urls;
        integracionesDisponibles.facturacion = !!facturacion;
      }
    };

    cargarConfiguraciones();
  }, [tenantConfig]);

  return {
    // Estado
    tenantConfig,
    loading,
    integracionesDisponibles,

    // Webhooks
    notificarCambioEstado,
    reportarEmergencia,

    // Mapas y geocodificación
    geocodificarDireccion,
    calcularRuta,
    optimizarRuta,

    // Multi-tenancy
    obtenerEstadisticasTenant,
    configurarTema,
    configurarIntegraciones,
    obtenerConfiguracionIntegraciones,

    // Servicios directos
    webhookService,
    multiTenancyService,
    mapService
  };
};
