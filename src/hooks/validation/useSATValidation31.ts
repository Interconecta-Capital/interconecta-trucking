import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CartaPorte31Data, ValidationResult } from '@/types/validationTypes';
import { CartaPorteData } from '@/types/cartaPorte';
import { SATValidation31Enhanced } from '@/services/validation/SATValidation31Enhanced';

export const useSATValidation31 = () => {
  // Convert CartaPorteData to CartaPorte31Data format
  const convertToCartaPorte31Data = (data: CartaPorteData): CartaPorte31Data => {
    return {
      rfcEmisor: data.rfcEmisor || '',
      rfcReceptor: data.rfcReceptor || '',
      nombreEmisor: data.nombreEmisor || '',
      nombreReceptor: data.nombreReceptor || '',
      tipoCfdi: data.tipoCfdi || 'Traslado',
      transporteInternacional: data.transporteInternacional === 'Sí' || data.transporteInternacional === true,
      registroIstmo: data.registroIstmo || false,
      
      ubicaciones: data.ubicaciones?.map(ub => ({
        id: ub.id_ubicacion || ub.id || '',
        id_ubicacion: ub.id_ubicacion || ub.id || '', // Ensure this field is always present and required
        tipo_ubicacion: ub.tipo_ubicacion,
        coordenadas: ub.coordenadas ? {
          latitud: ub.coordenadas.latitud,
          longitud: ub.coordenadas.longitud
        } : undefined,
        tipo_estacion: ub.tipo_estacion,
        numero_estacion: ub.numero_estacion,
        kilometro: ub.kilometro,
        domicilio: {
          codigo_postal: ub.domicilio.codigo_postal,
          estado: ub.domicilio.estado,
          municipio: ub.domicilio.municipio,
          calle: ub.domicilio.calle
        }
      })) || [],
      
      mercancias: data.mercancias?.map(merc => ({
        bienes_transp: merc.bienes_transp,
        cantidad: merc.cantidad,
        peso_kg: merc.peso_kg,
        fraccion_arancelaria: merc.fraccion_arancelaria,
        tipo_embalaje: merc.embalaje,
        dimensiones: merc.dimensiones ? {
          largo: merc.dimensiones.largo,
          ancho: merc.dimensiones.ancho,
          alto: merc.dimensiones.alto
        } : undefined,
        numero_piezas: merc.numero_piezas,
        regimen_aduanero: merc.regimen_aduanero
      })) || [],
      
      autotransporte: data.autotransporte ? {
        placa_vm: data.autotransporte.placa_vm,
        peso_bruto_vehicular: data.autotransporte.peso_bruto_vehicular,
        tipo_carroceria: data.autotransporte.tipo_carroceria,
        carga_maxima: data.autotransporte.carga_maxima,
        tarjeta_circulacion: data.autotransporte.tarjeta_circulacion,
        vigencia_tarjeta_circulacion: data.autotransporte.vigencia_tarjeta_circulacion,
        remolques: data.autotransporte.remolques?.map(rem => ({
          placa: rem.placa,
          subtipo_rem: rem.subtipo_rem
        })) || []
      } : undefined,
      
      figuras: data.figuras?.map(fig => ({
        rfc_figura: fig.rfc_figura,
        nombre_figura: fig.nombre_figura,
        tipo_figura: fig.tipo_figura
      })) || [],

      // Nuevos campos v3.1
      version31Fields: {
        transporteEspecializado: false,
        tipoCarroceria: data.autotransporte?.tipo_carroceria,
        registroISTMO: data.registroIstmo || false,
        remolquesCCP: data.autotransporte?.remolques?.map(rem => ({
          placa: rem.placa,
          subtipo_rem: rem.subtipo_rem
        })) || []
      },
      
      regimenAduanero: data.regimenesAduaneros?.[0],
      regimenesAduaneros: data.regimenesAduaneros || []
    };
  };

  // Validación básica v3.1
  const validacionBasica = useMutation({
    mutationFn: async (cartaPorteData: CartaPorteData): Promise<ValidationResult> => {
      console.log('Iniciando validación básica v3.1...');
      
      const cartaPorte31Data = convertToCartaPorte31Data(cartaPorteData);
      
      return await SATValidation31Enhanced.validarCompleta(cartaPorte31Data);
    },
    onSuccess: (result) => {
      if (result.isValid) {
        toast.success('Validación básica completada exitosamente');
      } else {
        toast.error(`Errores encontrados: ${result.errors.length}`);
      }
    },
    onError: (error: any) => {
      console.error('Error en validación básica:', error);
      toast.error(`Error en validación: ${error.message}`);
    }
  });

  // Validación de distancias
  const validacionDistancias = useMutation({
    mutationFn: async (cartaPorteData: CartaPorteData): Promise<ValidationResult> => {
      console.log('Validando distancias...');
      
      const errors: string[] = [];
      
      if (!cartaPorteData.ubicaciones || cartaPorteData.ubicaciones.length < 2) {
        errors.push('Se requieren al menos 2 ubicaciones');
      }
      
      const distanciaTotal = cartaPorteData.ubicaciones?.reduce((total, ub) => {
        return total + (ub.distancia_recorrida || 0);
      }, 0) || 0;
      
      if (distanciaTotal <= 0) {
        errors.push('La distancia total debe ser mayor a 0');
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    },
    onSuccess: (result) => {
      if (result.isValid) {
        toast.success('Validación de distancias completada');
      } else {
        toast.error('Errores en validación de distancias');
      }
    },
    onError: (error: any) => {
      console.error('Error validando distancias:', error);
      toast.error(`Error: ${error.message}`);
    }
  });

  // Validación de códigos postales
  const validacionCodigosPostales = useMutation({
    mutationFn: async (cartaPorteData: CartaPorteData): Promise<ValidationResult> => {
      console.log('Validando códigos postales...');
      
      const errors: string[] = [];
      
      cartaPorteData.ubicaciones?.forEach((ubicacion, index) => {
        const cp = ubicacion.domicilio?.codigo_postal;
        if (!cp || !/^\d{5}$/.test(cp)) {
          errors.push(`Código postal inválido en ubicación ${index + 1}`);
        }
      });
      
      return {
        isValid: errors.length === 0,
        errors
      };
    },
    onSuccess: (result) => {
      if (result.isValid) {
        toast.success('Códigos postales validados correctamente');
      } else {
        toast.error('Errores en códigos postales');
      }
    },
    onError: (error: any) => {
      console.error('Error validando códigos postales:', error);
      toast.error(`Error: ${error.message}`);
    }
  });

  // Validación de mercancías peligrosas
  const validacionMercanciasPeligrosas = useMutation({
    mutationFn: async (cartaPorteData: CartaPorteData): Promise<ValidationResult> => {
      console.log('Validando mercancías peligrosas...');
      
      const errors: string[] = [];
      
      cartaPorteData.mercancias?.forEach((mercancia, index) => {
        // Fix the boolean comparison - check for boolean true or string 'Sí'
        const isMaterialPeligroso = mercancia.material_peligroso === true || 
                                  (typeof mercancia.material_peligroso === 'string' && mercancia.material_peligroso === 'Sí');
        
        if (isMaterialPeligroso) {
          if (!mercancia.cve_material_peligroso) {
            errors.push(`Falta clave de material peligroso en mercancía ${index + 1}`);
          }
        }
      });
      
      return {
        isValid: errors.length === 0,
        errors
      };
    },
    onSuccess: (result) => {
      if (result.isValid) {
        toast.success('Mercancías peligrosas validadas');
      } else {
        toast.error('Errores en mercancías peligrosas');
      }
    },
    onError: (error: any) => {
      console.error('Error validando mercancías peligrosas:', error);
      toast.error(`Error: ${error.message}`);
    }
  });

  // Validación de transporte internacional
  const validacionTransporteInternacional = useMutation({
    mutationFn: async (cartaPorteData: CartaPorteData): Promise<ValidationResult> => {
      console.log('Validando transporte internacional...');
      
      const cartaPorte31Data = convertToCartaPorte31Data(cartaPorteData);
      return await SATValidation31Enhanced.validarTransporteInternacional(cartaPorte31Data);
    },
    onSuccess: (result) => {
      if (result.isValid) {
        toast.success('Transporte internacional validado');
      } else {
        toast.error('Errores en transporte internacional');
      }
    },
    onError: (error: any) => {
      console.error('Error validando transporte internacional:', error);
      toast.error(`Error: ${error.message}`);
    }
  });

  // Validación completa
  const validacionCompleta = useMutation({
    mutationFn: async (cartaPorteData: CartaPorteData): Promise<ValidationResult> => {
      console.log('Iniciando validación completa...');
      
      const resultados = await Promise.all([
        validacionBasica.mutateAsync(cartaPorteData),
        validacionDistancias.mutateAsync(cartaPorteData),
        validacionCodigosPostales.mutateAsync(cartaPorteData),
        validacionMercanciasPeligrosas.mutateAsync(cartaPorteData),
        validacionTransporteInternacional.mutateAsync(cartaPorteData)
      ]);
      
      const todosLosErrores = resultados.flatMap(r => r.errors);
      
      return {
        isValid: todosLosErrores.length === 0,
        errors: todosLosErrores
      };
    },
    onSuccess: (result) => {
      if (result.isValid) {
        toast.success('¡Validación completa exitosa!');
      } else {
        toast.error(`Validación completa falló: ${result.errors.length} errores`);
      }
    },
    onError: (error: any) => {
      console.error('Error en validación completa:', error);
      toast.error(`Error: ${error.message}`);
    }
  });

  return {
    validacionBasica,
    validacionDistancias,
    validacionCodigosPostales,
    validacionMercanciasPeligrosas,
    validacionTransporteInternacional,
    validacionCompleta,
    
    // Estados de carga
    isValidating: validacionBasica.isPending || 
                 validacionDistancias.isPending || 
                 validacionCodigosPostales.isPending || 
                 validacionMercanciasPeligrosas.isPending || 
                 validacionTransporteInternacional.isPending || 
                 validacionCompleta.isPending,
    
    // Métodos de validación directa
    validarBasico: validacionBasica.mutateAsync,
    validarCompleto: validacionCompleta.mutateAsync,
  };
};
