
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  FileText, 
  MapPin, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ConfiguracionFiscalData {
  emisor: {
    rfc: string;
    razonSocial: string;
    regimenFiscal: string;
    domicilioFiscal: {
      calle: string;
      numeroExterior: string;
      numeroInterior?: string;
      colonia: string;
      municipio: string;
      estado: string;
      pais: string;
      codigoPostal: string;
    };
  };
  configuracionDocumentos: {
    serie: string;
    folioInicial: number;
    certificadoDigital: {
      archivo: string;
      vigencia: string;
      estado: 'vigente' | 'por_vencer' | 'vencido';
    };
  };
  preferenciasTimbrado: {
    proveedor: 'pac_1' | 'pac_2' | 'interno';
    modoTest: boolean;
    notificaciones: boolean;
  };
}

export const ConfiguracionFiscal = () => {
  const { user } = useAuth();
  const [configuracion, setConfiguracion] = useState<ConfiguracionFiscalData>({
    emisor: {
      rfc: '',
      razonSocial: '',
      regimenFiscal: '',
      domicilioFiscal: {
        calle: '',
        numeroExterior: '',
        numeroInterior: '',
        colonia: '',
        municipio: '',
        estado: '',
        pais: 'México',
        codigoPostal: ''
      }
    },
    configuracionDocumentos: {
      serie: 'CP',
      folioInicial: 1,
      certificadoDigital: {
        archivo: '',
        vigencia: '',
        estado: 'vencido'
      }
    },
    preferenciasTimbrado: {
      proveedor: 'pac_1',
      modoTest: true,
      notificaciones: true
    }
  });

  const [validationStatus, setValidationStatus] = useState({
    rfc: false,
    certificado: false,
    domicilio: false
  });

  const regimenesFiscales = [
    { value: '601', label: '601 - General de Ley Personas Morales' },
    { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
    { value: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios' },
    { value: '606', label: '606 - Arrendamiento' },
    { value: '608', label: '608 - Demás ingresos' },
    { value: '610', label: '610 - Residentes en el Extranjero sin Establecimiento Permanente en México' },
    { value: '611', label: '611 - Ingresos por Dividendos (socios y accionistas)' },
    { value: '612', label: '612 - Personas Físicas con Actividades Empresariales y Profesionales' },
    { value: '614', label: '614 - Ingresos por intereses' },
    { value: '615', label: '615 - Régimen de los ingresos por obtención de premios' },
    { value: '616', label: '616 - Sin obligaciones fiscales' },
    { value: '621', label: '621 - Incorporación Fiscal' },
    { value: '622', label: '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
    { value: '623', label: '623 - Optativo para Grupos de Sociedades' },
    { value: '624', label: '624 - Coordinados' },
    { value: '628', label: '628 - Hidrocarburos' },
    { value: '629', label: '629 - De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales' },
    { value: '630', label: '630 - Enajenación de acciones en bolsa de valores' }
  ];

  const handleGuardarConfiguracion = async () => {
    try {
      // Validar datos requeridos
      if (!configuracion.emisor.rfc || !configuracion.emisor.razonSocial) {
        toast.error('RFC y Razón Social son obligatorios');
        return;
      }

      // Aquí iría la lógica para guardar en Supabase
      toast.success('Configuración fiscal guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      toast.error('Error al guardar la configuración');
    }
  };

  const handleValidarRFC = async () => {
    if (configuracion.emisor.rfc.length >= 12) {
      // Simulación de validación
      setValidationStatus(prev => ({ ...prev, rfc: true }));
      toast.success('RFC validado correctamente');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuración Fiscal</h2>
          <p className="text-muted-foreground">
            Configure los datos fiscales para el timbrado de cartas porte
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={validationStatus.rfc ? "default" : "secondary"}>
            {validationStatus.rfc ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
            RFC
          </Badge>
          <Badge variant={validationStatus.certificado ? "default" : "secondary"}>
            {validationStatus.certificado ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
            Certificado
          </Badge>
          <Badge variant={validationStatus.domicilio ? "default" : "secondary"}>
            {validationStatus.domicilio ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
            Domicilio
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="emisor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emisor" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Datos del Emisor
          </TabsTrigger>
          <TabsTrigger value="documentos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="timbrado" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Timbrado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emisor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Fiscal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="rfc"
                      value={configuracion.emisor.rfc}
                      onChange={(e) => setConfiguracion(prev => ({
                        ...prev,
                        emisor: { ...prev.emisor, rfc: e.target.value.toUpperCase() }
                      }))}
                      placeholder="ABC123456XYZ"
                      className="uppercase"
                    />
                    <Button onClick={handleValidarRFC} variant="outline">
                      Validar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social *</Label>
                  <Input
                    id="razonSocial"
                    value={configuracion.emisor.razonSocial}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      emisor: { ...prev.emisor, razonSocial: e.target.value }
                    }))}
                    placeholder="EMPRESA TRANSPORTES SA DE CV"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regimenFiscal">Régimen Fiscal *</Label>
                <Select
                  value={configuracion.emisor.regimenFiscal}
                  onValueChange={(value) => setConfiguracion(prev => ({
                    ...prev,
                    emisor: { ...prev.emisor, regimenFiscal: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione régimen fiscal" />
                  </SelectTrigger>
                  <SelectContent>
                    {regimenesFiscales.map((regimen) => (
                      <SelectItem key={regimen.value} value={regimen.value}>
                        {regimen.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Domicilio Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calle">Calle *</Label>
                  <Input
                    id="calle"
                    value={configuracion.emisor.domicilioFiscal.calle}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      emisor: {
                        ...prev.emisor,
                        domicilioFiscal: { ...prev.emisor.domicilioFiscal, calle: e.target.value }
                      }
                    }))}
                    placeholder="Av. Principal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroExterior">Número Exterior *</Label>
                  <Input
                    id="numeroExterior"
                    value={configuracion.emisor.domicilioFiscal.numeroExterior}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      emisor: {
                        ...prev.emisor,
                        domicilioFiscal: { ...prev.emisor.domicilioFiscal, numeroExterior: e.target.value }
                      }
                    }))}
                    placeholder="123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroInterior">Número Interior</Label>
                  <Input
                    id="numeroInterior"
                    value={configuracion.emisor.domicilioFiscal.numeroInterior}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      emisor: {
                        ...prev.emisor,
                        domicilioFiscal: { ...prev.emisor.domicilioFiscal, numeroInterior: e.target.value }
                      }
                    }))}
                    placeholder="A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="colonia">Colonia *</Label>
                  <Input
                    id="colonia"
                    value={configuracion.emisor.domicilioFiscal.colonia}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      emisor: {
                        ...prev.emisor,
                        domicilioFiscal: { ...prev.emisor.domicilioFiscal, colonia: e.target.value }
                      }
                    }))}
                    placeholder="Centro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoPostal">Código Postal *</Label>
                  <Input
                    id="codigoPostal"
                    value={configuracion.emisor.domicilioFiscal.codigoPostal}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      emisor: {
                        ...prev.emisor,
                        domicilioFiscal: { ...prev.emisor.domicilioFiscal, codigoPostal: e.target.value }
                      }
                    }))}
                    placeholder="12345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="municipio">Municipio *</Label>
                  <Input
                    id="municipio"
                    value={configuracion.emisor.domicilioFiscal.municipio}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      emisor: {
                        ...prev.emisor,
                        domicilioFiscal: { ...prev.emisor.domicilioFiscal, municipio: e.target.value }
                      }
                    }))}
                    placeholder="Ciudad de México"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    value={configuracion.emisor.domicilioFiscal.estado}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      emisor: {
                        ...prev.emisor,
                        domicilioFiscal: { ...prev.emisor.domicilioFiscal, estado: e.target.value }
                      }
                    }))}
                    placeholder="Ciudad de México"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serie">Serie de Documentos</Label>
                  <Input
                    id="serie"
                    value={configuracion.configuracionDocumentos.serie}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      configuracionDocumentos: { ...prev.configuracionDocumentos, serie: e.target.value }
                    }))}
                    placeholder="CP"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folioInicial">Folio Inicial</Label>
                  <Input
                    id="folioInicial"
                    type="number"
                    value={configuracion.configuracionDocumentos.folioInicial}
                    onChange={(e) => setConfiguracion(prev => ({
                      ...prev,
                      configuracionDocumentos: { ...prev.configuracionDocumentos, folioInicial: parseInt(e.target.value) || 1 }
                    }))}
                    placeholder="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Certificado Digital</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium">Subir Certificado Digital (.cer y .key)</p>
                <p className="text-sm text-muted-foreground">
                  Seleccione los archivos de certificado digital (.cer) y llave privada (.key)
                </p>
                <Button className="mt-4">
                  Seleccionar Archivos
                </Button>
              </div>

              {configuracion.configuracionDocumentos.certificadoDigital.archivo && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Certificado cargado</p>
                    <p className="text-sm text-muted-foreground">
                      Vigencia: {configuracion.configuracionDocumentos.certificadoDigital.vigencia}
                    </p>
                  </div>
                  <Badge variant={
                    configuracion.configuracionDocumentos.certificadoDigital.estado === 'vigente' ? 'default' :
                    configuracion.configuracionDocumentos.certificadoDigital.estado === 'por_vencer' ? 'destructive' : 'secondary'
                  }>
                    {configuracion.configuracionDocumentos.certificadoDigital.estado.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timbrado" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Timbrado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor de Timbrado</Label>
                <Select
                  value={configuracion.preferenciasTimbrado.proveedor}
                  onValueChange={(value: 'pac_1' | 'pac_2' | 'interno') => setConfiguracion(prev => ({
                    ...prev,
                    preferenciasTimbrado: { ...prev.preferenciasTimbrado, proveedor: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pac_1">PAC Principal</SelectItem>
                    <SelectItem value="pac_2">PAC Respaldo</SelectItem>
                    <SelectItem value="interno">Timbrado Interno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="modoTest"
                  checked={configuracion.preferenciasTimbrado.modoTest}
                  onChange={(e) => setConfiguracion(prev => ({
                    ...prev,
                    preferenciasTimbrado: { ...prev.preferenciasTimbrado, modoTest: e.target.checked }
                  }))}
                />
                <Label htmlFor="modoTest">Modo de pruebas</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="notificaciones"
                  checked={configuracion.preferenciasTimbrado.notificaciones}
                  onChange={(e) => setConfiguracion(prev => ({
                    ...prev,
                    preferenciasTimbrado: { ...prev.preferenciasTimbrado, notificaciones: e.target.checked }
                  }))}
                />
                <Label htmlFor="notificaciones">Recibir notificaciones por email</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleGuardarConfiguracion} size="lg">
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
};
