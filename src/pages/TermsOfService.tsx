import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TermsOfService() {
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
            <FileText className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              Términos de Servicio
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lee cuidadosamente estos términos antes de usar Interconecta Trucking
          </p>
        </div>

        {/* Secciones de Términos */}
        <div className="space-y-8">
          {/* Aceptación de Términos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                1. Aceptación de Términos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Al crear una cuenta y usar Interconecta Trucking, aceptas estar legalmente vinculado por estos Términos y Condiciones, 
                así como por nuestro Aviso de Privacidad.
              </p>
              <p>
                Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro servicio.
              </p>
            </CardContent>
          </Card>

          {/* Descripción del Servicio */}
          <Card>
            <CardHeader>
              <CardTitle>2. Descripción del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Interconecta Trucking es una plataforma SaaS que permite:
              </p>
              <ul className="space-y-2 ml-6">
                <li>• Generar y timbrar Cartas Porte 3.1 conforme al SAT</li>
                <li>• Gestionar flotas de vehículos y conductores</li>
                <li>• Administrar viajes y operaciones logísticas</li>
                <li>• Generar reportes y análisis de negocio</li>
                <li>• Integración con terceros (PACs, mapas, etc.)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Requisitos de Uso */}
          <Card>
            <CardHeader>
              <CardTitle>3. Requisitos para Usar el Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>Para usar Interconecta Trucking debes:</p>
              <ul className="space-y-2 ml-6">
                <li>• Ser mayor de 18 años</li>
                <li>• Representar a una empresa legalmente constituida en México</li>
                <li>• Proporcionar información veraz y actualizada</li>
                <li>• Contar con un RFC válido</li>
                <li>• Aceptar nuestro Aviso de Privacidad</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cuentas de Usuario */}
          <Card>
            <CardHeader>
              <CardTitle>4. Cuentas de Usuario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Responsabilidad de la Cuenta:</strong></p>
              <ul className="space-y-2 ml-6">
                <li>• Eres responsable de mantener la confidencialidad de tus credenciales</li>
                <li>• Debes notificarnos inmediatamente si sospechas acceso no autorizado</li>
                <li>• Eres responsable de todas las actividades bajo tu cuenta</li>
                <li>• No puedes compartir tu cuenta con terceros</li>
              </ul>
              <p className="mt-4"><strong>Suspensión o Terminación:</strong></p>
              <p>
                Nos reservamos el derecho de suspender o terminar tu cuenta si:
              </p>
              <ul className="space-y-2 ml-6">
                <li>• Violas estos Términos de Servicio</li>
                <li>• Usas el servicio para actividades ilegales</li>
                <li>• Proporcionas información falsa</li>
                <li>• No pagas tu suscripción</li>
              </ul>
            </CardContent>
          </Card>

          {/* Uso Aceptable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                5. Política de Uso Aceptable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>NO ESTÁ PERMITIDO:</strong></p>
              <ul className="space-y-2 ml-6">
                <li>• Generar Cartas Porte fraudulentas o con información falsa</li>
                <li>• Realizar ingeniería inversa del software</li>
                <li>• Intentar acceder a cuentas de otros usuarios</li>
                <li>• Realizar ataques de seguridad o DDoS</li>
                <li>• Usar bots o scripts automatizados sin autorización</li>
                <li>• Revender o sublicenciar el servicio</li>
                <li>• Extraer datos mediante scraping o técnicas similares</li>
              </ul>
            </CardContent>
          </Card>

          {/* Facturación y Pagos */}
          <Card>
            <CardHeader>
              <CardTitle>6. Facturación, Pagos y Periodo de Prueba</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Periodo de Prueba:</strong></p>
              <ul className="space-y-2 ml-6">
                <li>• Ofrecemos 14 días de prueba gratuita</li>
                <li>• No se requiere tarjeta de crédito</li>
                <li>• Acceso completo a todas las funciones</li>
                <li>• Al terminar, tu cuenta entra en periodo de gracia de 90 días</li>
              </ul>
              <p className="mt-4"><strong>Suscripciones de Pago:</strong></p>
              <ul className="space-y-2 ml-6">
                <li>• Los pagos son mensuales o anuales</li>
                <li>• Se facturan por adelantado</li>
                <li>• Las renovaciones son automáticas</li>
                <li>• Puedes cancelar en cualquier momento</li>
                <li>• No hay reembolsos por cancelaciones anticipadas</li>
              </ul>
              <p className="mt-4"><strong>Timbres:</strong></p>
              <ul className="space-y-2 ml-6">
                <li>• Los timbres se compran en paquetes</li>
                <li>• No tienen fecha de expiración</li>
                <li>• Son transferibles entre usuarios de la misma empresa</li>
              </ul>
            </CardContent>
          </Card>

          {/* Propiedad Intelectual */}
          <Card>
            <CardHeader>
              <CardTitle>7. Propiedad Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Propiedad de Interconecta:</strong></p>
              <ul className="space-y-2 ml-6">
                <li>• El software, código, diseño y marca son propiedad de Interconecta</li>
                <li>• Te otorgamos una licencia limitada, no exclusiva, no transferible</li>
                <li>• Esta licencia termina al cancelar tu suscripción</li>
              </ul>
              <p className="mt-4"><strong>Propiedad del Usuario:</strong></p>
              <ul className="space-y-2 ml-6">
                <li>• Conservas todos los derechos sobre tus datos</li>
                <li>• Puedes exportar tus datos en cualquier momento</li>
                <li>• Al cancelar, tus datos se eliminan tras periodo de gracia</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitación de Responsabilidad */}
          <Card>
            <CardHeader>
              <CardTitle>8. Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>EL SERVICIO SE PROPORCIONA "TAL CUAL":</strong></p>
              <ul className="space-y-2 ml-6">
                <li>• No garantizamos operación sin interrupciones</li>
                <li>• No somos responsables por pérdida de datos por causas fuera de nuestro control</li>
                <li>• No somos responsables de multas del SAT por datos incorrectos que tú proporciones</li>
                <li>• Nuestra responsabilidad máxima es el monto pagado en los últimos 12 meses</li>
              </ul>
              <p className="mt-4"><strong>TU RESPONSABILIDAD:</strong></p>
              <ul className="space-y-2 ml-6">
                <li>• Verificar que la información de las Cartas Porte sea correcta</li>
                <li>• Cumplir con las regulaciones del SAT</li>
                <li>• Mantener backups de información crítica</li>
              </ul>
            </CardContent>
          </Card>

          {/* Modificaciones */}
          <Card>
            <CardHeader>
              <CardTitle>9. Modificaciones a los Términos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Te notificaremos por correo electrónico con al menos 30 días de anticipación.
              </p>
              <p>
                El uso continuo del servicio tras la notificación constituye aceptación de los nuevos términos.
              </p>
            </CardContent>
          </Card>

          {/* Ley Aplicable */}
          <Card>
            <CardHeader>
              <CardTitle>10. Ley Aplicable y Jurisdicción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos.
              </p>
              <p>
                Cualquier disputa se resolverá en los tribunales de la Ciudad de México, renunciando 
                expresamente a cualquier otra jurisdicción que pudiera corresponder.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>11. Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>Para preguntas sobre estos términos:</p>
              <p><strong>Email:</strong> legal@interconecta.com</p>
              <p><strong>Teléfono:</strong> +52 (55) 1234-5678</p>
              <p><strong>Dirección:</strong> [Dirección completa de la empresa]</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Última actualización: 11 de enero de 2025</p>
          <p className="mt-2">Versión 1.0</p>
          <div className="mt-4 space-x-4">
            <Link to="/privacy" className="text-primary hover:underline">
              Aviso de Privacidad
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
