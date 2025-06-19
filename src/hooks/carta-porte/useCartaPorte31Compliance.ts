
import { useState, useCallback, useEffect } from 'react';
import { SATValidation31Enhanced, ValidationSAT31Result } from '@/services/validation/SATValidation31Enhanced';
import { CartaPorte31QRGenerator } from '@/services/carta-porte/CartaPorte31QRGenerator';
import { useToast } from '@/hooks/use-toast';

interface UseCartaPorte31ComplianceOptions {
  cartaPorteData: any;
  enableAutoValidation?: boolean;
}

export function useCartaPorte31Compliance({ 
  cartaPorteData, 
  enableAutoValidation = true 
}: UseCartaPorte31ComplianceOptions) {
  const [validationResult, setValidationResult] = useState<ValidationSAT31Result | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [lastValidation, setLastValidation] = useState<Date | null>(null);
  const { toast } = useToast();

  // Validación automática cuando cambien los datos
  useEffect(() => {
    if (enableAutoValidation && cartaPorteData) {
      const debounceTimer = setTimeout(() => {
        validateCartaPorte31();
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [cartaPorteData, enableAutoValidation]);

  const validateCartaPorte31 = useCallback(async () => {
    if (!cartaPorteData) return;

    setIsValidating(true);
    try {
      // Asegurar que la versión sea 3.1
      const dataWith31 = {
        ...cartaPorteData,
        version: '3.1',
        cartaPorteVersion: '3.1'
      };

      const result = await SATValidation31Enhanced.validateCompleteCartaPorte31(dataWith31);
      setValidationResult(result);
      setLastValidation(new Date());

      // Mostrar notificaciones solo para errores críticos
      if (result.criticalIssues.length > 0) {
        toast({
          title: "Errores críticos detectados",
          description: `Se encontraron ${result.criticalIssues.length} errores que deben corregirse`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error en validación SAT 3.1:', error);
      setValidationResult({
        isValid: false,
        message: 'Error en validación',
        errors: ['Error interno de validación'],
        warnings: [],
        recommendations: [],
        complianceScore: 0,
        criticalIssues: ['Error interno de validación'],
        version31Specific: []
      });
    } finally {
      setIsValidating(false);
    }
  }, [cartaPorteData, toast]);

  const generateQRCode31 = useCallback(async (timbradoData?: {
    uuid: string;
    fechaTimbrado: string;
  }) => {
    try {
      const idCCP = CartaPorte31QRGenerator.generateIdCCP31();
      const fechaOrigen = cartaPorteData?.ubicaciones?.find((u: any) => u.tipoUbicacion === 'Origen')?.fechaHoraSalidaLlegada || new Date().toISOString().slice(0, 19);
      const fechaTimbrado = timbradoData?.fechaTimbrado || new Date().toISOString().slice(0, 19);

      const qrUrl = CartaPorte31QRGenerator.generateQRCode31({
        uuid: timbradoData?.uuid || 'TEMP-UUID',
        fechaOrigen,
        fechaTimbrado,
        idCCP
      });

      // Validar estructura del QR
      const qrValidation = CartaPorte31QRGenerator.validateQRStructure31(qrUrl);
      if (!qrValidation.isValid) {
        throw new Error(`QR inválido: ${qrValidation.errors.join(', ')}`);
      }

      setQrCodeUrl(qrUrl);
      return { qrUrl, idCCP };

    } catch (error) {
      console.error('Error generando QR 3.1:', error);
      toast({
        title: "Error generando código QR",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      return null;
    }
  }, [cartaPorteData, toast]);

  const checkVersion31Compliance = useCallback(() => {
    const compliance = {
      hasCorrectVersion: cartaPorteData?.version === '3.1' || cartaPorteData?.cartaPorteVersion === '3.1',
      hasValidIdCCP: true, // Se validará en tiempo de timbrado
      hasCompleteUbicaciones: cartaPorteData?.ubicaciones?.length >= 2,
      hasDetailedMercancias: cartaPorteData?.mercancias?.some((m: any) => 
        m.descripcion && m.descripcion.length > 10 && !m.descripcion.includes('undefined')
      ),
      hasCompleteAutotransporte: !!(
        cartaPorteData?.autotransporte?.perm_sct &&
        cartaPorteData?.autotransporte?.num_permiso_sct &&
        cartaPorteData?.autotransporte?.placa_vm
      ),
      hasOperatorFigure: cartaPorteData?.figuras?.some((f: any) => f.tipoFigura === '01'),
    };

    const completedChecks = Object.values(compliance).filter(Boolean).length;
    const totalChecks = Object.keys(compliance).length;
    const compliancePercentage = Math.round((completedChecks / totalChecks) * 100);

    return {
      compliance,
      compliancePercentage,
      isFullyCompliant: completedChecks === totalChecks
    };
  }, [cartaPorteData]);

  const getRecommendations31 = useCallback(() => {
    const recommendations: string[] = [];

    if (!cartaPorteData?.version || cartaPorteData.version !== '3.1') {
      recommendations.push('Actualizar a versión 3.1 del Complemento Carta Porte (obligatorio desde 17/07/2024)');
    }

    if (cartaPorteData?.mercancias?.some((m: any) => m.descripcion && m.descripcion.toLowerCase().includes('jaguar'))) {
      recommendations.push('Para fauna silvestre: Verificar permisos SEMARNAT y incluir números en descripción');
      recommendations.push('Cumplir NOM-051-ZOO-1995 para trato humanitario durante transporte');
    }

    if (cartaPorteData?.rfcEmisor === 'XAXX010101000') {
      recommendations.push('RFC genérico no es válido para Carta Porte - usar RFC específico');
    }

    const ubicaciones = cartaPorteData?.ubicaciones || [];
    if (ubicaciones.some((u: any) => !u.distanciaRecorrida && u.tipoUbicacion === 'Destino')) {
      recommendations.push('Campo DistanciaRecorrida es obligatorio para ubicación Destino');
    }

    return recommendations;
  }, [cartaPorteData]);

  return {
    validationResult,
    isValidating,
    qrCodeUrl,
    lastValidation,
    validateCartaPorte31,
    generateQRCode31,
    checkVersion31Compliance,
    getRecommendations31,
    // Estados derivados
    isValid: validationResult?.isValid || false,
    complianceScore: validationResult?.complianceScore || 0,
    criticalIssues: validationResult?.criticalIssues || [],
    version31Features: validationResult?.version31Specific || []
  };
}
