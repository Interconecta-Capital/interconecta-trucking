import React, { useState, useEffect, useCallback } from 'react'
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { useDropzone } from 'react-dropzone'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

import { CartaPortePDF } from './CartaPortePDF'
import { CartaPorteData } from '@/types/cartaPorte'

interface ProfessionalPDFSectionProps {
  cartaPorteData: CartaPorteData
  datosTimbre?: {
    uuid?: string
    selloDigital?: string
    selloSAT?: string
    cadenaOriginal?: string
    fechaTimbrado?: string
    idCCP?: string
  } | null
  xmlTimbrado?: string | null
}

export function ProfessionalPDFSection({ cartaPorteData, datosTimbre }: ProfessionalPDFSectionProps) {
  const [logoBase64, setLogoBase64] = useState<string | null>(null)
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (datosTimbre?.idCCP && datosTimbre.fechaTimbrado) {
      const qrString = `https://verificacfdi.facturaelectronica.sat.gob.mx/verificaccp/default.aspx?IdCCP=${datosTimbre.idCCP}&FechaOrig=${'2025-06-20T20:53:00'}&FechaTimb=${datosTimbre.fechaTimbrado}`
      QRCode.toDataURL(qrString)
        .then(url => setQrCodeDataURL(url))
        .catch(err => console.error('Error al generar QR:', err))
    }
  }, [datosTimbre])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
    multiple: false,
  })

  const documentInstance = (
    <CartaPortePDF
      cartaPorteData={cartaPorteData}
      datosTimbre={datosTimbre}
      qrCodeDataURL={qrCodeDataURL}
      logoBase64={logoBase64}
    />
  )

  const isTimbreFiscalCompleto = datosTimbre?.uuid && datosTimbre?.idCCP

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="text-green-800">Representación Impresa Profesional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-green-100">
          <input {...getInputProps()} />
          <p>Arrastra tu logo aquí, o haz clic para seleccionarlo</p>
          {logoBase64 && <img src={logoBase64} alt="Vista previa del logo" className="h-16 mx-auto mt-4" />}
        </div>

        {!isTimbreFiscalCompleto && (
          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <strong>Nota:</strong> El PDF completo con QR y sellos requiere el timbrado.
          </Alert>
        )}

        {isClient && isTimbreFiscalCompleto && (
          <PDFDownloadLink
            document={documentInstance}
            fileName={`carta-porte-${cartaPorteData.folio || 'N_A'}.pdf`}
          >
            {({ loading }) => (
              <Button className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? 'Generando documento...' : 'Descargar PDF Profesional'}
              </Button>
            )}
          </PDFDownloadLink>
        )}

        {isClient && (
          <div style={{ height: '750px', border: '1px solid #ccc', marginTop: '1rem' }}>
            <PDFViewer width="100%" height="100%">
              {documentInstance}
            </PDFViewer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProfessionalPDFSection

