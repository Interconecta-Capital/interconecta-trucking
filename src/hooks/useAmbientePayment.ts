import { useState, useCallback } from 'react';
import { useOptimizedSuperuser } from './useOptimizedSuperuser';

interface AmbientePaymentConfig {
  mode: 'test' | 'prod';
  stripePublishableKey: string;
  canToggleTestMode: boolean;
  isTestMode: boolean;
  setForceTestMode: (enabled: boolean) => void;
}

/**
 * Hook para gestionar el ambiente de pagos (test/prod) de Stripe
 * 
 * - Solo superusers pueden forzar modo test
 * - Usuarios normales siempre usan producción
 * - Retorna la clave pública correcta según el modo
 */
export const useAmbientePayment = (): AmbientePaymentConfig => {
  const { isSuperuser } = useOptimizedSuperuser();
  const [forceTestMode, setForceTestMode] = useState(false);
  
  // Solo superusers pueden usar modo test
  const isTestMode = isSuperuser && forceTestMode;
  const mode = isTestMode ? 'test' : 'prod';
  
  // Seleccionar la clave pública correcta según el modo
  const stripePublishableKey = isTestMode 
    ? (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST || '')
    : (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

  const handleSetForceTestMode = useCallback((enabled: boolean) => {
    // Solo permitir cambio si es superuser
    if (isSuperuser) {
      setForceTestMode(enabled);
      console.log(`[AmbientePayment] Modo ${enabled ? 'TEST' : 'PROD'} activado por superuser`);
    }
  }, [isSuperuser]);

  return {
    mode,
    stripePublishableKey,
    canToggleTestMode: isSuperuser,
    isTestMode,
    setForceTestMode: handleSetForceTestMode
  };
};

/**
 * Configuración de precios de Stripe por plan
 * Mapea los planes a sus price IDs en Stripe
 */
export const STRIPE_PRICE_IDS = {
  // Producción
  prod: {
    operador: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_OPERADOR_MONTHLY || '',
      annual: import.meta.env.VITE_STRIPE_PRICE_OPERADOR_ANNUAL || ''
    },
    flota: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_FLOTA_MONTHLY || '',
      annual: import.meta.env.VITE_STRIPE_PRICE_FLOTA_ANNUAL || ''
    },
    business: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY || '',
      annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL || ''
    }
  },
  // Test
  test: {
    operador: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_OPERADOR_MONTHLY_TEST || '',
      annual: import.meta.env.VITE_STRIPE_PRICE_OPERADOR_ANNUAL_TEST || ''
    },
    flota: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_FLOTA_MONTHLY_TEST || '',
      annual: import.meta.env.VITE_STRIPE_PRICE_FLOTA_ANNUAL_TEST || ''
    },
    business: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY_TEST || '',
      annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL_TEST || ''
    }
  }
} as const;

/**
 * Paquetes de timbres disponibles para compra
 */
export const TIMBRE_PACKS = [
  { id: 'pack_100', cantidad: 100, precio: 199, precioUnitario: 1.99 },
  { id: 'pack_200', cantidad: 200, precio: 349, precioUnitario: 1.75 },
  { id: 'pack_300', cantidad: 300, precio: 449, precioUnitario: 1.50 },
  { id: 'pack_400', cantidad: 400, precio: 549, precioUnitario: 1.37 },
  { id: 'pack_500', cantidad: 500, precio: 599, precioUnitario: 1.20 }
] as const;
