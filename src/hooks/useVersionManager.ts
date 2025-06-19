
import { useState, useCallback } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';

export function useVersionManager() {
  const [currentVersion, setCurrentVersion] = useState<'3.0' | '3.1'>('3.1');

  const migrateTo30 = useCallback((data: CartaPorteData): CartaPorteData => {
    console.log('Migrando datos a versión 3.0');
    
    // Crear una copia de los datos
    const migratedData = { ...data };
    
    // Migrar campos específicos de versión 3.1 a 3.0
    if (data.regimenesAduaneros && data.regimenesAduaneros.length > 0) {
      // En versión 3.0, solo se permite un régimen aduanero
      migratedData.regimenAduanero = data.regimenesAduaneros[0];
      delete migratedData.regimenesAduaneros;
    }
    
    // Remover campos específicos de versión 3.1
    delete migratedData.version31Fields;
    
    // Establecer versión
    migratedData.cartaPorteVersion = '3.0';
    
    return migratedData;
  }, []);

  const migrateTo31 = useCallback((data: CartaPorteData): CartaPorteData => {
    console.log('Migrando datos a versión 3.1');
    
    // Crear una copia de los datos
    const migratedData = { ...data };
    
    // Migrar campos específicos de versión 3.0 a 3.1
    if (data.regimenAduanero) {
      migratedData.regimenesAduaneros = [data.regimenAduanero];
      delete migratedData.regimenAduanero;
    }
    
    // Agregar campos específicos de versión 3.1
    migratedData.version31Fields = {
      transporteEspecializado: false,
      tipoCarroceria: '',
      registroISTMO: false,
      ...data.version31Fields
    };
    
    // Establecer versión
    migratedData.cartaPorteVersion = '3.1';
    
    return migratedData;
  }, []);

  const switchVersion = useCallback((newVersion: '3.0' | '3.1', data: CartaPorteData): CartaPorteData => {
    if (newVersion === currentVersion) {
      return data;
    }

    let migratedData: CartaPorteData;
    
    if (newVersion === '3.0') {
      migratedData = migrateTo30(data);
    } else {
      migratedData = migrateTo31(data);
    }
    
    setCurrentVersion(newVersion);
    return migratedData;
  }, [currentVersion, migrateTo30, migrateTo31]);

  const validateVersionCompatibility = useCallback((data: CartaPorteData): { 
    isCompatible: boolean; 
    issues: string[] 
  } => {
    const issues: string[] = [];
    
    // Validaciones específicas por versión
    if (currentVersion === '3.0') {
      if (data.regimenesAduaneros && data.regimenesAduaneros.length > 1) {
        issues.push('Versión 3.0 solo admite un régimen aduanero');
      }
      if (data.version31Fields?.transporteEspecializado) {
        issues.push('Transporte especializado no está disponible en versión 3.0');
      }
    }
    
    return {
      isCompatible: issues.length === 0,
      issues
    };
  }, [currentVersion]);

  return {
    currentVersion,
    setCurrentVersion,
    switchVersion,
    migrateTo30,
    migrateTo31,
    validateVersionCompatibility
  };
}
