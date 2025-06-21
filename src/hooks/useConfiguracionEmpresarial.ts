
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConfiguracionEmpresarial {
  id?: string;
  user_id?: string;
  razon_social: string;
  rfc_emisor: string;
  regimen_fiscal: string;
  calle: string;
  numero_exterior?: string;
  numero_interior?: string;
  colonia: string;
  localidad?: string;
  referencia?: string;
  municipio: string;
  estado: string;
  pais: string;
  codigo_postal: string;
  serie_carta_porte: string;
  folio_inicial: number;
  seguro_resp_civil_empresa: any;
  seguro_carga_empresa: any;
  seguro_ambiental_empresa: any;
  permisos_sct_empresa: any[];
  proveedor_timbrado: string;
  modo_pruebas: boolean;
  configuracion_completa: boolean;
  validado_sat: boolean;
}

export interface CertificadoEmpresarial {
  id?: string;
  user_id?: string;
  configuracion_id?: string;
  nombre_certificado: string;
  numero_serie: string;
  rfc_titular: string;
  razon_social_titular?: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  dias_para_vencer?: number;
  archivo_cer_path?: string;
  archivo_key_path?: string;
  password_encriptado?: string;
  es_valido: boolean;
  es_activo: boolean;
  validado_sat: boolean;
}

export const useConfiguracionEmpresarial = () => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionEmpresarial | null>(null);
  const [certificados, setCertificados] = useState<CertificadoEmpresarial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const cargarConfiguracion = async () => {
    try {
      setIsLoading(true);
      
      // Cargar configuración empresarial
      const { data: configData, error: configError } = await supabase
        .from('configuracion_empresarial')
        .select('*')
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.error('Error cargando configuración:', configError);
      } else if (configData) {
        setConfiguracion(configData);
      }

      // Cargar certificados
      const { data: certData, error: certError } = await supabase
        .from('certificados_empresariales')
        .select('*')
        .order('created_at', { ascending: false });

      if (certError) {
        console.error('Error cargando certificados:', certError);
      } else {
        setCertificados(certData || []);
      }

    } catch (error) {
      console.error('Error general:', error);
      toast.error('Error al cargar la configuración empresarial');
    } finally {
      setIsLoading(false);
    }
  };

  const guardarConfiguracion = async (datos: Partial<ConfiguracionEmpresarial>) => {
    try {
      setIsSaving(true);

      if (configuracion?.id) {
        // Actualizar configuración existente
        const { error } = await supabase
          .from('configuracion_empresarial')
          .update(datos)
          .eq('id', configuracion.id);

        if (error) throw error;
      } else {
        // Crear nueva configuración
        const { data, error } = await supabase
          .from('configuracion_empresarial')
          .insert([datos])
          .select()
          .single();

        if (error) throw error;
        setConfiguracion(data);
      }

      toast.success('Configuración guardada exitosamente');
      await cargarConfiguracion();
      
    } catch (error) {
      console.error('Error guardando configuración:', error);
      toast.error('Error al guardar la configuración');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const agregarCertificado = async (certificado: Partial<CertificadoEmpresarial>) => {
    try {
      const { data, error } = await supabase
        .from('certificados_empresariales')
        .insert([{
          ...certificado,
          configuracion_id: configuracion?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Certificado agregado exitosamente');
      await cargarConfiguracion();
      
    } catch (error) {
      console.error('Error agregando certificado:', error);
      toast.error('Error al agregar el certificado');
      throw error;
    }
  };

  const activarCertificado = async (certificadoId: string) => {
    try {
      // Desactivar todos los certificados
      await supabase
        .from('certificados_empresariales')
        .update({ es_activo: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Activar el certificado seleccionado
      const { error } = await supabase
        .from('certificados_empresariales')
        .update({ es_activo: true })
        .eq('id', certificadoId);

      if (error) throw error;

      toast.success('Certificado activado exitosamente');
      await cargarConfiguracion();
      
    } catch (error) {
      console.error('Error activando certificado:', error);
      toast.error('Error al activar el certificado');
    }
  };

  const validarConfiguracionCompleta = () => {
    if (!configuracion) return false;
    
    const camposObligatorios = [
      'razon_social',
      'rfc_emisor', 
      'regimen_fiscal',
      'calle',
      'colonia',
      'municipio',
      'estado',
      'codigo_postal'
    ];

    return camposObligatorios.every(campo => 
      configuracion[campo as keyof ConfiguracionEmpresarial]
    );
  };

  const tieneCertificadoValido = () => {
    return certificados.some(cert => 
      cert.es_valido && 
      cert.es_activo && 
      new Date(cert.fecha_vencimiento) > new Date()
    );
  };

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  return {
    configuracion,
    certificados,
    isLoading,
    isSaving,
    guardarConfiguracion,
    agregarCertificado,
    activarCertificado,
    validarConfiguracionCompleta,
    tieneCertificadoValido,
    recargar: cargarConfiguracion
  };
};
