
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertasCumplimientoPanel } from '@/components/validation/AlertasCumplimientoPanel';
import { useValidation } from '@/contexts/ValidationProvider';
import { Shield, RefreshCw, CheckCircle, AlertTriangle, Sparkles, Zap } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { 
  MicroInteraction, 
  CelebrationAnimation, 
  ProgressiveLoading,
  SmartButton 
} from '@/components/ui/micro-interactions';
import { useAdaptiveFlow } from './AdaptiveFlowManager';

interface ViajeWizardValidacionesEnhancedProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ViajeWizardValidacionesEnhanced({ 
  data, 
  updateData, 
  onNext, 
  onPrev 
}: ViajeWizardValidacionesEnhancedProps) {
  const {
    validaciones,
    isValidating,
    isValid,
    validarCartaPorte,
    aplicarAutoFix,
    exportarChecklist
  } = useValidation();

  const { flowMode, shouldAutoSkip } = useAdaptiveFlow();
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [currentValidationStage, setCurrentValidationStage] = useState(0);
  const [previousValidCount, setPreviousValidCount] = useState(0);

  const validationStages = [
    'Analizando mercancías...',
    'Verificando restricciones de ruta...',
    'Validando capacidades...',
    'Revisando documentación...',
    'Aplicando reglas SAT 3.1...',
    'Finalizando validaciones...'
  ];

  // Auto-validación cuando cambian los datos
  useEffect(() => {
    if (data.cliente && data.descripcionMercancia && data.origen && data.destino && data.vehiculo) {
      const cartaPorteData = {
        mercancias: [{
          descripcion: data.descripcionMercancia,
          material_peligroso: false,
          peso_kg: 1000
        }],
        ubicaciones: [
          { ...data.origen, tipo_ubicacion: 'Origen' },
          { ...data.destino, tipo_ubicacion: 'Destino' }
        ],
        autotransporte: {
          config_vehicular: data.vehiculo?.config_vehicular || 'C2',
          peso_bruto_vehicular: data.vehiculo?.peso_bruto_vehicular || 8500
        }
      };
      
      // Simular progreso de validación
      if (isValidating) {
        const interval = setInterval(() => {
          setValidationProgress(prev => {
            const newProgress = Math.min(prev + 15, 100);
            setCurrentValidationStage(Math.floor((newProgress / 100) * validationStages.length));
            return newProgress;
          });
        }, 300);

        return () => clearInterval(interval);
      } else {
        setValidationProgress(0);
        setCurrentValidationStage(0);
      }
      
      validarCartaPorte(cartaPorteData);
    }
  }, [data, validarCartaPorte, isValidating]);

  // Detectar mejoras en validaciones para mostrar celebración
  useEffect(() => {
    const currentValidCount = validaciones.filter(v => v.isValid).length;
    const currentBlockersCount = validaciones.filter(v => v.level === 'bloqueante').length;
    
    if (currentValidCount > previousValidCount || (previousValidCount > 0 && currentBlockersCount === 0)) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    setPreviousValidCount(currentValidCount);
  }, [validaciones, previousValidCount]);

  // Auto-skip en modo express si está todo válido
  useEffect(() => {
    if (shouldAutoSkip('validaciones') && isValid && !isValidating && flowMode === 'express') {
      setTimeout(() => {
        onNext();
      }, 1500); // Breve pausa para mostrar el éxito
    }
  }, [isValid, isValidating, shouldAutoSkip, flowMode, onNext]);

  const statsValidacion = {
    bloqueantes: validaciones.filter(v => v.level === 'bloqueante').length,
    advertencias: validaciones.filter(v => v.level === 'advertencia').length,
    autoCorregibles: validaciones.filter(v => v.autoFix).length,
    total: validaciones.length
  };

  const canProceed = isValid && !isValidating;

  return (
    <div className="space-y-6">
      {/* Animación de celebración */}
      <CelebrationAnimation 
        isVisible={showCelebration && isValid}
        type="validation"
        message="¡Validaciones completadas!"
      />

      {/* Header con animaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  rotate: isValidating ? 360 : 0,
                  scale: isValid ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  duration: isValidating ? 2 : 0.5,
                  repeat: isValidating ? Infinity : 0,
                  ease: "linear"
                }}
              >
                <Shield className={`h-5 w-5 ${isValid ? 'text-green-600' : 'text-blue-600'}`} />
              </motion.div>
              Validaciones Avanzadas SAT 3.1
              {flowMode === 'express' && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Zap className="h-3 w-3 mr-1" />
                  Modo Express
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {isValidating ? (
                <ProgressiveLoading
                  isLoading={isValidating}
                  progress={validationProgress}
                  stages={validationStages}
                  currentStage={currentValidationStage}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <MicroInteraction type="success" intensity={isValid ? 'medium' : 'subtle'}>
                      <div className="flex items-center gap-2">
                        {isValid ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="flex items-center gap-2 text-green-600"
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">¡Listo para proceder!</span>
                            <Sparkles className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="font-medium">
                              {statsValidacion.bloqueantes} problema(s) crítico(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </MicroInteraction>

                    <div className="flex gap-2">
                      {statsValidacion.advertencias > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {statsValidacion.advertencias} advertencias
                          </Badge>
                        </motion.div>
                      )}

                      {statsValidacion.autoCorregibles > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {statsValidacion.autoCorregibles} auto-corregibles
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <MicroInteraction type="tap">
                    <SmartButton
                      variant="secondary"
                      onClick={() => validarCartaPorte({
                        mercancias: [{
                          descripcion: data.descripcionMercancia,
                          material_peligroso: false,
                          peso_kg: 1000
                        }],
                        ubicaciones: [
                          { ...data.origen, tipo_ubicacion: 'Origen' },
                          { ...data.destino, tipo_ubicacion: 'Destino' }
                        ],
                        autotransporte: {
                          config_vehicular: data.vehiculo?.config_vehicular || 'C2',
                          peso_bruto_vehicular: data.vehiculo?.peso_bruto_vehicular || 8500
                        }
                      })}
                      isLoading={isValidating}
                      className="text-sm"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Re-validar
                    </SmartButton>
                  </MicroInteraction>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Panel de Alertas con animaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AlertasCumplimientoPanel
          validaciones={validaciones}
          onAutoFix={aplicarAutoFix}
          onExportChecklist={exportarChecklist}
          showStats={true}
        />
      </motion.div>

      {/* Resumen del Viaje con animaciones suaves */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">Resumen del Viaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <motion.div 
              className="grid grid-cols-2 gap-4 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div>
                <span className="font-medium">Cliente:</span> {data.cliente?.nombre_razon_social}
              </div>
              <div>
                <span className="font-medium">Servicio:</span> {data.tipoServicio}
              </div>
              <div>
                <span className="font-medium">Origen:</span> {data.origen?.nombre}
              </div>
              <div>
                <span className="font-medium">Destino:</span> {data.destino?.nombre}
              </div>
              <div>
                <span className="font-medium">Vehículo:</span> {data.vehiculo?.placa_vm}
              </div>
              <div>
                <span className="font-medium">Conductor:</span> {data.conductor?.nombre}
              </div>
            </motion.div>
            
            <motion.div 
              className="pt-2 border-t"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="font-medium">Mercancía:</span>
              <p className="text-sm text-gray-600 mt-1">{data.descripcionMercancia}</p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navegación con botones inteligentes */}
      <motion.div 
        className="flex justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <MicroInteraction type="tap">
          <SmartButton variant="secondary" onClick={onPrev}>
            Anterior
          </SmartButton>
        </MicroInteraction>
        
        <MicroInteraction type="tap" intensity={canProceed ? 'medium' : 'subtle'}>
          <SmartButton 
            variant={canProceed ? 'success' : 'secondary'}
            onClick={onNext} 
            disabled={!canProceed}
            className={canProceed ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {canProceed ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {flowMode === 'express' ? 'Siguiente →' : 'Proceder al Resumen'}
              </>
            ) : (
              'Corregir Problemas Primero'
            )}
          </SmartButton>
        </MicroInteraction>
      </motion.div>

      {/* Indicador de modo express con auto-skip */}
      {flowMode === 'express' && canProceed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-red-700 text-sm">
            <Zap className="h-3 w-3" />
            Modo Express: Avanzando automáticamente en 2 segundos...
          </div>
        </motion.div>
      )}
    </div>
  );
}
