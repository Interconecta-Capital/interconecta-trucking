
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
      
      // Usar profiles como base temporal hasta que se actualicen los tipos
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error cargando perfil:', profileError);
      } else if (profileData) {
        // Mapear datos del perfil a la estructura esperada
        const configData: ConfiguracionEmpresarial = {
          id: profileData.id,
          user_id: profileData.id,
          razon_social: profileData.empresa || '',
          rfc_emisor: profileData.rfc || '',
          regimen_fiscal: '',
          calle: '',
          colonia: '',
          municipio: '',
          estado: '',
          pais: 'MEX',
          codigo_postal: '',
          serie_carta_porte: 'CP',
          folio_inicial: 1,
          seguro_resp_civil_empresa: {},
          seguro_carga_empresa: {},
          seguro_ambiental_empresa: {},
          permisos_sct_empresa: [],
          proveedor_timbrado: 'interno',
          modo_pruebas: true,
          configuracion_completa: false,
          validado_sat: false
        };
        setConfiguracion(configData);
      }

      // Por ahora usar array vacío para certificados
      setCertificados([]);

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

      // Actualizar perfil con los datos básicos
      const { error } = await supabase
        .from('profiles')
        .update({
          empresa: datos.razon_social,
          rfc: datos.rfc_emisor
        })
        .eq('id', configuracion?.user_id);

      if (error) throw error;

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
      toast.success('Certificado agregado exitosamente (simulado)');
      await cargarConfiguracion();
      
    } catch (error) {
      console.error('Error agregando certificado:', error);
      toast.error('Error al agregar el certificado');
      throw error;
    }
  };

  const activarCertificado = async (certificadoId: string) => {
    try {
      toast.success('Certificado activado exitosamente (simulado)');
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
