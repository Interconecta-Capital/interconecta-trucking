
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
  console.log('🔍 [mapConfiguracionFromDB] Datos RAW recibidos de BD:', JSON.stringify({
    rfc_emisor: dbData.rfc_emisor,
    razon_social: dbData.razon_social,
    regimen_fiscal: dbData.regimen_fiscal,
    domicilio_fiscal: dbData.domicilio_fiscal,
    seguro_resp_civil: dbData.seguro_resp_civil,
    seguro_carga: dbData.seguro_carga,
    seguro_ambiental: dbData.seguro_ambiental,
    proveedor_timbrado: dbData.proveedor_timbrado
  }, null, 2));

  // Manejar domicilio_fiscal que puede ser null o un objeto vacío
  const domicilio = (typeof dbData.domicilio_fiscal === 'object' && dbData.domicilio_fiscal !== null) 
    ? dbData.domicilio_fiscal 
    : {};
  
  // Manejar seguros que pueden ser null o objetos vacíos
  const seguroRespCivil = (typeof dbData.seguro_resp_civil === 'object' && dbData.seguro_resp_civil !== null)
    ? dbData.seguro_resp_civil
    : {};
  
  const seguroCarga = (typeof dbData.seguro_carga === 'object' && dbData.seguro_carga !== null)
    ? dbData.seguro_carga
    : {};
  
  const seguroAmbiental = (typeof dbData.seguro_ambiental === 'object' && dbData.seguro_ambiental !== null)
    ? dbData.seguro_ambiental
    : {};
  
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
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('No hay usuario autenticado');
        return false;
      }

      console.log('💾 [guardarConfiguracion] ===== INICIO GUARDADO =====');
      console.log('💾 [guardarConfiguracion] Datos a guardar (antes de mapeo):', JSON.stringify(datos, null, 2));
      
      // ✅ FASE 5.2: Validación PRE-guardado
      console.log('🔍 [VALIDACIÓN PRE-GUARDADO] Iniciando validaciones...');
      
      // Validar campos obligatorios de datos fiscales
      if (datos.razon_social !== undefined && !datos.razon_social?.trim()) {
        console.error('❌ [VALIDACIÓN] razon_social está vacía');
        toast.error('La razón social no puede estar vacía');
        throw new Error('Validación fallida: razon_social vacía');
      }
      
      if (datos.rfc_emisor !== undefined && !datos.rfc_emisor?.trim()) {
        console.error('❌ [VALIDACIÓN] rfc_emisor está vacío');
        toast.error('El RFC no puede estar vacío');
        throw new Error('Validación fallida: rfc_emisor vacío');
      }
      
      if (datos.regimen_fiscal !== undefined && !datos.regimen_fiscal?.trim()) {
        console.error('❌ [VALIDACIÓN] regimen_fiscal está vacío');
        toast.error('El régimen fiscal no puede estar vacío');
        throw new Error('Validación fallida: regimen_fiscal vacío');
      }
      
      if (datos.codigo_postal !== undefined && !/^\d{5}$/.test(datos.codigo_postal)) {
        console.error('❌ [VALIDACIÓN] codigo_postal inválido:', datos.codigo_postal);
        toast.error('El código postal debe tener 5 dígitos');
        throw new Error('Validación fallida: codigo_postal inválido');
      }
      
      console.log('✅ [VALIDACIÓN PRE-GUARDADO] Todas las validaciones pasadas');

      // Construir el objeto de actualización
      const updateData: any = {};

      // Mapear campos simples - ASEGURARSE de incluir todos los campos importantes
      if (datos.rfc_emisor !== undefined) {
        updateData.rfc_emisor = datos.rfc_emisor.trim();
        console.log('✅ RFC a guardar:', updateData.rfc_emisor);
      }
      if (datos.razon_social !== undefined) {
        updateData.razon_social = datos.razon_social.trim();
        console.log('✅ Razón Social a guardar:', updateData.razon_social);
      }
      if (datos.regimen_fiscal !== undefined) {
        updateData.regimen_fiscal = datos.regimen_fiscal.trim();
        console.log('✅ Régimen Fiscal a guardar:', updateData.regimen_fiscal);
      }

      // Construir domicilio_fiscal - SIEMPRE construir si cualquier campo de dirección está presente
      const tieneDatosDomicilio = datos.calle || datos.codigo_postal || datos.colonia || 
                                   datos.municipio || datos.estado || datos.numero_exterior;
      
      if (tieneDatosDomicilio) {
        updateData.domicilio_fiscal = {
          calle: (datos.calle || '').trim(),
          numero_exterior: (datos.numero_exterior || '').trim(),
          numero_interior: (datos.numero_interior || '').trim(),
          colonia: (datos.colonia || '').trim(),
          localidad: (datos.localidad || '').trim(),
          municipio: (datos.municipio || '').trim(),
          estado: (datos.estado || '').trim(),
          pais: (datos.pais || 'MEX').trim(),
          codigo_postal: (datos.codigo_postal || '').trim(),
          referencia: (datos.referencia || '').trim()
        };
        console.log('✅ Domicilio Fiscal a guardar:', JSON.stringify(updateData.domicilio_fiscal, null, 2));
      }

      // Seguros - guardar como null si están vacíos, o con ambos campos si están presentes
      if (datos.seguro_resp_civil_empresa !== undefined) {
        const seguro = datos.seguro_resp_civil_empresa;
        const tienePoliza = seguro?.poliza && seguro.poliza.trim() !== '';
        const tieneAseguradora = seguro?.aseguradora && seguro.aseguradora.trim() !== '';
        
        updateData.seguro_resp_civil = (tienePoliza && tieneAseguradora)
          ? { poliza: seguro.poliza.trim(), aseguradora: seguro.aseguradora.trim() }
          : null;
        
        console.log('✅ Seguro Resp. Civil a guardar:', updateData.seguro_resp_civil);
      }

      if (datos.seguro_carga_empresa !== undefined) {
        const seguro = datos.seguro_carga_empresa;
        const tienePoliza = seguro?.poliza && seguro.poliza.trim() !== '';
        const tieneAseguradora = seguro?.aseguradora && seguro.aseguradora.trim() !== '';
        
        updateData.seguro_carga = (tienePoliza && tieneAseguradora)
          ? { poliza: seguro.poliza.trim(), aseguradora: seguro.aseguradora.trim() }
          : null;
        
        console.log('✅ Seguro Carga a guardar:', updateData.seguro_carga);
      }

      if (datos.seguro_ambiental_empresa !== undefined) {
        const seguro = datos.seguro_ambiental_empresa;
        const tienePoliza = seguro?.poliza && seguro.poliza.trim() !== '';
        const tieneAseguradora = seguro?.aseguradora && seguro.aseguradora.trim() !== '';
        
        updateData.seguro_ambiental = (tienePoliza && tieneAseguradora)
          ? { poliza: seguro.poliza.trim(), aseguradora: seguro.aseguradora.trim() }
          : null;
        
        console.log('✅ Seguro Ambiental a guardar:', updateData.seguro_ambiental);
      }

      if (datos.proveedor_timbrado !== undefined) {
        updateData.proveedor_timbrado = datos.proveedor_timbrado.trim();
        console.log('✅ Proveedor Timbrado a guardar:', updateData.proveedor_timbrado);
      }
      if (datos.permisos_sct_empresa !== undefined) updateData.permisos_sct = datos.permisos_sct_empresa;
      if (datos.modo_pruebas !== undefined) updateData.modo_pruebas = datos.modo_pruebas;
      if (datos.serie_carta_porte !== undefined) updateData.serie_carta_porte = datos.serie_carta_porte;
      if (datos.folio_inicial !== undefined) updateData.folio_inicial = datos.folio_inicial;

      console.log('🚀 [guardarConfiguracion] Objeto FINAL a enviar a BD:', JSON.stringify(updateData, null, 2));

      const { data, error } = await supabase
        .from('configuracion_empresa')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ [guardarConfiguracion] Error al guardar en BD:', error);
        toast.error(`Error al guardar: ${error.message}`);
        throw error;
      }

      if (!data) {
        console.error('❌ [guardarConfiguracion] No se actualizó ningún registro');
        toast.error('No se pudo guardar la configuración. Intenta recargar la página.');
        throw new Error('No se actualizó ningún registro en la BD');
      }

      console.log('✅ [guardarConfiguracion] Datos guardados correctamente en BD:', JSON.stringify(data, null, 2));

      if (data) {
        setConfiguracion(mapConfiguracionFromDB(data));
      }

      // CRÍTICO: Recargar desde BD y revalidar para sincronizar
      console.log('🔄 Recargando configuración desde BD...');
      await cargarConfiguracion();
      
      console.log('🔄 Revalidando configuración completa...');
      const { ConfiguracionEmisorService } = await import('@/services/configuracion/ConfiguracionEmisorService');
      const validacion = await ConfiguracionEmisorService.validarConfiguracionCompleta();
      
      // Actualizar flag de configuracion_completa basado en validación real
      if (validacion.isValid !== data.configuracion_completa) {
        await supabase
          .from('configuracion_empresa')
          .update({ configuracion_completa: validacion.isValid })
          .eq('user_id', user.id);
          
        if (validacion.isValid) {
          toast.success('🎉 Configuración empresarial completa');
        }
      }

      toast.success('Configuración guardada correctamente');
      console.log('✅ [guardarConfiguracion] ===== FIN GUARDADO EXITOSO =====');
      return true;
    } catch (error) {
      console.error('💥 Error guardando configuración:', error);
      toast.error('Error al guardar la configuración');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

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
    cargarConfiguracion,
    recargar: cargarConfiguracion
  };
};
