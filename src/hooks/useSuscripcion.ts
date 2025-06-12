import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PlanSuscripcion {
  id: string;
  nombre: string;
  descripcion?: string;
  precio_mensual: number;
  precio_anual?: number;
  dias_prueba: number;
  limite_cartas_porte?: number;
  limite_conductores?: number;
  limite_vehiculos?: number;
  limite_socios?: number;
  puede_cancelar_cfdi: boolean;
  puede_generar_xml: boolean;
  puede_timbrar: boolean;
  puede_tracking: boolean;
  activo: boolean;
}

export interface Suscripcion {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';
  fecha_inicio: string;
  fecha_vencimiento?: string;
  fecha_fin_prueba?: string;
  dias_gracia: number;
  ultimo_pago?: string;
  proximo_pago?: string;
  plan?: PlanSuscripcion;
}

export interface BloqueoUsuario {
  id: string;
  user_id: string;
  motivo: string;
  fecha_bloqueo: string;
  fecha_desbloqueo?: string;
  activo: boolean;
  mensaje_bloqueo?: string;
}

export const useSuscripcion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener suscripción del usuario actual
  const { data: suscripcion, isLoading: loadingSuscripcion } = useQuery({
    queryKey: ['suscripcion-usuario'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('suscripciones')
        .select(`
          *,
          plan:planes_suscripcion(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Suscripcion;
    },
  });

  // Obtener todos los planes disponibles
  const { data: planes = [], isLoading: loadingPlanes } = useQuery({
    queryKey: ['planes-suscripcion'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planes_suscripcion')
        .select('*')
        .eq('activo', true)
        .order('precio_mensual', { ascending: true });

      if (error) throw error;
      return data as PlanSuscripcion[];
    },
  });

  // Verificar si el usuario está bloqueado
  const { data: bloqueo, isLoading: loadingBloqueo } = useQuery({
    queryKey: ['bloqueo-usuario'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('bloqueos_usuario')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .maybeSingle();

      if (error) throw error;
      return data as BloqueoUsuario | null;
    },
  });

  // Verificar suscripción con Stripe
  const verificarSuscripcion = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suscripcion-usuario'] });
    },
    onError: (error: any) => {
      console.error('Error verificando suscripción:', error);
      toast({
        title: "Error",
        description: "No se pudo verificar el estado de la suscripción",
        variant: "destructive",
      });
    },
  });

  // Crear sesión de checkout
  const crearCheckout = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Abrir Stripe checkout en una nueva pestaña
      window.open(data.url, '_blank');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la sesión de pago",
        variant: "destructive",
      });
    },
  });

  // Abrir portal del cliente
  const abrirPortalCliente = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Abrir portal en nueva pestaña
      window.open(data.url, '_blank');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo abrir el portal de gestión",
        variant: "destructive",
      });
    },
  });

  // Función para verificar permisos
  const tienePermiso = (permiso: keyof PlanSuscripcion): boolean => {
    if (!suscripcion?.plan) return false;
    return Boolean(suscripcion.plan[permiso]);
  };

  // Función para verificar límites
  const verificarLimite = (tipo: 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios', cantidad: number): boolean => {
    if (!suscripcion?.plan) return false;
    
    const limite = suscripcion.plan[`limite_${tipo}`];
    if (limite === null || limite === undefined) return true; // Sin límite
    
    return cantidad < limite;
  };

  // Verificar si está en período de prueba
  const enPeriodoPrueba = (): boolean => {
    if (!suscripcion) return false;
    if (suscripcion.status !== 'trial') return false;
    
    const fechaFinPrueba = new Date(suscripcion.fecha_fin_prueba || '');
    return fechaFinPrueba > new Date();
  };

  // Calcular días restantes de prueba
  const diasRestantesPrueba = (): number => {
    if (!suscripcion || suscripcion.status !== 'trial') return 0;
    
    const fechaFinPrueba = new Date(suscripcion.fecha_fin_prueba || '');
    const ahora = new Date();
    const diferencia = fechaFinPrueba.getTime() - ahora.getTime();
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    return Math.max(0, dias);
  };

  // Verificar si la suscripción está vencida
  const suscripcionVencida = (): boolean => {
    if (!suscripcion) return false;
    
    const fechaVencimiento = new Date(suscripcion.fecha_vencimiento || '');
    return fechaVencimiento <= new Date() && suscripcion.status === 'past_due';
  };

  // Cambiar plan de suscripción (actualizado para usar Stripe)
  const cambiarPlan = useMutation({
    mutationFn: async (planId: string) => {
      // Si no tiene suscripción activa, crear checkout
      if (!suscripcion || suscripcion.status === 'trial') {
        return crearCheckout.mutateAsync(planId);
      }
      
      // Si ya tiene suscripción, redirigir al portal del cliente
      return abrirPortalCliente.mutateAsync();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar el cambio de plan",
        variant: "destructive",
      });
    },
  });

  return {
    suscripcion,
    planes,
    bloqueo,
    loadingSuscripcion,
    loadingPlanes,
    loadingBloqueo,
    tienePermiso,
    verificarLimite,
    enPeriodoPrueba,
    diasRestantesPrueba,
    suscripcionVencida,
    cambiarPlan: cambiarPlan.mutate,
    isChangingPlan: cambiarPlan.isPending,
    verificarSuscripcion: verificarSuscripcion.mutate,
    isVerifyingSubscription: verificarSuscripcion.isPending,
    crearCheckout: crearCheckout.mutate,
    isCreatingCheckout: crearCheckout.isPending,
    abrirPortalCliente: abrirPortalCliente.mutate,
    isOpeningPortal: abrirPortalCliente.isPending,
    estaBloqueado: Boolean(bloqueo?.activo),
  };
};
