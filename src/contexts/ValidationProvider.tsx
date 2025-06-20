
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ValidationResult31, ValidationEngine31Enhanced } from '@/services/validation/ValidationEngine31Enhanced';

interface ValidationContextType {
  validaciones: ValidationResult31[];
  isValidating: boolean;
  isValid: boolean;
  validarCartaPorte: (cartaPorteData: any) => Promise<void>;
  aplicarAutoFix: (validation: ValidationResult31) => void;
  exportarChecklist: () => void;
  limpiarValidaciones: () => void;
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export function ValidationProvider({ children }: { children: React.ReactNode }) {
  const [validaciones, setValidaciones] = useState<ValidationResult31[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationEngine] = useState(() => new ValidationEngine31Enhanced());

  const isValid = validaciones.filter(v => v.level === 'bloqueante').length === 0;

  const validarCartaPorte = useCallback(async (cartaPorteData: any) => {
    setIsValidating(true);
    try {
      console.log('🔍 Iniciando validación completa...');
      const resultados = await validationEngine.validateCartaPorteCompleta(cartaPorteData);
      setValidaciones(resultados);
      
      // Log de resultados
      const stats = {
        bloqueantes: resultados.filter(v => v.level === 'bloqueante').length,
        advertencias: resultados.filter(v => v.level === 'advertencia').length,
        informativas: resultados.filter(v => v.level === 'informacion').length
      };
      
      console.log('✅ Validación completada:', stats);
      
    } catch (error) {
      console.error('❌ Error en validación:', error);
      setValidaciones([{
        isValid: false,
        level: 'bloqueante',
        category: 'general',
        title: 'Error en Validación',
        message: 'Ocurrió un error durante el proceso de validación',
        solution: 'Revise los datos ingresados e intente nuevamente'
      }]);
    } finally {
      setIsValidating(false);
    }
  }, [validationEngine]);

  const aplicarAutoFix = useCallback((validation: ValidationResult31) => {
    if (!validation.autoFix) return;

    console.log('🔧 Aplicando auto-corrección:', validation.autoFix);
    
    // Aquí se implementaría la lógica para aplicar la corrección automática
    // Por ahora, solo removemos la validación de la lista
    setValidaciones(prev => prev.filter(v => v !== validation));
    
    // En una implementación real, se actualizarían los datos del formulario
    // y se re-ejecutaría la validación
  }, []);

  const exportarChecklist = useCallback(() => {
    const checklist = {
      fecha: new Date().toISOString(),
      totalValidaciones: validaciones.length,
      bloqueantes: validaciones.filter(v => v.level === 'bloqueante').length,
      advertencias: validaciones.filter(v => v.level === 'advertencia').length,
      validaciones: validaciones.map(v => ({
        categoria: v.category,
        nivel: v.level,
        titulo: v.title,
        mensaje: v.message,
        solucion: v.solution,
        corregible: !!v.autoFix
      }))
    };

    const blob = new Blob([JSON.stringify(checklist, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-cumplimiento-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📋 Checklist exportado');
  }, [validaciones]);

  const limpiarValidaciones = useCallback(() => {
    setValidaciones([]);
  }, []);

  const value: ValidationContextType = {
    validaciones,
    isValidating,
    isValid,
    validarCartaPorte,
    aplicarAutoFix,
    exportarChecklist,
    limpiarValidaciones
  };

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
}

export function useValidation() {
  const context = useContext(ValidationContext);
  if (context === undefined) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
}
