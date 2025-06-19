import { describe, test, expect, vi, beforeEach } from 'vitest';
import { XMLValidatorSAT } from '@/services/xml/xmlValidatorSAT';
import { XMLValidation } from '@/services/xml/xmlValidation';
import { CartaPorteData } from '@/types/cartaPorte';

const mockCartaPorteData: CartaPorteData = {
  tipoCreacion: 'manual',
  tipoCfdi: 'Traslado',
  rfcEmisor: 'TEST123456789',
  nombreEmisor: 'Test Company',
  rfcReceptor: 'RECV123456789',
  nombreReceptor: 'Receiver Company',
  transporteInternacional: 'No', // Changed to string
  cartaPorteVersion: '3.1',
  ubicaciones: [
    {
      id: 'ubicacion1',
      tipo_ubicacion: 'Origen', // Fixed property name
      rfc: 'TEST123456789',
      nombre: 'Test Location',
      domicilio: {
        calle: 'Test Street',
        numero_exterior: '123',
        codigo_postal: '12345',
        colonia: 'Test Colony',
        municipio: 'Test Municipality',
        estado: 'Test State',
        pais: 'México'
      },
      fecha_hora_salida_llegada: new Date().toISOString()
    },
    {
      id: 'ubicacion2',
      tipo_ubicacion: 'Destino', // Fixed property name
      rfc: 'RECV123456789',
      nombre: 'Destination Location',
      domicilio: {
        calle: 'Destination Street',
        numero_exterior: '456',
        codigo_postal: '54321',
        colonia: 'Destination Colony',
        municipio: 'Destination Municipality',
        estado: 'Destination State',
        pais: 'México'
      },
      fecha_hora_salida_llegada: new Date().toISOString()
    }
  ],
  mercancias: [
    {
      id: 'mercancia1',
      bienes_transp: 'Test Product',
      descripcion: 'Test product description',
      cantidad: 100,
      clave_unidad: 'KGM', // Added missing property
      peso_kg: 1000,
      unidad_peso_bruto: 'KGM', // Added missing property
      valor_mercancia: 50000,
      moneda: 'MXN'
    }
  ],
  autotransporte: {
    placa_vm: 'ABC123',
    anio_modelo_vm: 2020,
    config_vehicular: 'C2',
    perm_sct: 'TPAF01',
    num_permiso_sct: '123456',
    asegura_resp_civil: 'Test Insurance',
    poliza_resp_civil: 'POL123'
  },
  figuras: []
};

const mockValidXML = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4">
  <cfdi:Complemento>
    <cartaporte20:CartaPorte xmlns:cartaporte20="http://www.sat.gob.mx/CartaPorte20">
      <cartaporte20:Ubicaciones>
        <cartaporte20:Ubicacion TipoUbicacion="Origen" />
      </cartaporte20:Ubicaciones>
    </cartaporte20:CartaPorte>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

describe('XML Validation - Robust Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('XMLValidatorSAT', () => {
    test('should validate complete CartaPorte data successfully', async () => {
      const result = await XMLValidatorSAT.validateCartaPorteCompliance(mockCartaPorteData);
      
      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should detect missing required fields', async () => {
      const invalidData = {
        ...mockCartaPorteData,
        rfcEmisor: '',
        rfcReceptor: ''
      };
      
      const result = await XMLValidatorSAT.validateCartaPorteCompliance(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('RFC Emisor es requerido');
      expect(result.errors).toContain('RFC Receptor es requerido');
    });

    test('should validate ubicaciones requirements', async () => {
      const dataWithoutUbicaciones = {
        ...mockCartaPorteData,
        ubicaciones: []
      };
      
      const result = await XMLValidatorSAT.validateCartaPorteCompliance(dataWithoutUbicaciones);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('ubicaciones'))).toBe(true);
    });

    test('should validate XML structure correctly', () => {
      const result = XMLValidatorSAT.validateXMLStructure(mockValidXML);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should detect invalid XML structure', () => {
      const invalidXML = '<invalid>content</invalid>';
      
      const result = XMLValidatorSAT.validateXMLStructure(invalidXML);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('XMLValidation', () => {
    test('should validate CartaPorte data with business rules', async () => {
      const result = await XMLValidation.validateCartaPorteData(mockCartaPorteData);
      
      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should generate warnings for incomplete data', async () => {
      const incompleteData = {
        ...mockCartaPorteData,
        mercancias: [],
        figuras: []
      };
      
      const result = await XMLValidation.validateCartaPorteData(incompleteData);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings).toContain('No se han especificado mercancías');
      expect(result.warnings).toContain('No se han especificado figuras de transporte');
    });

    test('should handle validation errors gracefully', async () => {
      // Mock para simular error en validación
      vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await XMLValidation.validateCartaPorteData(null as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    test('should validate complete flow: data -> XML -> SAT compliance', async () => {
      // Paso 1: Validar datos iniciales
      const dataValidation = await XMLValidation.validateCartaPorteData(mockCartaPorteData);
      expect(dataValidation.isValid).toBe(true);
      
      // Paso 2: Validar estructura XML
      const xmlValidation = XMLValidatorSAT.validateXMLStructure(mockValidXML);
      expect(xmlValidation.isValid).toBe(true);
      
      // Paso 3: Validar cumplimiento SAT
      const satValidation = await XMLValidatorSAT.validateCartaPorteCompliance(mockCartaPorteData);
      expect(satValidation.isValid).toBe(true);
    });

    test('should provide comprehensive error reporting', async () => {
      const invalidData = {
        ...mockCartaPorteData,
        rfcEmisor: '',
        rfcReceptor: '',
        ubicaciones: [],
        mercancias: [],
        figuras: []
      };
      
      const result = await XMLValidatorSAT.validateCartaPorteCompliance(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
      
      // Verificar que se reportan todos los errores principales
      const errorMessages = result.errors.join(' ');
      expect(errorMessages).toContain('RFC');
      expect(errorMessages.includes('ubicación') || errorMessages.includes('ubicaciones')).toBe(true);
    });
  });
});
