
import { useEffect } from 'react';
import axios from 'axios';
import { useGlobalUpgradeModal } from './useGlobalUpgradeModal';

interface LimitReachedError {
  code: 'LIMIT_REACHED';
  limit_type: string;
  message: string;
  current_usage?: number;
  limit_value?: number;
}

export const useAxiosInterceptor = () => {
  const { showUpgradeModal } = useGlobalUpgradeModal();

  useEffect(() => {
    console.log('[AxiosInterceptor] 🔧 Configurando interceptor de errores...');
    
    // Interceptor para respuestas de error
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log('[AxiosInterceptor] ❌ Error capturado:', error);
        
        // Verificar si es un error HTTP 402 con código LIMIT_REACHED
        if (error.response?.status === 402) {
          const errorData = error.response.data as LimitReachedError;
          
          if (errorData.code === 'LIMIT_REACHED') {
            console.log('[AxiosInterceptor] 🚫 Límite alcanzado:', errorData);
            
            // Mostrar modal de upgrade con información del límite
            showUpgradeModal({
              title: 'Límite Alcanzado',
              message: errorData.message,
              limitType: errorData.limit_type,
              currentUsage: errorData.current_usage,
              limitValue: errorData.limit_value
            });
            
            // Prevenir que el error se propague
            return Promise.reject({ 
              ...error, 
              handled: true,
              limitReached: true 
            });
          }
        }
        
        // Para otros errores, dejar que se propaguen normalmente
        return Promise.reject(error);
      }
    );

    // Cleanup al desmontar
    return () => {
      console.log('[AxiosInterceptor] 🧹 Limpiando interceptor...');
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [showUpgradeModal]);
};
