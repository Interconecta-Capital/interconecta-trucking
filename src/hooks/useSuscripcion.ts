
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Plan {
  id: string;
  nombre: string;
  descripcion?: string;
  precio_mensual: number;
  precio_anual?: number;
  dias_prueba?: number;
  limite_cartas_porte?: number;
  limite_vehiculos?: number;
  limite_conductores?: number;
  limite_socios?: number;
  puede_cancelar_cfdi?: boolean;
  puede_generar_xml?: boolean;
  puede_timbrar?: boolean;
  puede_tracking?: boolean;
  puede_acceder_administracion?: boolean;
  puede_acceder_funciones_avanzadas?: boolean;
  puede_acceder_enterprise?: boolean;
}

// Export this interface for other components
export interface PlanSuscripcion extends Plan {}

interface Suscripcion {
  id: string;
  status: string;
  plan?: Plan;
  fecha_fin_prueba?: string;
  fecha_vencimiento?: string;
  proximo_pago?: string;
  stripe_customer_id?: string;
  grace_period_start?: string;
  grace_period_end?: string;
  cleanup_warning_sent?: boolean;
  final_warning_sent?: boolean;
}

interface Bloqueo {
  activo: boolean;
  mensaje_bloqueo?: string;
  motivo?: string;
}

export function useSuscripcion() {
  const { user } = useAuth();
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [isVerifyingSubscription, setIsVerifyingSubscription] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [bloqueo, setBloqueo] = useState<Bloqueo>({ activo: false });

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadSuscripcion = async () => {
      try {
        const { data, error } = await supabase
          .from('suscripciones')
          .select(`
            id,
            status,
            fecha_fin_prueba,
            fecha_vencimiento,
            grace_period_start,
            grace_period_end,
            cleanup_warning_sent,
            final_warning_sent,
            plan:planes_suscripcion(
              id,
              nombre,
              descripcion,
              precio_mensual,
              precio_anual,
              dias_prueba,
              limite_cartas_porte,
              limite_vehiculos,
              limite_conductores,
              limite_socios,
              puede_cancelar_cfdi,
              puede_generar_xml,
              puede_timbrar,
              puede_tracking,
              puede_acceder_administracion,
              puede_acceder_funciones_avanzadas,
              puede_acceder_enterprise
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.warn('[useSuscripcion] Error loading subscription:', error);
          // Create default trial subscription
          setSuscripcion({
            id: 'trial',
            status: 'trial',
            plan: {
              id: 'basic',
              nombre: 'Básico',
              descripcion: 'Plan básico de prueba',
              precio_mensual: 0,
              dias_prueba: 14,
              limite_cartas_porte: 10,
              limite_vehiculos: 5,
              limite_conductores: 3,
              limite_socios: 2,
              puede_generar_xml: true,
              puede_timbrar: false,
              puede_cancelar_cfdi: false,
              puede_tracking: false,
              puede_acceder_administracion: false,
              puede_acceder_funciones_avanzadas: false,
              puede_acceder_enterprise: false,
            }
          });
        } else if (data) {
          setSuscripcion(data);
        }

        // Load bloqueo
        const { data: bloqueoData } = await supabase
          .from('bloqueos_usuario')
          .select('*')
          .eq('user_id', user.id)
          .eq('activo', true)
          .single();

        if (bloqueoData) {
          setBloqueo({
            activo: true,
            mensaje_bloqueo: bloqueoData.mensaje_bloqueo,
            motivo: bloqueoData.motivo
          });
        }
      } catch (error) {
        console.error('[useSuscripcion] Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load available plans
    const loadPlanes = async () => {
      try {
        const { data, error } = await supabase
          .from('planes_suscripcion')
          .select('*')
          .eq('activo', true);
        
        if (data && !error) {
          setPlanes(data);
        }
      } catch (error) {
        console.error('[useSuscripcion] Error loading plans:', error);
      }
    };

    loadSuscripcion();
    loadPlanes();
  }, [user?.id]);

  const enPeriodoPrueba = () => {
    if (!suscripcion) return true;
    return suscripcion.status === 'trial';
  };

  const suscripcionVencida = () => {
    if (!suscripcion) return false;
    if (suscripcion.status === 'past_due' || suscripcion.status === 'canceled') return true;
    if (suscripcion.fecha_vencimiento) {
      return new Date(suscripcion.fecha_vencimiento) < new Date();
    }
    return false;
  };

  const estaBloqueado = () => {
    return bloqueo.activo || (suscripcionVencida() && !enPeriodoPrueba());
  };

  const diasRestantesPrueba = () => {
    if (!suscripcion?.fecha_fin_prueba) return 0;
    const now = new Date();
    const endDate = new Date(suscripcion.fecha_fin_prueba);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const verificarSuscripcion = async () => {
    setIsVerifyingSubscription(true);
    try {
      // Placeholder for subscription verification
      console.log('Verifying subscription...');
      // In real implementation, this would check with payment provider
    } catch (error) {
      console.error('Error verifying subscription:', error);
    } finally {
      setIsVerifyingSubscription(false);
    }
  };

  const abrirPortalCliente = async () => {
    setIsOpeningPortal(true);
    try {
      // Placeholder for portal client functionality
      console.log('Opening customer portal...');
      // In real implementation, this would redirect to Stripe customer portal
    } catch (error) {
      console.error('Error opening customer portal:', error);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const crearCheckout = async (planId: string) => {
    setIsCreatingCheckout(true);
    try {
      // Placeholder for checkout creation
      console.log('Creating checkout for plan:', planId);
      // In real implementation, this would create Stripe checkout session
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  return {
    suscripcion,
    planes,
    loading,
    bloqueo,
    enPeriodoPrueba,
    suscripcionVencida,
    estaBloqueado,
    diasRestantesPrueba,
    verificarSuscripcion,
    isVerifyingSubscription,
    abrirPortalCliente,
    isOpeningPortal,
    crearCheckout,
    isCreatingCheckout,
  };
}
