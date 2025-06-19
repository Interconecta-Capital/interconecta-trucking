import { useCallback } from 'react';
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
      
      // Usar directamente las ubicaciones completas
      ubicaciones: data.ubicaciones || [],
      
      // Asegurar que las mercancías tienen todos los campos obligatorios
      mercancias: data.mercancias?.map(merc => ({
        ...merc,
        descripcion: merc.descripcion || 'Sin descripción',
        cantidad: merc.cantidad || 1,
        clave_unidad: merc.clave_unidad || 'KGM',
        peso_kg: merc.peso_kg || 0,
      })) || [],
      
      // Usar directamente el autotransporte completo
      autotransporte: data.autotransporte,
      
      // Usar directamente las figuras completas
      figuras: data.figuras || [],

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
      
      regimenAduanero: data.regimenesAduaneros?.[0]?.clave_regimen || '',
      regimenesAduaneros: data.regimenesAduaneros?.map(r => r.clave_regimen) || []
    };
  };

  // Validación básica v3.1
  const validacionBasica = useMutation({
    mutationFn: async (cartaPorteData: CartaPorteData): Promise<ValidationResult> => {
      console.log('Iniciando validación básica v3.1...');
      
      const cartaPorte31Data = convertToCartaPorte31Data(cartaPorteData);
      
      try {
        return await SATValidation31Enhanced.validarCompleta(cartaPorte31Data);
      } catch (error) {
        console.error('Error en SATValidation31Enhanced:', error);
        return {
          isValid: false,
          errors: ['Error en validación SAT'],
          warnings: [],
          score: 0
        };
      }
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
        errors,
        warnings: [],
        score: errors.length === 0 ? 100 : 0
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
        errors,
        warnings: [],
        score: errors.length === 0 ? 100 : 0
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
        errors,
        warnings: [],
        score: errors.length === 0 ? 100 : 0
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
      try {
        return await SATValidation31Enhanced.validarTransporteInternacional(cartaPorte31Data);
      } catch (error) {
        console.error('Error en SATValidation31Enhanced transporte internacional:', error);
        return {
          isValid: false,
          errors: ['Error en validación de transporte internacional'],
          warnings: [],
          score: 0
        };
      }
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
      const todasLasAdvertencias = resultados.flatMap(r => r.warnings);
      const promedioScore = resultados.reduce((sum, r) => sum + r.score, 0) / resultados.length;
      
      return {
        isValid: todosLosErrores.length === 0,
        errors: todosLosErrores,
        warnings: todasLasAdvertencias,
        score: promedioScore
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

  const validateRegimenesAduaneros = useCallback((data: CartaPorteData): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (data.transporteInternacional) {
      if (!data.regimenesAduaneros || data.regimenesAduaneros.length === 0) {
        errors.push('Para transporte internacional se requiere al menos un régimen aduanero');
      } else {
        data.regimenesAduaneros.forEach((regimen, index) => {
          if (!regimen.clave_regimen) {
            errors.push(`Régimen aduanero ${index + 1}: falta clave de régimen`);
          }
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: errors.length === 0 ? 100 : 0
    };
  }, []);

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
    validateRegimenesAduaneros,
  };
};
