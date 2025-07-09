
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, GraduationCap, Settings, Clock } from 'lucide-react';

type FlowMode = 'express' | 'assisted' | 'auto';
type UserExpertiseLevel = 'beginner' | 'intermediate' | 'expert';

interface FlowConfig {
  mode: FlowMode;
  autoSkipValidated: boolean;
  showAdvancedOptions: boolean;
  enableSmartDefaults: boolean;
  showHints: boolean;
}

interface AdaptiveFlowContextType {
  flowMode: FlowMode;
  userLevel: UserExpertiseLevel;
  flowConfig: FlowConfig;
  setFlowMode: (mode: FlowMode) => void;
  setUserLevel: (level: UserExpertiseLevel) => void;
  updateFlowConfig: (updates: Partial<FlowConfig>) => void;
  shouldShowField: (fieldId: string, importance: 'critical' | 'important' | 'optional') => boolean;
  shouldAutoSkip: (stepId: string) => boolean;
  getEstimatedTime: () => number;
}

const AdaptiveFlowContext = createContext<AdaptiveFlowContextType | undefined>(undefined);

export function AdaptiveFlowProvider({ children }: { children: React.ReactNode }) {
  const [flowMode, setFlowMode] = useState<FlowMode>('auto');
  const [userLevel, setUserLevel] = useState<UserExpertiseLevel>('intermediate');
  const [flowConfig, setFlowConfig] = useState<FlowConfig>({
    mode: 'auto',
    autoSkipValidated: false,
    showAdvancedOptions: false,
    enableSmartDefaults: true,
    showHints: true
  });

  const updateFlowConfig = useCallback((updates: Partial<FlowConfig>) => {
    setFlowConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const shouldShowField = useCallback((fieldId: string, importance: 'critical' | 'important' | 'optional') => {
    if (flowMode === 'express') {
      return importance === 'critical';
    }
    if (flowMode === 'assisted') {
      return true;
    }
    // Auto mode
    if (userLevel === 'beginner') return true;
    if (userLevel === 'expert') return importance !== 'optional';
    return importance !== 'optional';
  }, [flowMode, userLevel]);

  const shouldAutoSkip = useCallback((stepId: string) => {
    return flowMode === 'express' && flowConfig.autoSkipValidated;
  }, [flowMode, flowConfig.autoSkipValidated]);

  const getEstimatedTime = useCallback(() => {
    const baseTimes = {
      express: 3,
      assisted: 8,
      auto: 5
    };
    return baseTimes[flowMode];
  }, [flowMode]);

  const value: AdaptiveFlowContextType = {
    flowMode,
    userLevel,
    flowConfig,
    setFlowMode,
    setUserLevel,
    updateFlowConfig,
    shouldShowField,
    shouldAutoSkip,
    getEstimatedTime
  };

  return (
    <AdaptiveFlowContext.Provider value={value}>
      {children}
    </AdaptiveFlowContext.Provider>
  );
}

export function useAdaptiveFlow() {
  const context = useContext(AdaptiveFlowContext);
  if (context === undefined) {
    throw new Error('useAdaptiveFlow must be used within an AdaptiveFlowProvider');
  }
  return context;
}

interface FlowModeSelectorProps {
  onModeChange?: (mode: FlowMode) => void;
}

export function FlowModeSelector({ onModeChange }: FlowModeSelectorProps) {
  const { flowMode, setFlowMode, getEstimatedTime } = useAdaptiveFlow();

  const handleModeChange = (mode: FlowMode) => {
    setFlowMode(mode);
    onModeChange?.(mode);
  };

  const modes = [
    {
      id: 'express' as FlowMode,
      title: 'Modo Express',
      description: 'Solo campos esenciales, máxima velocidad',
      icon: Zap,
      time: 3,
      color: 'bg-red-50 border-red-200 text-red-800',
      badge: 'Rápido'
    },
    {
      id: 'assisted' as FlowMode,
      title: 'Modo Asistido',
      description: 'Guía completa con hints y validaciones',
      icon: GraduationCap,
      time: 8,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      badge: 'Completo'
    },
    {
      id: 'auto' as FlowMode,
      title: 'Modo Inteligente',
      description: 'Se adapta automáticamente a tu experiencia',
      icon: Settings,
      time: 5,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      badge: 'Adaptativo'
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">Selecciona tu Modo de Trabajo</h3>
          <p className="text-sm text-gray-600">
            Tiempo estimado actual: <Clock className="h-4 w-4 inline mx-1" />
            <strong>{getEstimatedTime()} minutos</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = flowMode === mode.id;
            
            return (
              <div
                key={mode.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? `${mode.color} border-2 scale-105` 
                    : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                } rounded-lg p-4`}
                onClick={() => handleModeChange(mode.id)}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-1 ${isSelected ? '' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{mode.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {mode.badge}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-80">{mode.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                      <Clock className="h-3 w-3" />
                      <span>~{mode.time} min</span>
                    </div>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Toggle to next mode
              const currentIndex = modes.findIndex(m => m.id === flowMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              handleModeChange(nextMode.id);
            }}
          >
            Cambiar Modo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface AdaptiveFieldProps {
  fieldId: string;
  importance: 'critical' | 'important' | 'optional';
  children: React.ReactNode;
  fallbackValue?: any;
}

export function AdaptiveField({ 
  fieldId, 
  importance, 
  children, 
  fallbackValue 
}: AdaptiveFieldProps) {
  const { shouldShowField, flowConfig } = useAdaptiveFlow();

  if (!shouldShowField(fieldId, importance)) {
    // En modo express, algunos campos se ocultan pero pueden tener valores por defecto
    return null;
  }

  return (
    <div className="adaptive-field">
      {children}
    </div>
  );
}
