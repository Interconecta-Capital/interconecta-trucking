import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Building, 
  Shield, 
  FileText, 
  Zap,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { DatosFiscalesForm } from './DatosFiscalesForm';
import { CertificadoUploadDialog } from './CertificadoUploadDialog';
import { ConfiguracionOperativaForm } from './ConfiguracionOperativaForm';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';
import { useCertificadosDigitales } from '@/hooks/useCertificadosDigitales';

interface WizardConfiguracionInicialProps {
  open: boolean;
  onComplete: () => void;
}

export function WizardConfiguracionInicial({ open, onComplete }: WizardConfiguracionInicialProps) {
  const [step, setStep] = useState(0);
  const [showCertUpload, setShowCertUpload] = useState(false);
  const { configuracion } = useConfiguracionEmpresarial();
  const { certificadoActivo } = useCertificadosDigitales();

  const steps = [
    {
      id: 0,
      title: 'Bienvenida',
      icon: Zap,
      description: 'Configuración inicial del sistema'
    },
    {
      id: 1,
      title: 'Datos Fiscales',
      icon: Building,
      description: 'Configure su RFC y domicilio fiscal'
    },
    {
      id: 2,
      title: 'Certificado CSD',
      icon: Shield,
      description: 'Suba su certificado de sello digital'
    },
    {
      id: 3,
      title: 'Seguros y Timbrado',
      icon: FileText,
      description: 'Configure seguros y proveedor de timbrado'
    },
    {
      id: 4,
      title: 'Completado',
      icon: CheckCircle2,
      description: '¡Listo para operar!'
    }
  ];

  const currentStep = steps[step];
  const progress = (step / (steps.length - 1)) * 100;

  const canAdvance = () => {
    switch (step) {
      case 1:
        return configuracion?.rfc_emisor && configuracion?.razon_social && configuracion?.regimen_fiscal;
      case 2:
        return !!certificadoActivo;
      case 3:
        return configuracion?.proveedor_timbrado;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const StepIcon = currentStep.icon;

  return (
    <>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <StepIcon className="h-6 w-6" />
              {currentStep.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </DialogHeader>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Paso {step + 1} de {steps.length}</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex justify-between mb-4">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isCompleted = index < step;
              const isCurrent = index === step;

              return (
                <div key={s.id} className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs text-center ${isCurrent ? 'font-semibold' : ''}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className="py-4">
            {step === 0 && (
              <div className="space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">¡Bienvenido a su Sistema de Gestión!</h3>
                  <p className="text-muted-foreground">
                    Configure su empresa en solo 4 pasos para comenzar a generar documentos fiscales y gestionar sus viajes.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 border rounded-lg">
                    <Building className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Datos Fiscales</h4>
                    <p className="text-sm text-muted-foreground">Configure RFC, régimen fiscal y domicilio</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Certificado CSD</h4>
                    <p className="text-sm text-muted-foreground">Suba su certificado de sello digital</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Seguros y PAC</h4>
                    <p className="text-sm text-muted-foreground">Configure seguros y timbrado</p>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Ingrese los datos fiscales de su empresa. Esta información se utilizará en todos los documentos fiscales.
                </p>
                <DatosFiscalesForm />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Suba su Certificado de Sello Digital (CSD) para poder timbrar sus documentos fiscales.
                </p>
                {!certificadoActivo ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">No hay certificado configurado</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Necesita un certificado CSD válido para continuar
                    </p>
                    <Button onClick={() => setShowCertUpload(true)}>
                      Subir Certificado
                    </Button>
                  </div>
                ) : (
                  <div className="border border-green-500 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Certificado configurado correctamente</h4>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><strong>RFC:</strong> {certificadoActivo.rfc_titular}</p>
                      <p><strong>Vigencia:</strong> {new Date(certificadoActivo.fecha_fin_vigencia).toLocaleDateString('es-MX')}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure sus pólizas de seguros y seleccione su proveedor de timbrado (PAC).
                </p>
                <ConfiguracionOperativaForm />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">¡Configuración Completada!</h3>
                  <p className="text-muted-foreground">
                    Su sistema está listo para operar. Ya puede crear viajes y generar documentos fiscales.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <CheckCircle2 className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-semibold mb-1">Datos Fiscales</h4>
                    <p className="text-sm text-muted-foreground">✓ Configurado</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <CheckCircle2 className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-semibold mb-1">Certificado CSD</h4>
                    <p className="text-sm text-muted-foreground">✓ Activo</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <CheckCircle2 className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-semibold mb-1">Timbrado</h4>
                    <p className="text-sm text-muted-foreground">✓ Configurado</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            {step < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canAdvance()}
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Finalizar
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Certificate upload dialog */}
      <CertificadoUploadDialog
        open={showCertUpload}
        onOpenChange={setShowCertUpload}
      />
    </>
  );
}
