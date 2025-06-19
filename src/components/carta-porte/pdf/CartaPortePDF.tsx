import React from 'react';
import { Page, Document, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// --- REGISTRAR FUENTES (IMPORTANTE PARA SOPORTE DE CARACTERES) ---
// Descarga una fuente como 'Lato' desde Google Fonts y colócala en tu proyecto
// import LatoRegular from './fonts/Lato-Regular.ttf';
// import LatoBold from './fonts/Lato-Bold.ttf';

// Font.register({
//   family: 'Lato',
//   fonts: [
//     { src: LatoRegular },
//     { src: LatoBold, fontWeight: 'bold' },
//   ],
// });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#166534',
    paddingBottom: 10
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain'
  },
  issuerInfo: {
    textAlign: 'right',
    maxWidth: '50%'
  },
  issuerName: {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#166534'
  },
  mainInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  infoColumn: {
    width: '48%'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 3
  },
  fieldLabel: {
    fontWeight: 'bold'
  },
  fieldValue: {
    marginBottom: 4
  },
  section: {
    marginBottom: 20
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  tableRow: {
    flexDirection: 'row'
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold'
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 5
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1.5,
    borderTopColor: '#166534',
    paddingTop: 10
  },
  qrCode: {
    width: 90,
    height: 90
  },
  fiscalSeals: {
    width: '75%',
    textAlign: 'left'
  },
  sealText: {
    fontSize: 6.5,
    fontFamily: 'Courier',
    marginBottom: 4,
    wordBreak: 'break-all'
  },
  legend: {
    fontSize: 7,
    textAlign: 'center',
    width: '100%',
    marginTop: 5
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey'
  }
});

export const CartaPortePDF = ({ cartaPorteData, datosTimbre, qrCodeDataURL, logoBase64 }: any) => (
  <Document title={`Carta Porte - ${cartaPorteData.folio}`}> 
    <Page size="LETTER" style={styles.page}>
      <View style={styles.header}>
        {logoBase64 && <Image style={styles.logo} src={logoBase64} />}
        <View style={styles.issuerInfo}>
          <Text style={styles.issuerName}>{cartaPorteData.emisor.nombreRazonSocial}</Text>
          <Text>RFC: {cartaPorteData.emisor.rfc}</Text>
          <Text></Text>
        </View>
      </View>

      <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
        CARTA PORTE - CFDI DE TRASLADO
      </Text>

      <View style={styles.mainInfoGrid}>
        <View style={styles.infoColumn}>
          <Text style={styles.sectionTitle}>Receptor</Text>
          <Text><Text style={styles.fieldLabel}>Nombre:</Text> {cartaPorteData.receptor.nombreRazonSocial}</Text>
          <Text><Text style={styles.fieldLabel}>RFC:</Text> {cartaPorteData.receptor.rfc}</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.sectionTitle}>Comprobante Fiscal</Text>
          <Text><Text style={styles.fieldLabel}>Folio Fiscal (UUID):</Text> {datosTimbre?.uuid || 'N/A'}</Text>
          <Text><Text style={styles.fieldLabel}>IdCCP:</Text> {datosTimbre?.idCCP || 'N/A'}</Text>
          <Text><Text style={styles.fieldLabel}>Fecha Emisión:</Text> {new Date().toLocaleDateString('es-MX')}</Text>
          <Text><Text style={styles.fieldLabel}>Fecha Timbrado:</Text> {datosTimbre?.fechaTimbrado || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mercancías Transportadas</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>Clave SAT</Text></View>
            <View style={[styles.tableCol, { width: '45%' }]}><Text>Descripción</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text>Cantidad</Text></View>
            <View style={[styles.tableCol, { width: '25%' }]}><Text>Peso (Kg)</Text></View>
          </View>
          {cartaPorteData.mercancias.map((item: any, index: number) => (
            <View style={styles.tableRow} key={index}>
              <View style={[styles.tableCol, { width: '15%' }]}><Text>{item.claveProdServSAT}</Text></View>
              <View style={[styles.tableCol, { width: '45%' }]}><Text>{item.descripcion}</Text></View>
              <View style={[styles.tableCol, { width: '15%' }]}><Text>{item.cantidad}</Text></View>
              <View style={[styles.tableCol, { width: '25%' }]}><Text>{item.pesoEnKg}</Text></View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.qrCode}>
          {qrCodeDataURL && <Image style={{ width: '100%', height: '100%' }} src={qrCodeDataURL} />}
        </View>
        <View style={styles.fiscalSeals}>
          <Text style={styles.sealText}><Text style={{ fontWeight: 'bold' }}>Sello Digital CFDI:</Text> {datosTimbre?.selloDigital || 'N/A'}</Text>
          <Text style={styles.sealText}><Text style={{ fontWeight: 'bold' }}>Sello Digital SAT:</Text> {datosTimbre?.selloSAT || 'N/A'}</Text>
          <Text style={styles.sealText}><Text style={{ fontWeight: 'bold' }}>Cadena Original:</Text> {datosTimbre?.cadenaOriginal || 'N/A'}</Text>
        </View>
      </View>

      <Text style={styles.legend}>Este documento es una representación impresa de un CFDI</Text>

      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

export default CartaPortePDF;

