import { useState, useCallback } from 'react';
import { Mercancia } from '@/types/mercancias';
import { toast } from 'sonner';

interface BatchResult {
  success: boolean;
  added: number;
  failed: number;
  errors: string[];
}

export const useMercanciasBatch = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const addMercanciasBatch = useCallback(async (
    mercancias: Partial<Mercancia>[],
    onAdd: (mercancia: Partial<Mercancia>) => Promise<boolean>
  ): Promise<BatchResult> => {
    setIsProcessing(true);
    
    const result: BatchResult = {
      success: true,
      added: 0,
      failed: 0,
      errors: []
    };

    try {
      console.log(`📦 Procesando lote de ${mercancias.length} mercancías...`);

      for (let i = 0; i < mercancias.length; i++) {
        const mercancia = mercancias[i];
        
        try {
          // Validar campos requeridos
          if (!mercancia.descripcion || !mercancia.claveProdServ || !mercancia.claveUnidad) {
            result.failed++;
            result.errors.push(`Mercancía ${i + 1}: Faltan campos requeridos`);
            continue;
          }

          // Agregar mercancía
          const success = await onAdd(mercancia);
          
          if (success) {
            result.added++;
            console.log(`✅ Mercancía ${i + 1}/${mercancias.length} agregada: ${mercancia.descripcion}`);
          } else {
            result.failed++;
            result.errors.push(`Mercancía ${i + 1}: Error al guardar`);
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Mercancía ${i + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          console.error(`❌ Error agregando mercancía ${i + 1}:`, error);
        }

        // Pequeña pausa para evitar saturar el sistema
        if (i < mercancias.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Mostrar resultado
      if (result.added > 0) {
        toast.success(`✅ ${result.added} mercancía${result.added > 1 ? 's' : ''} agregada${result.added > 1 ? 's' : ''} correctamente`);
      }

      if (result.failed > 0) {
        toast.error(`❌ ${result.failed} mercancía${result.failed > 1 ? 's' : ''} con errores`);
      }

      result.success = result.added > 0 && result.failed === 0;

    } catch (error) {
      console.error('❌ Error en procesamiento de lote:', error);
      result.success = false;
      result.errors.push('Error crítico en el procesamiento del lote');
      toast.error('Error procesando el lote de mercancías');
    } finally {
      setIsProcessing(false);
    }

    return result;
  }, []);

  return {
    addMercanciasBatch,
    isProcessing
  };
};
