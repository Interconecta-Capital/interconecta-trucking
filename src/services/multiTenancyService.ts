
import { supabase } from '@/integrations/supabase/client';

interface TenantConfig {
  id: string;
  nombre_empresa: string;
  rfc_empresa: string;
  configuracion: {
    tema?: {
      colores_principales?: string[];
      logo_url?: string;
    };
    facturacion?: {
      datos_fiscales?: any;
      config_pac?: any;
    };
    integraciones?: {
      webhook_urls?: string[];
      api_keys?: any;
    };
  };
}

class MultiTenancyService {
  private currentTenant: TenantConfig | null = null;

  // Obtener configuración del tenant actual
  async getCurrentTenant(userId: string): Promise<TenantConfig | null> {
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select(`
          tenant_id,
          tenant:tenants(
            id,
            nombre_empresa,
            rfc_empresa,
            activo
          )
        `)
        .eq('auth_user_id', userId)
        .single();

      if (error || !usuario?.tenant) {
        console.error('Error obteniendo tenant:', error);
        return null;
      }

      this.currentTenant = {
        id: usuario.tenant.id,
        nombre_empresa: usuario.tenant.nombre_empresa,
        rfc_empresa: usuario.tenant.rfc_empresa,
        configuracion: {}
      };

      return this.currentTenant;
    } catch (error) {
      console.error('Error en getCurrentTenant:', error);
      return null;
    }
  }

  // Crear nuevo tenant (para registro de empresas)
  async crearTenant(nombreEmpresa: string, rfcEmpresa: string, userId: string) {
    try {
      // Crear tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          nombre_empresa: nombreEmpresa,
          rfc_empresa: rfcEmpresa,
          activo: true
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Crear usuario asociado al tenant
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          auth_user_id: userId,
          tenant_id: tenant.id,
          nombre: nombreEmpresa,
          email: '', // Se llenará desde el perfil
          rol: 'admin',
          activo: true
        });

      if (usuarioError) throw usuarioError;

      return tenant;
    } catch (error) {
      console.error('Error creando tenant:', error);
      throw error;
    }
  }

  // Obtener datos de cartas porte filtrados por tenant
  async getCartasPorteByTenant(filters: any = {}) {
    if (!this.currentTenant) {
      throw new Error('No hay tenant configurado');
    }

    const { data, error } = await supabase
      .from('cartas_porte')
      .select('*')
      .eq('tenant_id', this.currentTenant.id)
      .match(filters);

    if (error) throw error;
    return data;
  }

  // Configurar tema personalizado por tenant (usando metadata en lugar de configuracion)
  async configurarTema(configuracion: any) {
    if (!this.currentTenant) return false;

    try {
      // Por ahora guardamos la configuración en el localStorage hasta que se agregue el campo a la DB
      localStorage.setItem(`tenant_tema_${this.currentTenant.id}`, JSON.stringify(configuracion));
      
      console.log('Configuración de tema guardada localmente:', configuracion);
      return true;
    } catch (error) {
      console.error('Error configurando tema:', error);
      return false;
    }
  }

  // Obtener estadísticas por tenant
  async getEstadisticasTenant() {
    if (!this.currentTenant) return null;

    try {
      const [cartasPorte, vehiculos, conductores, socios] = await Promise.all([
        supabase
          .from('cartas_porte')
          .select('id', { count: 'exact' })
          .eq('tenant_id', this.currentTenant.id),
        supabase
          .from('vehiculos')
          .select('id', { count: 'exact' })
          .eq('user_id', this.currentTenant.id), // Asumiendo que user_id es tenant_id
        supabase
          .from('conductores')
          .select('id', { count: 'exact' })
          .eq('user_id', this.currentTenant.id),
        supabase
          .from('socios')
          .select('id', { count: 'exact' })
          .eq('user_id', this.currentTenant.id)
      ]);

      return {
        cartas_porte: cartasPorte.count || 0,
        vehiculos: vehiculos.count || 0,
        conductores: conductores.count || 0,
        socios: socios.count || 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  // Configurar integraciones por tenant (usando localStorage temporalmente)
  async configurarIntegraciones(integraciones: any) {
    if (!this.currentTenant) return false;

    try {
      localStorage.setItem(`tenant_integraciones_${this.currentTenant.id}`, JSON.stringify(integraciones));
      console.log('Configuración de integraciones guardada localmente:', integraciones);
      return true;
    } catch (error) {
      console.error('Error configurando integraciones:', error);
      return false;
    }
  }

  // Obtener configuración de facturación
  async getConfiguracionFacturacion() {
    if (!this.currentTenant) return null;

    try {
      const config = localStorage.getItem(`tenant_facturacion_${this.currentTenant.id}`);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Error obteniendo configuración de facturación:', error);
      return null;
    }
  }

  // Guardar configuración de facturación
  async guardarConfiguracionFacturacion(config: any) {
    if (!this.currentTenant) return false;

    try {
      localStorage.setItem(`tenant_facturacion_${this.currentTenant.id}`, JSON.stringify(config));
      console.log('Configuración de facturación guardada localmente:', config);
      return true;
    } catch (error) {
      console.error('Error guardando configuración de facturación:', error);
      return false;
    }
  }

  // Obtener configuración de integraciones
  async getConfiguracionIntegraciones() {
    if (!this.currentTenant) return null;

    try {
      const config = localStorage.getItem(`tenant_integraciones_${this.currentTenant.id}`);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Error obteniendo configuración de integraciones:', error);
      return null;
    }
  }

  // Obtener configuración de tema
  async getConfiguracionTema() {
    if (!this.currentTenant) return null;

    try {
      const config = localStorage.getItem(`tenant_tema_${this.currentTenant.id}`);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Error obteniendo configuración de tema:', error);
      return null;
    }
  }
}

export const multiTenancyService = new MultiTenancyService();
