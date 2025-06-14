
import { useState, useCallback, useEffect } from 'react';
import { CartaPorteVersion, VERSION_INFO } from '@/types/cartaPorteVersions';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

interface UseVersionManagerOptions {
  initialVersion?: CartaPorteVersion;
  onVersionChange?: (version: CartaPorteVersion) => void;
  formData?: CartaPorteData;
  updateFormData?: (section: string, data: any) => void;
}

export function useVersionManager({
  initialVersion = '3.1',
  onVersionChange,
  formData,
  updateFormData
}: UseVersionManagerOptions = {}) {
  const [version, setVersion] = useState<CartaPorteVersion>(initialVersion);
  const [isChangingVersion, setIsChangingVersion] = useState(false);

  const migrateFormData = useCallback((newVersion: CartaPorteVersion, currentData?: CartaPorteData) => {
    if (!currentData || !updateFormData) return;

    console.log(`[VersionManager] Migrating from ${version} to ${newVersion}`);
    
    const migratedData = { ...currentData };
    
    if (version === '3.0' && newVersion === '3.1') {
      // Migración de 3.0 a 3.1
      
      // RegimenAduanero (string) → RegimenesAduaneros (array)
      if (migratedData.regimenAduanero && !migratedData.regimenesAduaneros) {
        migratedData.regimenesAduaneros = [migratedData.regimenAduanero];
        delete migratedData.regimenAduanero;
      }
      
      // FraccionArancelaria ahora es obligatorio en 3.1
      migratedData.mercancias = migratedData.mercancias?.map(mercancia => ({
        ...mercancia,
        fraccion_arancelaria: mercancia.fraccion_arancelaria || ''
      })) || [];
      
      // Agregar campos nuevos de 3.1 con valores por defecto
      migratedData.version31Fields = {
        transporteEspecializado: false,
        tipoCarroceria: '',
        registroISTMO: migratedData.registroIstmo || false,
        ...migratedData.version31Fields
      };
      
    } else if (version === '3.1' && newVersion === '3.0') {
      // Migración de 3.1 a 3.0
      
      // RegimenesAduaneros (array) → RegimenAduanero (string)
      if (migratedData.regimenesAduaneros?.length > 0) {
        migratedData.regimenAduanero = migratedData.regimenesAduaneros[0];
        delete migratedData.regimenesAduaneros;
      }
      
      // Remover campos específicos de 3.1
      delete migratedData.version31Fields;
      
      // FraccionArancelaria opcional en 3.0
      migratedData.mercancias = migratedData.mercancias?.map(mercancia => ({
        ...mercancia,
        fraccion_arancelaria: mercancia.fraccion_arancelaria || undefined
      })) || [];
    }
    
    // Actualizar versión en los datos
    migratedData.cartaPorteVersion = newVersion;
    
    // Aplicar datos migrados
    updateFormData('configuracion', migratedData);
    
  }, [version, updateFormData]);

  const toggleVersion = useCallback(async (newVersion: CartaPorteVersion) => {
    if (newVersion === version) return;
    
    setIsChangingVersion(true);
    
    try {
      // Migrar datos si están disponibles
      if (formData) {
        migrateFormData(newVersion, formData);
      }
      
      // Cambiar versión
      setVersion(newVersion);
      
      // Notificar cambio
      onVersionChange?.(newVersion);
      
      console.log(`[VersionManager] Version changed to ${newVersion}`);
      
    } catch (error) {
      console.error('[VersionManager] Error changing version:', error);
    } finally {
      setIsChangingVersion(false);
    }
  }, [version, formData, migrateFormData, onVersionChange]);

  const getVersionInfo = useCallback(() => {
    return VERSION_INFO[version];
  }, [version]);

  const isFieldVisible = useCallback((fieldName: string) => {
    // Definir qué campos son visibles en cada versión
    const version31OnlyFields = [
      'regimenesAduaneros',
      'transporteEspecializado',
      'tipoCarroceria',
      'remolquesCCP',
      'version31Fields'
    ];
    
    const version30OnlyFields = [
      'regimenAduanero'
    ];
    
    if (version === '3.1') {
      return !version30OnlyFields.includes(fieldName);
    } else {
      return !version31OnlyFields.includes(fieldName);
    }
  }, [version]);

  const isFieldRequired = useCallback((fieldName: string) => {
    // Definir campos que cambian de requeridos entre versiones
    const requiredIn31NotIn30 = ['fraccion_arancelaria'];
    
    if (version === '3.1' && requiredIn31NotIn30.includes(fieldName)) {
      return true;
    }
    
    return false;
  }, [version]);

  // Persistir versión en localStorage
  useEffect(() => {
    localStorage.setItem('cartaporte-preferred-version', version);
  }, [version]);

  // Cargar versión preferida al inicializar
  useEffect(() => {
    const savedVersion = localStorage.getItem('cartaporte-preferred-version') as CartaPorteVersion;
    if (savedVersion && savedVersion !== initialVersion) {
      setVersion(savedVersion);
    }
  }, [initialVersion]);

  return {
    version,
    toggleVersion,
    getVersionInfo,
    isFieldVisible,
    isFieldRequired,
    isChangingVersion,
    migrateFormData
  };
}
