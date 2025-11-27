import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Badge compacto que muestra el estado de la configuración fiscal
 * Diseñado para colocarse junto al campo de País
 */
export function ConfiguracionFiscalStatus() {
  const { configuracion } = useConfiguracionEmpresarial();
  const { user } = useAuth();

  // Verificar si hay certificado activo
  const { data: certificadoActivo } = useQuery({
    queryKey: ['certificado-activo', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('certificados_digitales')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .gte('fecha_fin_vigencia', new Date().toISOString())
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching certificado:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id
  });

  // Verificar campos obligatorios
  const isComplete = 
    !!configuracion?.rfc_emisor && configuracion.rfc_emisor.length >= 12 &&
    !!configuracion?.razon_social && configuracion.razon_social.length >= 3 &&
    !!configuracion?.regimen_fiscal && configuracion.regimen_fiscal.length >= 3 &&
    !!configuracion?.codigo_postal && configuracion.codigo_postal.length === 5 &&
    !!configuracion?.calle &&
    !!configuracion?.estado &&
    !!configuracion?.municipio &&
    !!certificadoActivo?.activo;

  // Contar campos completados para el badge
  const fields = [
    configuracion?.rfc_emisor && configuracion.rfc_emisor.length >= 12,
    configuracion?.razon_social && configuracion.razon_social.length >= 3,
    configuracion?.regimen_fiscal && configuracion.regimen_fiscal.length >= 3,
    configuracion?.codigo_postal && configuracion.codigo_postal.length === 5,
    configuracion?.calle,
    configuracion?.estado,
    configuracion?.municipio,
    certificadoActivo?.activo
  ];
  const completedCount = fields.filter(Boolean).length;
  const totalFields = fields.length;

  if (isComplete) {
    return (
      <Badge className="bg-green-100 text-green-800 border border-green-300 hover:bg-green-100">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Datos fiscales completos
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-50">
      <AlertCircle className="h-3 w-3 mr-1" />
      Configuración incompleta ({completedCount}/{totalFields})
    </Badge>
  );
}
