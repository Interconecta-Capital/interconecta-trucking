
import React from 'react';
import { Page, Document, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#333',
    lineHeight: 1.4
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#166534',
    paddingBottom: 8
  },
  logo: {
    width: 80,
    height: 40,
    objectFit: 'contain'
  },
  issuerInfo: {
    textAlign: 'right',
    maxWidth: '60%',
    fontSize: 7
  },
  issuerName: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#166534',
    marginBottom: 2
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#166534'
  },
  section: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 2
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  column: {
    width: '48%'
  },
  fieldGroup: {
    marginBottom: 4
  },
  fieldLabel: {
    fontWeight: 'bold',
    fontSize: 7,
    color: '#666'
  },
  fieldValue: {
    fontSize: 7,
    marginBottom: 2
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    marginBottom: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    minHeight: 25,
    alignItems: 'flex-start'
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold',
    fontSize: 7,
    minHeight: 20
  },
  tableCell: {
    borderRightWidth: 0.5,
    borderRightColor: '#E5E7EB',
    padding: 4,
    textAlign: 'left',
    fontSize: 6,
    wordWrap: 'break-word',
    flexWrap: 'wrap'
  },
  tableCellTipo: {
    width: '8%',
    minWidth: 40
  },
  tableCellNombre: {
    width: '25%',
    minWidth: 120
  },
  tableCellDireccion: {
    width: '52%',
    minWidth: 200
  },
  tableCellDistancia: {
    width: '15%',
    minWidth: 60
  },
  tableCellClave: {
    width: '12%',
    minWidth: 60
  },
  tableCellDescripcion: {
    width: '35%',
    minWidth: 140
  },
  tableCellCantidad: {
    width: '12%',
    minWidth: 50
  },
  tableCellPeso: {
    width: '12%',
    minWidth: 50
  },
  tableCellPesoTotal: {
    width: '15%',
    minWidth: 60
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1.5,
    borderTopColor: '#166534',
    paddingTop: 8
  },
  qrCode: {
    width: 60,
    height: 60
  },
  fiscalSeals: {
    width: '75%',
    fontSize: 5,
    fontFamily: 'Courier'
  },
  sealText: {
    marginBottom: 2,
    wordBreak: 'break-all'
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 6,
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey'
  },
  twoColumnLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  column50: {
    width: '48%'
  },
  resumenBox: {
    backgroundColor: '#F8F9FA',
    padding: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4
  },
  resumenText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#374151'
  }
});

interface ResponsiveCartaPortePDFProps {
  cartaPorteData: any;
  datosTimbre?: any;
  qrCodeDataURL?: string;
  logoBase64?: string;
}

export const ResponsiveCartaPortePDF = ({ 
  cartaPorteData, 
  datosTimbre, 
  qrCodeDataURL, 
  logoBase64 
}: ResponsiveCartaPortePDFProps) => {
  
  // Calcular peso total correctamente
  const pesoTotalCalculado = cartaPorteData.mercancias?.reduce((total: number, m: any) => {
    const cantidad = Number(m.cantidad) || 0;
    const pesoUnitario = Number(m.peso_kg) || 0;
    return total + (cantidad * pesoUnitario);
  }, 0) || 0;

  return (
    <Document title={`Carta Porte - ${cartaPorteData.folio || 'Sin folio'}`}>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {logoBase64 && <Image style={styles.logo} src={logoBase64} />}
          <View style={styles.issuerInfo}>
            <Text style={styles.issuerName}>
              {cartaPorteData.nombreEmisor || 'Emisor no especificado'}
            </Text>
            <Text>RFC: {cartaPorteData.rfcEmisor || 'No especificado'}</Text>
            <Text>Fecha: {new Date().toLocaleDateString('es-MX')}</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>CARTA PORTE - CFDI DE TRASLADO</Text>

        {/* Información principal */}
        <View style={styles.twoColumnLayout}>
          {/* Columna izquierda - Receptor */}
          <View style={styles.column50}>
            <Text style={styles.sectionTitle}>Receptor</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nombre:</Text>
              <Text style={styles.fieldValue}>
                {cartaPorteData.nombreReceptor || 'No especificado'}
              </Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>RFC:</Text>
              <Text style={styles.fieldValue}>
                {cartaPorteData.rfcReceptor || 'No especificado'}
              </Text>
            </View>
          </View>

          {/* Columna derecha - Comprobante Fiscal */}
          <View style={styles.column50}>
            <Text style={styles.sectionTitle}>Comprobante Fiscal</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>UUID:</Text>
              <Text style={styles.fieldValue}>
                {datosTimbre?.uuid || 'Pendiente de timbrado'}
              </Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>IdCCP:</Text>
              <Text style={styles.fieldValue}>
                {datosTimbre?.idCCP || cartaPorteData.cartaPorteId || 'Pendiente'}
              </Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Folio:</Text>
              <Text style={styles.fieldValue}>
                {cartaPorteData.folio || 'Sin folio'}
              </Text>
            </View>
          </View>
        </View>

        {/* Ubicaciones */}
        {cartaPorteData.ubicaciones && cartaPorteData.ubicaciones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicaciones de Carga y Descarga</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableCellTipo]}>Tipo</Text>
                <Text style={[styles.tableCell, styles.tableCellNombre]}>Nombre/RFC</Text>
                <Text style={[styles.tableCell, styles.tableCellDireccion]}>Dirección Completa</Text>
                <Text style={[styles.tableCell, styles.tableCellDistancia]}>Distancia</Text>
              </View>
              {cartaPorteData.ubicaciones.map((ubicacion: any, index: number) => {
                // Construir dirección completa y bien formateada
                const direccionCompleta = ubicacion.domicilio ? [
                  ubicacion.domicilio.calle,
                  ubicacion.domicilio.numero_exterior && `#${ubicacion.domicilio.numero_exterior}`,
                  ubicacion.domicilio.colonia && `Col. ${ubicacion.domicilio.colonia}`,
                  ubicacion.domicilio.municipio,
                  ubicacion.domicilio.estado,
                  ubicacion.domicilio.codigo_postal && `CP ${ubicacion.domicilio.codigo_postal}`
                ].filter(Boolean).join(', ') : 'Dirección no especificada';

                return (
                  <View style={styles.tableRow} key={index}>
                    <Text style={[styles.tableCell, styles.tableCellTipo]}>
                      {ubicacion.tipo_ubicacion || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellNombre]}>
                      {ubicacion.nombre_remitente_destinatario || 'Sin nombre'}
                      {ubicacion.rfc_remitente_destinatario && (
                        <Text>{'\n'}RFC: {ubicacion.rfc_remitente_destinatario}</Text>
                      )}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellDireccion]}>
                      {direccionCompleta}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellDistancia]}>
                      {ubicacion.distancia_recorrida ? `${ubicacion.distancia_recorrida} km` : 'N/A'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Mercancías */}
        {cartaPorteData.mercancias && cartaPorteData.mercancias.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mercancías Transportadas</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableCellClave]}>Clave SAT</Text>
                <Text style={[styles.tableCell, styles.tableCellDescripcion]}>Descripción</Text>
                <Text style={[styles.tableCell, styles.tableCellCantidad]}>Cantidad</Text>
                <Text style={[styles.tableCell, styles.tableCellPeso]}>Peso Unit.</Text>
                <Text style={[styles.tableCell, styles.tableCellPesoTotal]}>Peso Total</Text>
              </View>
              {cartaPorteData.mercancias.map((mercancia: any, index: number) => {
                const cantidad = Number(mercancia.cantidad) || 0;
                const pesoUnitario = Number(mercancia.peso_kg) || 0;
                const pesoTotal = cantidad * pesoUnitario;
                
                return (
                  <View style={styles.tableRow} key={index}>
                    <Text style={[styles.tableCell, styles.tableCellClave]}>
                      {mercancia.bienes_transp || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellDescripcion]}>
                      {mercancia.descripcion || 'Sin descripción'}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellCantidad]}>
                      {cantidad.toLocaleString()} {mercancia.clave_unidad || ''}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellPeso]}>
                      {pesoUnitario.toLocaleString()} kg
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellPesoTotal]}>
                      {pesoTotal.toLocaleString()} kg
                    </Text>
                  </View>
                );
              })}
            </View>
            
            {/* Resumen de mercancías mejorado */}
            <View style={styles.resumenBox}>
              <Text style={styles.resumenText}>
                RESUMEN TOTAL: {cartaPorteData.mercancias.length} mercancía(s) - 
                Peso Total: {pesoTotalCalculado.toLocaleString()} kg
              </Text>
              <Text style={[styles.resumenText, { fontSize: 6, marginTop: 2 }]}>
                Cálculo: Suma de (Cantidad × Peso Unitario) de cada mercancía
              </Text>
            </View>
          </View>
        )}

        {/* Autotransporte */}
        {cartaPorteData.autotransporte && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Autotransporte</Text>
            <View style={styles.twoColumnLayout}>
              <View style={styles.column50}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Placa:</Text>
                  <Text style={styles.fieldValue}>
                    {cartaPorteData.autotransporte.placa_vm || 'N/A'}
                  </Text>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Configuración:</Text>
                  <Text style={styles.fieldValue}>
                    {cartaPorteData.autotransporte.config_vehicular || 'N/A'}
                  </Text>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Año Modelo:</Text>
                  <Text style={styles.fieldValue}>
                    {cartaPorteData.autotransporte.anio_modelo_vm || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.column50}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Aseguradora:</Text>
                  <Text style={styles.fieldValue}>
                    {cartaPorteData.autotransporte.asegura_resp_civil || 'N/A'}
                  </Text>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Póliza:</Text>
                  <Text style={styles.fieldValue}>
                    {cartaPorteData.autotransporte.poliza_resp_civil || 'N/A'}
                  </Text>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Capacidad de Carga:</Text>
                  <Text style={styles.fieldValue}>
                    {cartaPorteData.autotransporte.capacidad_carga || cartaPorteData.autotransporte.peso_bruto_vehicular || 'N/A'} kg
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Figuras de Transporte */}
        {cartaPorteData.figuras && cartaPorteData.figuras.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Figuras de Transporte</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableCellTipo]}>Tipo</Text>
                <Text style={[styles.tableCell, styles.tableCellDescripcion]}>Nombre</Text>
                <Text style={[styles.tableCell, styles.tableCellNombre]}>RFC</Text>
                <Text style={[styles.tableCell, styles.tableCellDistancia]}>Licencia</Text>
              </View>
              {cartaPorteData.figuras.map((figura: any, index: number) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={[styles.tableCell, styles.tableCellTipo]}>
                    {figura.tipo_figura || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellDescripcion]}>
                    {figura.nombre_figura || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellNombre]}>
                    {figura.rfc_figura || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellDistancia]}>
                    {figura.num_licencia || 'N/A'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer con sellos fiscales */}
        <View style={styles.footer}>
          <View style={styles.qrCode}>
            {qrCodeDataURL && <Image style={{ width: '100%', height: '100%' }} src={qrCodeDataURL} />}
          </View>
          <View style={styles.fiscalSeals}>
            {datosTimbre?.selloDigital && (
              <Text style={styles.sealText}>
                <Text style={{ fontWeight: 'bold' }}>Sello Digital CFDI: </Text>
                {datosTimbre.selloDigital.substring(0, 100)}...
              </Text>
            )}
            {datosTimbre?.selloSAT && (
              <Text style={styles.sealText}>
                <Text style={{ fontWeight: 'bold' }}>Sello Digital SAT: </Text>
                {datosTimbre.selloSAT.substring(0, 100)}...
              </Text>
            )}
            {datosTimbre?.cadenaOriginal && (
              <Text style={styles.sealText}>
                <Text style={{ fontWeight: 'bold' }}>Cadena Original: </Text>
                {datosTimbre.cadenaOriginal.substring(0, 100)}...
              </Text>
            )}
          </View>
        </View>

        {/* Número de página */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Página ${pageNumber} de ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

export default ResponsiveCartaPortePDF;
