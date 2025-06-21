
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Building2, 
  ExternalLink,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';
import { useNavigate } from 'react-router-dom';

export function PersonalizacionPanel() {
  const navigate = useNavigate();
  const { 
    configuracion, 
    validarConfiguracionCompleta, 
    tieneCertificadoValido 
  } = useConfiguracionEmpresarial();

  const configuracionCompleta = validarConfiguracionCompleta();
  const certificadoValido = tieneCertificadoValido();

  return (
    <div className="space-y-6">
      {/* Configuración Empresarial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Configuración Empresarial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Mi Empresa</h4>
              <p className="text-sm text-gray-600">
                Gestione los datos fiscales, certificados digitales y configuración operativa de su empresa
              </p>
            </div>
            <div className="flex items-center gap-2">
              {configuracionCompleta && certificadoValido ? (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="outline" className="border-yellow-600 text-yellow-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Pendiente
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={() => navigate('/configuracion/empresa')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurar
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {(!configuracionCompleta || !certificadoValido) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Configuración Incompleta</span>
                </div>
                <ul className="text-xs text-yellow-700 space-y-1 ml-6">
                  {!configuracionCompleta && (
                    <li>• Complete los datos fiscales de su empresa</li>
                  )}
                  {!certificadoValido && (
                    <li>• Configure al menos un certificado de sello digital válido</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <Separator />

          {configuracionCompleta && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Razón Social:</span>
                <div className="text-gray-600">{configuracion?.razon_social}</div>
              </div>
              <div>
                <span className="font-medium">RFC:</span>
                <div className="text-gray-600">{configuracion?.rfc_emisor}</div>
              </div>
              <div>
                <span className="font-medium">Régimen Fiscal:</span>
                <div className="text-gray-600">{configuracion?.regimen_fiscal}</div>
              </div>
              <div>
                <span className="font-medium">Serie Carta Porte:</span>
                <div className="text-gray-600">{configuracion?.serie_carta_porte}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personalización de Interfaz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalización de Interfaz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Palette className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Las opciones de personalización de interfaz están en desarrollo</p>
            <p className="text-sm">Próximamente podrá personalizar temas, colores y logotipos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
