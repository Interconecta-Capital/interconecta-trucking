
import {
  CartaPorteData,
  UbicacionCompleta,
  MercanciaCompleta,
  AutotransporteCompleto,
  FiguraCompleta,
} from '@/types/cartaPorte';

// Tipo unificado para el formulario (basado en la estructura de BD)
export interface CartaPorteFormData {
  // Configuración básica
  configuracion: {
    version: '3.0' | '3.1';
    tipoComprobante: string;
    emisor: {
      rfc: string;
      nombre: string;
      regimenFiscal: string;
    };
    receptor: {
      rfc: string;
      nombre: string;
    };
  };
  
  // Datos principales (misma estructura que CartaPorteData)
  ubicaciones: UbicacionCompleta[];
  mercancias: MercanciaCompleta[];
  autotransporte: AutotransporteCompleto;
  figuras: FiguraCompleta[];
  
  // Campos de identificación y configuración
  tipoCreacion: 'plantilla' | 'carga' | 'manual';
  tipoCfdi: 'Ingreso' | 'Traslado';
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  transporteInternacional: boolean;
  registroIstmo: boolean;
  cartaPorteVersion: '3.0' | '3.1';
  cartaPorteId?: string;
  idCCP?: string;
  
  // Campos específicos por versión
  regimenAduanero?: string; // v3.0
  regimenesAduaneros?: Array<{
    clave_regimen: string;
    descripcion?: string;
    orden_secuencia: number;
  }>; // v3.1
}

// Hook principal de mapeo con validación de tipos
export const useCartaPorteMappers = () => {
  const formDataToCartaPorteData = (formData: CartaPorteFormData): CartaPorteData => {
    return {
      // Identificadores
      id: formData.cartaPorteId,
      idCCP: formData.idCCP || formData.cartaPorteId,
      cartaPorteId: formData.cartaPorteId,
      
      // Configuración
      tipoCreacion: formData.tipoCreacion,
      tipoCfdi: formData.tipoCfdi,
      cartaPorteVersion: formData.cartaPorteVersion,
      
      // Emisor y receptor
      rfcEmisor: formData.rfcEmisor,
      nombreEmisor: formData.nombreEmisor,
      rfcReceptor: formData.rfcReceptor,
      nombreReceptor: formData.nombreReceptor,
      
      // Transporte
      transporteInternacional: formData.transporteInternacional,
      registroIstmo: formData.registroIstmo,
      
      // Regímenes aduaneros (manejar diferencias de versión)
      regimenAduanero: formData.regimenAduanero,
      regimenesAduaneros: formData.regimenesAduaneros,
      
      // Datos principales (estructura directa)
      ubicaciones: formData.ubicaciones,
      mercancias: formData.mercancias,
      autotransporte: formData.autotransporte,
      figuras: formData.figuras,
    };
  };

  const cartaPorteDataToFormData = (cartaPorteData: CartaPorteData): CartaPorteFormData => {
    return {
      configuracion: {
        version: cartaPorteData.cartaPorteVersion || '3.1',
        tipoComprobante: cartaPorteData.tipoCfdi === 'Traslado' ? 'T' : 'I',
        emisor: {
          rfc: cartaPorteData.rfcEmisor || '',
          nombre: cartaPorteData.nombreEmisor || '',
          regimenFiscal: '',
        },
        receptor: {
          rfc: cartaPorteData.rfcReceptor || '',
          nombre: cartaPorteData.nombreReceptor || '',
        },
      },
      
      // Datos principales (estructura directa)
      ubicaciones: cartaPorteData.ubicaciones || [],
      mercancias: cartaPorteData.mercancias || [],
      autotransporte: cartaPorteData.autotransporte || getDefaultAutotransporte(),
      figuras: cartaPorteData.figuras || [],
      
      // Configuración básica
      tipoCreacion: cartaPorteData.tipoCreacion || 'manual',
      tipoCfdi: cartaPorteData.tipoCfdi || 'Traslado',
      rfcEmisor: cartaPorteData.rfcEmisor || '',
      nombreEmisor: cartaPorteData.nombreEmisor || '',
      rfcReceptor: cartaPorteData.rfcReceptor || '',
      nombreReceptor: cartaPorteData.nombreReceptor || '',
      transporteInternacional: cartaPorteData.transporteInternacional === true || cartaPorteData.transporteInternacional === 'Sí',
      registroIstmo: !!cartaPorteData.registroIstmo,
      cartaPorteVersion: cartaPorteData.cartaPorteVersion || '3.1',
      cartaPorteId: cartaPorteData.cartaPorteId,
      idCCP: cartaPorteData.idCCP || cartaPorteData.cartaPorteId,
      
      // Regímenes aduaneros según versión
      regimenAduanero: cartaPorteData.regimenAduanero,
      regimenesAduaneros: cartaPorteData.regimenesAduaneros,
    };
  };

  // Función helper para autotransporte por defecto
  const getDefaultAutotransporte = (): AutotransporteCompleto => ({
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    peso_bruto_vehicular: 0,
    remolques: [],
  });

  // Funciones de validación de migración entre versiones
  const validateMigrationTo31 = (data: CartaPorteData): string[] => {
    const errors: string[] = [];
    
    // Validar fracción arancelaria obligatoria en v3.1
    if (data.mercancias?.some(m => !m.fraccion_arancelaria)) {
      errors.push('Fracción arancelaria es obligatoria en versión 3.1');
    }
    
    // Validar peso bruto vehicular
    if (!data.autotransporte?.peso_bruto_vehicular) {
      errors.push('Peso bruto vehicular es obligatorio en versión 3.1');
    }
    
    return errors;
  };

  const validateMigrationTo30 = (data: CartaPorteData): string[] => {
    const errors: string[] = [];
    
    // Validaciones específicas para migrar a v3.0 si las hubiera
    // Por ejemplo, verificar que no hay campos exclusivos de v3.1
    
    return errors;
  };

  return {
    formDataToCartaPorteData,
    cartaPorteDataToFormData,
    validateMigrationTo31,
    validateMigrationTo30,
  };
};
