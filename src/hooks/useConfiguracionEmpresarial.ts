
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RFCValidator } from '@/services/validacion/RFCValidator';

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

// Helper para mapear datos de DB a interfaz
const mapConfiguracionFromDB = (dbData: any): ConfiguracionEmpresarial => {
  // Manejar domicilio_fiscal que puede ser null, undefined o un objeto
  const domicilio = dbData.domicilio_fiscal || {};
  
  // Manejar seguros que pueden ser null, undefined o un objeto
  const seguroRespCivil = dbData.seguro_resp_civil || {};
  const seguroCarga = dbData.seguro_carga || {};
  const seguroAmbiental = dbData.seguro_ambiental || {};
  
  console.log('🔍 [mapConfiguracionFromDB] Datos recibidos de BD:', {
    rfc: dbData.rfc_emisor,
    regimen_fiscal: dbData.regimen_fiscal,
    domicilio_fiscal: dbData.domicilio_fiscal,
    seguro_resp_civil: dbData.seguro_resp_civil,
    seguro_carga: dbData.seguro_carga,
    seguro_ambiental: dbData.seguro_ambiental,
  });
  
  return {
    id: dbData.id,
    user_id: dbData.user_id,
    razon_social: dbData.razon_social || '',
    rfc_emisor: dbData.rfc_emisor || '',
    regimen_fiscal: dbData.regimen_fiscal || '',
    calle: domicilio.calle || '',
    numero_exterior: domicilio.numero_exterior || '',
    numero_interior: domicilio.numero_interior || '',
    colonia: domicilio.colonia || '',
    localidad: domicilio.localidad || '',
    referencia: domicilio.referencia || '',
    municipio: domicilio.municipio || '',
    estado: domicilio.estado || '',
    pais: domicilio.pais || 'MEX',
    codigo_postal: domicilio.codigo_postal || '',
    serie_carta_porte: dbData.serie_carta_porte || 'CP',
    folio_inicial: dbData.folio_inicial || 1,
    seguro_resp_civil_empresa: (seguroRespCivil.poliza || seguroRespCivil.aseguradora) ? {
      poliza: seguroRespCivil.poliza || '',
      aseguradora: seguroRespCivil.aseguradora || ''
    } : null,
    seguro_carga_empresa: (seguroCarga.poliza || seguroCarga.aseguradora) ? {
      poliza: seguroCarga.poliza || '',
      aseguradora: seguroCarga.aseguradora || ''
    } : null,
    seguro_ambiental_empresa: (seguroAmbiental.poliza || seguroAmbiental.aseguradora) ? {
      poliza: seguroAmbiental.poliza || '',
      aseguradora: seguroAmbiental.aseguradora || ''
    } : null,
    permisos_sct_empresa: dbData.permisos_sct || [],
    proveedor_timbrado: dbData.proveedor_timbrado || 'fiscal_api',
    modo_pruebas: dbData.modo_pruebas !== false,
    configuracion_completa: dbData.configuracion_completa || false,
    validado_sat: dbData.validado_sat || false
  };
};

// Helper para mapear certificado de DB
const mapCertificadoFromDB = (dbData: any): CertificadoEmpresarial => {
  return {
    id: dbData.id,
    user_id: dbData.user_id,
    nombre_certificado: dbData.nombre_certificado || '',
    numero_serie: dbData.numero_certificado || '',
    rfc_titular: dbData.rfc_titular || '',
    razon_social_titular: dbData.razon_social || '',
    fecha_inicio: dbData.fecha_inicio_vigencia || '',
    fecha_vencimiento: dbData.fecha_fin_vigencia || '',
    archivo_cer_path: dbData.archivo_cer_path || '',
    archivo_key_path: dbData.archivo_key_path || '',
    es_valido: dbData.validado || false,
    es_activo: dbData.activo || false,
    validado_sat: dbData.validado || false
  };
};

export const useConfiguracionEmpresarial = () => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionEmpresarial | null>(null);
  const [certificados, setCertificados] = useState<CertificadoEmpresarial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const cargarConfiguracion = async () => {
    try {
      setIsLoading(true);
      
      // CAMBIO: Leer de configuracion_empresa en lugar de profiles
      const { data: configData, error: configError } = await supabase
        .from('configuracion_empresa')
        .select('*')
        .single();

      if (configError) {
        if (configError.code === 'PGRST116') {
          // No existe configuración, crear una nueva
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: newConfig, error: insertError } = await supabase
              .from('configuracion_empresa')
              .insert({
                user_id: user.id,
                razon_social: '',
                rfc_emisor: '',
                regimen_fiscal: ''
              })
              .select()
              .single();
              
            if (!insertError && newConfig) {
              setConfiguracion(mapConfiguracionFromDB(newConfig));
            }
          }
        } else {
          console.error('Error cargando configuración:', configError);
        }
      } else if (configData) {
        setConfiguracion(mapConfiguracionFromDB(configData));
      }

      // Cargar certificados reales de certificados_digitales
      const { data: certsData } = await supabase
        .from('certificados_digitales')
        .select('*')
        .eq('activo', true);
        
      if (certsData) {
        setCertificados(certsData.map(mapCertificadoFromDB));
      }

    } catch (error) {
      console.error('Error general:', error);
      toast.error('Error al cargar la configuración empresarial');
    } finally {
      setIsLoading(false);
    }
  };

  const guardarConfiguracion = async (datos: Partial<ConfiguracionEmpresarial>) => {
    console.log('💾 [guardarConfiguracion] Datos a guardar:', datos);
    
    try {
      setIsSaving(true);

      if (!configuracion?.user_id) {
        throw new Error('No se puede guardar: usuario no identificado');
      }

      // ✅ Solo actualizar domicilio si se envían datos de domicilio
      const actualizarDomicilio = datos.calle !== undefined || datos.codigo_postal !== undefined;
      let domicilioFiscal = null;
      
      if (actualizarDomicilio) {
        domicilioFiscal = {
          calle: datos.calle || '',
          numero_exterior: datos.numero_exterior || '',
          numero_interior: datos.numero_interior || '',
          colonia: datos.colonia || '',
          localidad: datos.localidad || '',
          municipio: datos.municipio || '',
          estado: datos.estado || '',
          pais: datos.pais || 'MEX',
          codigo_postal: datos.codigo_postal || '',
          referencia: datos.referencia || ''
        };
      }

      // ✅ Construir objeto de actualización solo con campos definidos
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (datos.razon_social !== undefined) updateData.razon_social = datos.razon_social;
      if (datos.rfc_emisor !== undefined) updateData.rfc_emisor = datos.rfc_emisor?.toUpperCase();
      if (datos.regimen_fiscal !== undefined) updateData.regimen_fiscal = datos.regimen_fiscal;
      if (domicilioFiscal) updateData.domicilio_fiscal = domicilioFiscal;
      if (datos.serie_carta_porte !== undefined) updateData.serie_carta_porte = datos.serie_carta_porte;
      if (datos.folio_inicial !== undefined) updateData.folio_inicial = datos.folio_inicial;
      
      // ✅ Guardar seguros como null si están vacíos
      if (datos.seguro_resp_civil_empresa !== undefined) {
        const seguro = datos.seguro_resp_civil_empresa as any;
        updateData.seguro_resp_civil = (seguro?.poliza?.trim() || seguro?.aseguradora?.trim()) ? seguro : null;
      }
      if (datos.seguro_carga_empresa !== undefined) {
        const seguro = datos.seguro_carga_empresa as any;
        updateData.seguro_carga = (seguro?.poliza?.trim() || seguro?.aseguradora?.trim()) ? seguro : null;
      }
      if (datos.seguro_ambiental_empresa !== undefined) {
        const seguro = datos.seguro_ambiental_empresa as any;
        updateData.seguro_ambiental = (seguro?.poliza?.trim() || seguro?.aseguradora?.trim()) ? seguro : null;
      }
      
      if (datos.permisos_sct_empresa !== undefined) updateData.permisos_sct = datos.permisos_sct_empresa;
      if (datos.proveedor_timbrado !== undefined) updateData.proveedor_timbrado = datos.proveedor_timbrado;
      if (datos.modo_pruebas !== undefined) updateData.modo_pruebas = datos.modo_pruebas;

      console.log('✅ [guardarConfiguracion] Datos enviados a BD:', updateData);
      
      // Actualizar solo los campos enviados
      const { error } = await supabase
        .from('configuracion_empresa')
        .update(updateData)
        .eq('user_id', configuracion.user_id);

      if (error) {
        console.error('❌ [guardarConfiguracion] Error guardando:', error);
        throw error;
      }

      console.log('✅ [guardarConfiguracion] Guardado exitoso, recargando...');
      toast.success('✅ Configuración guardada exitosamente');
      
      // Recargar configuración después de guardar
      await cargarConfiguracion();
      
      // ✅ Usar validación del servicio para actualizar flag automáticamente
      const { ConfiguracionEmisorService } = await import('@/services/configuracion/ConfiguracionEmisorService');
      const validacion = await ConfiguracionEmisorService.validarConfiguracionCompleta();
      
      // Actualizar flag de configuracion_completa si cambió
      if (validacion.isValid !== configuracion?.configuracion_completa) {
        await supabase
          .from('configuracion_empresa')
          .update({ configuracion_completa: validacion.isValid })
          .eq('user_id', configuracion.user_id);
          
        // Mostrar mensaje si ahora está completa
        if (validacion.isValid) {
          toast.success('🎉 Configuración empresarial completa');
        }
      }
      
      console.log('✅ [guardarConfiguracion] Recarga completada');
    } catch (error) {
      console.error('❌ [guardarConfiguracion] Error al guardar configuración:', error);
      toast.error('❌ Error al guardar la configuración');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // NOTA: Los métodos agregarCertificado y activarCertificado fueron eliminados.
  // Ahora la gestión de certificados se hace a través del hook useCertificadosDigitales
  // para evitar duplicación de lógica y mantener una única fuente de verdad.

  const validarConfiguracionCompleta = (): boolean => {
    if (!configuracion) return false;
    
    // Campos obligatorios básicos
    const camposBasicos = [
      configuracion.razon_social?.trim(),
      configuracion.rfc_emisor?.trim(),
      configuracion.regimen_fiscal?.trim(),
      configuracion.calle?.trim(),
      configuracion.colonia?.trim(),
      configuracion.municipio?.trim(),
      configuracion.estado?.trim(),
      configuracion.codigo_postal?.trim()
    ];

    // Verificar que todos los campos básicos tengan valor
    if (!camposBasicos.every(campo => campo && campo.length > 0)) {
      return false;
    }

    // Validar RFC usando servicio centralizado
    const rfcValidation = RFCValidator.validar(configuracion.rfc_emisor);
    if (!rfcValidation.valido) {
      return false;
    }

    // Validar que tenga al menos un seguro configurado
    if (!configuracion.seguro_resp_civil_empresa?.poliza) {
      return false;
    }

    // Validar vigencia del seguro
    if (configuracion.seguro_resp_civil_empresa?.vigencia_poliza) {
      const fechaVigencia = new Date(configuracion.seguro_resp_civil_empresa.vigencia_poliza);
      const hoy = new Date();
      
      if (fechaVigencia < hoy) {
        console.warn('El seguro de responsabilidad civil está vencido');
        return false;
      }
    }

    // Validar que tenga certificado digital válido
    if (!tieneCertificadoValido()) {
      return false;
    }

    return true;
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
    // Datos
    configuracion,
    certificados,
    
    // Estados
    isLoading,
    isSaving,
    
    // Métodos
    guardarConfiguracion,
    validarConfiguracionCompleta,
    tieneCertificadoValido,
    recargar: cargarConfiguracion
    
    // NOTA: agregarCertificado y activarCertificado fueron eliminados.
    // Usar useCertificadosDigitales para gestión de certificados.
  };
};
