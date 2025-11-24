import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutoConfiguracionSandboxProps {
  userId: string;
  onConfigActualizada?: () => void;
}

export function AutoConfiguracionSandbox({ userId, onConfigActualizada }: AutoConfiguracionSandboxProps) {
  const [aplicando, setAplicando] = useState(false);
  
  const aplicarDatosSAT = async () => {
    setAplicando(true);
    
    try {
      console.log('🔧 [AUTO-CONFIG] Aplicando datos oficiales del SAT...');
      
      // 1. Obtener datos oficiales de prueba del SAT
      const { data: rfcPrueba, error: rfcError } = await supabase
        .from('rfc_pruebas_sat')
        .select('*')
        .eq('rfc', 'EKU9003173C9')
        .single();
      
      if (rfcError || !rfcPrueba) {
        console.error('❌ [AUTO-CONFIG] Error obteniendo datos del SAT:', rfcError);
        toast.error('No se encontraron datos de prueba del SAT', {
          description: 'Contacta a soporte técnico'
        });
        return;
      }
      
      console.log('✅ [AUTO-CONFIG] Datos del SAT obtenidos:', {
        rfc: rfcPrueba.rfc,
        nombre: rfcPrueba.nombre,
        regimen: rfcPrueba.regimen_fiscal
      });
      
      // 2. Actualizar configuración con datos oficiales
      const updatePayload = {
        rfc_emisor: rfcPrueba.rfc,
        razon_social: rfcPrueba.nombre,
        regimen_fiscal: rfcPrueba.regimen_fiscal || '601',
        validado_sat: true,
        fecha_ultima_validacion: new Date().toISOString(),
        modo_pruebas: true
      };
      
      console.log('💾 [AUTO-CONFIG] Actualizando configuración_empresa...', updatePayload);
      
      const { error: updateError } = await supabase
        .from('configuracion_empresa')
        .update(updatePayload)
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('❌ [AUTO-CONFIG] Error al actualizar:', updateError);
        toast.error('Error al actualizar configuración', {
          description: updateError.message
        });
        return;
      }
      
      console.log('✅ [AUTO-CONFIG] Configuración actualizada exitosamente');
      
      toast.success('✅ Datos oficiales del SAT aplicados', {
        description: `RFC: ${rfcPrueba.rfc}\nNombre: ${rfcPrueba.nombre}`,
        duration: 5000
      });
      
      // Notificar al componente padre para recargar
      if (onConfigActualizada) {
        onConfigActualizada();
      }
      
    } catch (error: any) {
      console.error('❌ [AUTO-CONFIG] Error inesperado:', error);
      toast.error('Error inesperado', {
        description: error.message || 'Intenta de nuevo'
      });
    } finally {
      setAplicando(false);
    }
  };
  
  return (
    <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800 dark:text-blue-200">
        Modo Pruebas Activo (Sandbox)
      </AlertTitle>
      <AlertDescription className="space-y-3 text-blue-700 dark:text-blue-300">
        <p>
          Para hacer pruebas de timbrado, <strong>debes usar los datos oficiales del SAT</strong>.
          El PAC valida que el RFC y nombre del emisor coincidan exactamente con los registros del SAT.
        </p>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Datos que se aplicarán:</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            <li><strong>RFC:</strong> EKU9003173C9</li>
            <li><strong>Razón Social:</strong> ESCUELA KEMPER URGATE</li>
            <li><strong>Régimen Fiscal:</strong> 601 - General de Ley Personas Morales</li>
          </ul>
        </div>
        <Button 
          onClick={aplicarDatosSAT} 
          disabled={aplicando}
          className="mt-2 bg-blue-600 hover:bg-blue-700"
        >
          <Wand2 className={`h-4 w-4 mr-2 ${aplicando ? 'animate-spin' : ''}`} />
          {aplicando ? 'Aplicando...' : 'Usar Datos Oficiales del SAT'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
