
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';

export class ViajeToCartaPorteMapper {
  static mapToCartaPorteData(wizardData: ViajeWizardData) {
    // Mapear datos básicos de configuración
    const configuracion = {
      version: '3.1',
      tipoComprobante: 'T', // Traslado
      emisor: {
        rfc: '', // Se debe configurar desde el perfil del usuario
        nombre: '',
        regimenFiscal: ''
      },
      receptor: {
        rfc: wizardData.cliente?.rfc || '',
        nombre: wizardData.cliente?.nombre_razon_social || '',
        usoCfdi: 'S01'
      }
    };

    // Mapear ubicaciones (origen y destino)
    const ubicaciones = [];
    
    if (wizardData.origen) {
      ubicaciones.push({
        tipoUbicacion: 'Origen',
        idUbicacion: 'OR000001',
        direccion: wizardData.origen.direccion,
        codigoPostal: wizardData.origen.codigoPostal,
        coordenadas: wizardData.origen.coordenadas,
        fechaHoraSalidaLlegada: new Date().toISOString()
      });
    }

    if (wizardData.destino) {
      ubicaciones.push({
        tipoUbicacion: 'Destino',
        idUbicacion: 'DE000001',
        direccion: wizardData.destino.direccion,
        codigoPostal: wizardData.destino.codigoPostal,
        coordenadas: wizardData.destino.coordenadas,
        distanciaRecorrida: wizardData.distanciaRecorrida,
        fechaHoraSalidaLlegada: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Mañana por defecto
      });
    }

    // Mapear mercancías básicas
    const mercancias = [{
      descripcion: wizardData.descripcionMercancia || 'Mercancía general',
      cantidad: 1,
      claveUnidad: 'H87', // Pieza
      unidad: 'Pieza',
      pesoKg: 100, // Peso por defecto
      valorMercancia: 1000, // Valor por defecto
      moneda: 'MXN',
      fraccionArancelaria: '99999999', // Por defecto para v3.1
      bienesTransp: '99999999'
    }];

    // Mapear autotransporte
    const autotransporte = {
      placa: wizardData.vehiculo?.placa || '',
      configVehicular: wizardData.vehiculo?.configuracion_vehicular || 'C2',
      pesoBrutoVehicular: wizardData.vehiculo?.peso_bruto_vehicular || 3500,
      anioModeloVm: wizardData.vehiculo?.anio || new Date().getFullYear()
    };

    // Mapear figuras de transporte
    const figuras = [];
    if (wizardData.conductor) {
      figuras.push({
        tipoFigura: '01', // Operador
        nombreFigura: wizardData.conductor.nombre,
        rfcFigura: wizardData.conductor.rfc || 'XEXX010101000',
        numLicencia: wizardData.conductor.num_licencia || '',
        tipoLicencia: wizardData.conductor.tipo_licencia || 'C'
      });
    }

    return {
      configuracion,
      ubicaciones,
      mercancias,
      autotransporte,
      figuras,
      // Metadatos del viaje
      tipoServicio: wizardData.tipoServicio,
      descripcionMercancia: wizardData.descripcionMercancia
    };
  }

  static mapToValidCartaPorteFormat(wizardData: ViajeWizardData) {
    const cartaPorteData = this.mapToCartaPorteData(wizardData);
    
    // Validar datos requeridos
    if (!cartaPorteData.configuracion.receptor.rfc) {
      throw new Error('RFC del cliente es requerido');
    }

    if (cartaPorteData.ubicaciones.length < 2) {
      throw new Error('Se requieren al menos origen y destino');
    }

    if (cartaPorteData.mercancias.length === 0) {
      throw new Error('Se requiere al menos una mercancía');
    }

    return cartaPorteData;
  }
}
