
import { useState, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { Viaje } from '@/types/viaje';

// Rate limiting y throttling
const REQUEST_QUEUE_SIZE = 50;
const BATCH_SIZE = 10;
const RETRY_ATTEMPTS = 3;
const DEBOUNCE_DELAY = 300;

// Cache optimizado con TTL
interface CacheEntry {
  data: any;
  timestamp: number;
  signature: string;
}

class OptimizedViajeManager {
  private requestQueue: Array<() => Promise<any>> = [];
  private processing = false;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 30000; // 30 segundos

  // Generar signature único y determinístico
  generateSignature(wizardData: ViajeWizardData): string {
    const key = [
      wizardData.cliente?.rfc || '',
      wizardData.origen?.domicilio?.calle || '',
      wizardData.destino?.domicilio?.calle || '',
      wizardData.vehiculo?.placa || '',
      wizardData.conductor?.id || '',
      Math.floor(Date.now() / 60000) // Agrupar por minutos
    ].join('|');
    
    return btoa(key).slice(0, 32);
  }

  // Verificar cache con TTL
  getCached(signature: string): CacheEntry | null {
    const cached = this.cache.get(signature);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(signature);
      return null;
    }
    
    return cached;
  }

  // Establecer cache
  setCache(signature: string, data: any): void {
    this.cache.set(signature, {
      data,
      timestamp: Date.now(),
      signature
    });

    // Limpiar cache expirado
    if (this.cache.size > 1000) {
      this.cleanExpiredCache();
    }
  }

  // Limpiar cache expirado
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  // Procesar queue de requests
  async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) return;

    this.processing = true;
    
    try {
      // Procesar en lotes
      while (this.requestQueue.length > 0) {
        const batch = this.requestQueue.splice(0, BATCH_SIZE);
        await Promise.allSettled(batch.map(fn => fn()));
        
        // Pequeña pausa entre lotes para no saturar
        if (this.requestQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    } finally {
      this.processing = false;
    }
  }

  // Agregar request al queue
  enqueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.requestQueue.length >= REQUEST_QUEUE_SIZE) {
        reject(new Error('Queue llena. Intente más tarde.'));
        return;
      }

      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      // Procesar queue automáticamente
      this.processQueue();
    });
  }
}

const viajeManager = new OptimizedViajeManager();

export const useOptimizedViajes = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const retryCountRef = useRef<Map<string, number>>(new Map());

  // Crear viaje optimizado con retry y cache
  const crearViajeOptimizado = useCallback(async (wizardData: ViajeWizardData): Promise<Viaje> => {
    const signature = viajeManager.generateSignature(wizardData);
    
    // Verificar cache first
    const cached = viajeManager.getCached(signature);
    if (cached?.data) {
      console.log('🚀 Viaje obtenido desde cache:', signature);
      return cached.data;
    }

    // Validaciones básicas rápidas
    if (!wizardData.cliente?.rfc) {
      throw new Error('RFC del cliente es requerido');
    }

    if (!wizardData.origen || !wizardData.destino) {
      throw new Error('Origen y destino son requeridos');
    }

    const createViaje = async (): Promise<Viaje> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar duplicados en BD con query optimizada
      const { data: existing } = await supabase
        .from('viajes')
        .select('id, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 120000).toISOString())
        .limit(1)
        .maybeSingle();

      if (existing) {
        throw new Error('Viaje similar creado recientemente. Espere antes de crear otro.');
      }

      // Crear viaje con datos optimizados
      const viajeId = `viaje-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const viajeData = {
        id: viajeId,
        carta_porte_id: `CP-${Date.now()}`,
        origen: wizardData.origen.domicilio?.calle || wizardData.origen.direccion || '',
        destino: wizardData.destino.domicilio?.calle || wizardData.destino.direccion || '',
        conductor_id: wizardData.conductor?.id,
        vehiculo_id: wizardData.vehiculo?.id,
        estado: 'programado' as const,
        fecha_inicio_programada: wizardData.origen.fechaHoraSalidaLlegada || new Date().toISOString(),
        fecha_fin_programada: wizardData.destino.fechaHoraSalidaLlegada || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        observaciones: `${wizardData.cliente.nombre_razon_social} - ${wizardData.distanciaRecorrida || 0} km`,
        tracking_data: wizardData,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('viajes')
        .insert(viajeData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Viaje creado:', data.id);
      return data as Viaje;
    };

    // Retry logic
    const executeWithRetry = async (): Promise<Viaje> => {
      const retryCount = retryCountRef.current.get(signature) || 0;
      
      try {
        const result = await viajeManager.enqueue(createViaje);
        
        // Cache result
        viajeManager.setCache(signature, result);
        
        // Reset retry count
        retryCountRef.current.delete(signature);
        
        return result;
      } catch (error) {
        if (retryCount < RETRY_ATTEMPTS) {
          retryCountRef.current.set(signature, retryCount + 1);
          
          // Exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return executeWithRetry();
        }
        
        retryCountRef.current.delete(signature);
        throw error;
      }
    };

    setIsCreating(true);
    
    try {
      const result = await executeWithRetry();
      
      // Invalidar cache de queries de forma optimizada
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      
      toast.success(`Viaje creado: ${result.origen} → ${result.destino}`);
      return result;
    } finally {
      setIsCreating(false);
    }
  }, [queryClient]);

  return {
    crearViajeOptimizado,
    isCreating,
    // Estadísticas de rendimiento
    getCacheStats: () => ({
      cacheSize: viajeManager['cache'].size,
      queueSize: viajeManager['requestQueue'].length,
      isProcessing: viajeManager['processing']
    })
  };
};
