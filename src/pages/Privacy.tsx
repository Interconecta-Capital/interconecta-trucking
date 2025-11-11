import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, FileText, Download, Trash2, Info } from 'lucide-react';
import { GDPRRights } from '@/components/privacy/GDPRRights';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-screen-xl">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0312ae2e-aab8-4f79-8a82-78bf9d173564.png" 
              alt="Interconecta Trucking Logo"
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-xl font-bold text-foreground">
              Interconecta Trucking
            </span>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-screen-lg">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Shield className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              Protegemos tu privacidad
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Aviso de Privacidad
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tu información es importante para nosotros. Conoce cómo protegemos y manejamos tus datos personales.
          </p>
        </div>

        {/* Gestión de Derechos GDPR */}
        <div className="mb-12">
          <GDPRRights />
        </div>

        {/* Secciones de Privacidad */}
        <div className="space-y-8">
          {/* Información que Recopilamos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Información que Recopilamos
              </CardTitle>
              <CardDescription>
                Datos personales necesarios para operar el servicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">1. Datos de Identificación</h4>
                <p className="text-muted-foreground">
                  Nombre completo, RFC, CURP (conductores), correo electrónico, teléfono, dirección física de tu empresa.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">2. Datos de la Flota</h4>
                <p className="text-muted-foreground">
                  Información de vehículos (placas, número de serie, pólizas de seguro), datos de conductores (licencias, certificaciones).
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">3. Datos de Operación</h4>
                <p className="text-muted-foreground">
                  Cartas porte, información de viajes, ubicaciones de origen y destino, mercancías transportadas.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">4. Datos de Uso</h4>
                <p className="text-muted-foreground">
                  Logs de acceso, dirección IP, información del navegador, interacciones con la plataforma.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cómo Usamos tu Información */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Cómo Usamos tu Información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Generar y timbrar Cartas Porte conforme a regulaciones del SAT</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Gestionar tu flota de vehículos y conductores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Proporcionar soporte técnico y atención al cliente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Mejorar nuestros servicios mediante análisis de uso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Cumplir con obligaciones legales y fiscales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Prevenir fraude y garantizar la seguridad de la plataforma</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Tus Derechos ARCO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Tus Derechos ARCO (LFPDPPP)
              </CardTitle>
              <CardDescription>
                Derechos de Acceso, Rectificación, Cancelación y Oposición
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  Acceso y Portabilidad (GDPR Art. 15, 20)
                </h4>
                <p className="text-muted-foreground">
                  Puedes solicitar una copia de todos tus datos personales en formato JSON. 
                  Usa el botón "Exportar Mis Datos" arriba para descargar tu información.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Rectificación (GDPR Art. 16)
                </h4>
                <p className="text-muted-foreground">
                  Puedes actualizar tu información en cualquier momento desde tu perfil o contactando a soporte.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  Cancelación/Eliminación (GDPR Art. 17)
                </h4>
                <p className="text-muted-foreground">
                  Puedes solicitar la eliminación de tu cuenta y datos personales. 
                  Nota: Conservaremos Cartas Porte emitidas por 10 años según requisito del SAT.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Oposición (GDPR Art. 21)
                </h4>
                <p className="text-muted-foreground">
                  Puedes oponerte al procesamiento de tus datos para fines de marketing o análisis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Retención de Datos */}
          <Card>
            <CardHeader>
              <CardTitle>Retención de Datos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Conservamos tus datos según los siguientes criterios:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Cartas Porte:</strong> 10 años (requisito SAT)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Logs de auditoría:</strong> 7 años (ISO 27001)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Datos operacionales:</strong> Mientras tu cuenta esté activa + 2 años</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Logs de sesión:</strong> 90 días</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de la Información</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Implementamos medidas de seguridad técnicas y organizativas conforme a:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>ISO 27001:</strong> Sistema de gestión de seguridad de la información</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Cifrado:</strong> TLS 1.3 para transmisión, AES-256 en reposo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Autenticación:</strong> Multi-factor disponible (MFA)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Auditoría:</strong> Todos los accesos son registrados</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contacto DPO */}
          <Card>
            <CardHeader>
              <CardTitle>Contacto - Oficial de Protección de Datos (DPO)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Para ejercer tus derechos ARCO o consultas sobre privacidad, contacta a:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacidad@interconecta.com</p>
                <p><strong>Teléfono:</strong> +52 (55) 1234-5678</p>
                <p><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (Hora del Centro de México)</p>
              </div>
            </CardContent>
          </Card>

          {/* Marco Legal */}
          <Card>
            <CardHeader>
              <CardTitle>Marco Legal y Normativo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Este aviso de privacidad cumple con:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>GDPR (UE):</strong> Reglamento General de Protección de Datos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>LFPDPPP (México):</strong> Ley Federal de Protección de Datos Personales en Posesión de los Particulares</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>ISO 27701:</strong> Gestión de Información de Privacidad</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Última actualización: 11 de enero de 2025</p>
          <p className="mt-2">Versión 1.0</p>
          <div className="mt-4 space-x-4">
            <Link to="/terms" className="text-primary hover:underline">
              Términos y Condiciones
            </Link>
            <Link to="/" className="text-primary hover:underline">
              Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
