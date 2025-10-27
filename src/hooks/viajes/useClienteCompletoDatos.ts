import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ClienteCompletoData {
  id: string;
  nombre_razon_social: string;
  rfc: string;
  tipo_persona?: string;
  email?: string;
  telefono?: string;
  regimen_fiscal?: string;
  uso_cfdi?: string;
  domicilio_fiscal?: any;
  tipo?: string;
  activo?: boolean;
}

export function useClienteCompletoDatos(clienteId?: string) {
  const [clienteCompleto, setClienteCompleto] = useState<ClienteCompletoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clienteId) {
      setClienteCompleto(null);
      return;
    }

    cargarClienteCompleto(clienteId);
  }, [clienteId]);

  const cargarClienteCompleto = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Cargando datos completos del cliente:', id);
      
      // Primero intentar cargar desde socios
      const { data: socioData, error: socioError } = await supabase
        .from('socios')
        .select('*')
        .eq('id', id)
        .single();

      if (socioData) {
        console.log('✅ Cliente cargado desde socios:', socioData);
        setClienteCompleto({
          id: socioData.id,
          nombre_razon_social: socioData.nombre_razon_social,
          rfc: socioData.rfc,
          tipo_persona: socioData.tipo_persona,
          email: socioData.email,
          telefono: socioData.telefono,
          regimen_fiscal: socioData.regimen_fiscal,
          uso_cfdi: socioData.uso_cfdi,
          domicilio_fiscal: socioData.direccion_fiscal,
          tipo: 'socio',
          activo: socioData.activo
        });
        return;
      }

      // Si no está en socios, intentar desde clientes_proveedores
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes_proveedores')
        .select('*')
        .eq('id', id)
        .single();

      if (clienteData) {
        console.log('✅ Cliente cargado desde clientes_proveedores:', clienteData);
        setClienteCompleto({
          id: clienteData.id,
          nombre_razon_social: clienteData.nombre_razon_social,
          rfc: clienteData.rfc,
          regimen_fiscal: clienteData.regimen_fiscal,
          uso_cfdi: clienteData.uso_cfdi,
          domicilio_fiscal: clienteData.domicilio_fiscal,
          tipo: clienteData.tipo,
          activo: clienteData.activo
        });
        return;
      }

      // Si no se encuentra en ninguna tabla
      console.error('❌ Cliente no encontrado en ninguna tabla');
      setError('Cliente no encontrado');

    } catch (err) {
      console.error('❌ Error cargando datos completos del cliente:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return {
    clienteCompleto,
    loading,
    error,
    recargar: () => clienteId && cargarClienteCompleto(clienteId)
  };
}
