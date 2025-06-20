
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Route, Package, MapPin, Users, Truck } from 'lucide-react';
import { ViajeWizardMision } from './wizard/ViajeWizardMision';
import { ViajeWizardRuta } from './wizard/ViajeWizardRuta';
import { ViajeWizardActivos } from './wizard/ViajeWizardActivos';
import { ViajeWizardResumen } from './wizard/ViajeWizardResumen';
import { toast } from 'sonner';

export interface ViajeWizardData {
  // Paso A: Misión
  cliente?: any;
  tipoServicio?: 'flete_pagado' | 'traslado_propio';
  descripcionMercancia?: string;
  // Paso B: Ruta
  origen?: any;
  destino?: any;
  distanciaRecorrida?: number;
  // Paso C: Activos
  vehiculo?: any;
  conductor?: any;
  // Estado general
  currentStep: number;
  isValid: boolean;
}

const STEPS = [
  {
    id: 1,
    title: 'Definir la Misión',
    subtitle: 'Cliente, mercancía y tipo de servicio',
    icon: Package
  },
  {
    id: 2,
    title: 'Establecer la Ruta',
    subtitle: 'Origen, destino y trazado',
    icon: MapPin
  },
  {
    id: 3,
    title: 'Asignar Activos',
    subtitle: 'Vehículo y conductor',
    icon: Truck
  },
  {
    id: 4,
    title: 'Confirmar y Despachar',
    subtitle: 'Resumen y emisión de documentos',
    icon: CheckCircle
  }
];

export function ViajeWizard() {
  const navigate = useNavigate();
  const [data, setData] = useState<ViajeWizardData>({
    currentStep: 1,
    isValid: false
  });

  const updateData = (updates: Partial<ViajeWizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const canAdvance = () => {
    switch (data.currentStep) {
      case 1:
        return data.cliente && data.tipoServicio && data.descripcionMercancia;
      case 2:
        return data.origen && data.destino;
      case 3:
        return data.vehiculo && data.conductor;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canAdvance() && data.currentStep < 4) {
      updateData({ currentStep: data.currentStep + 1 });
    }
  };

  const handlePrevious = () => {
    if (data.currentStep > 1) {
      updateData({ currentStep: data.currentStep - 1 });
    }
  };

  const handleCancel = () => {
    navigate('/viajes');
  };

  const handleConfirmarViaje = async () => {
    try {
      // Aquí se implementará la lógica para crear el viaje y la carta porte
      console.log('Creando viaje con datos:', data);
      toast.success('Viaje programado exitosamente');
      navigate('/viajes');
    } catch (error) {
      toast.error('Error al programar el viaje');
      console.error('Error:', error);
    }
  };

  const renderStepContent = () => {
    switch (data.currentStep) {
      case 1:
        return <ViajeWizardMision data={data} updateData={updateData} />;
      case 2:
        return <ViajeWizardRuta data={data} updateData={updateData} />;
      case 3:
        return <ViajeWizardActivos data={data} updateData={updateData} />;
      case 4:
        return <ViajeWizardResumen data={data} onConfirm={handleConfirmarViaje} />;
      default:
        return null;
    }
  };

  const currentStepInfo = STEPS.find(step => step.id === data.currentStep);
  const progress = (data.currentStep / STEPS.length) * 100;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header del Wizard */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Route className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Programar Nuevo Viaje</h1>
          </div>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Paso {data.currentStep} de {STEPS.length}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {STEPS.map((step) => {
          const isActive = step.id === data.currentStep;
          const isCompleted = step.id < data.currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border-2 transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-50'
                  : isCompleted
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              <p className={`text-xs ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                {step.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {currentStepInfo && <currentStepInfo.icon className="h-5 w-5" />}
            {currentStepInfo?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={data.currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {data.currentStep < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!canAdvance()}
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleConfirmarViaje}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar y Emitir Documentos
          </Button>
        )}
      </div>
    </div>
  );
}
