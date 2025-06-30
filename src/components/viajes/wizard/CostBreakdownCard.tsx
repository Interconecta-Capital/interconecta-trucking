
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Fuel, 
  User, 
  Car, 
  Wrench, 
  Building,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { CostBreakdown } from '@/hooks/useIntelligentCostCalculator';

interface CostBreakdownCardProps {
  breakdown: CostBreakdown;
  basicCost: number;
}

export function CostBreakdownCard({ breakdown, basicCost }: CostBreakdownCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const costItems = [
    {
      key: 'combustible',
      icon: Fuel,
      label: 'Combustible',
      color: 'text-red-600 bg-red-50',
      data: breakdown.combustible
    },
    {
      key: 'conductor',
      icon: User,
      label: 'Conductor',
      color: 'text-blue-600 bg-blue-50',
      data: breakdown.conductor
    },
    {
      key: 'peajes',
      icon: Car,
      label: 'Peajes',
      color: 'text-orange-600 bg-orange-50',
      data: breakdown.peajes
    },
    {
      key: 'mantenimiento',
      icon: Wrench,
      label: 'Mantenimiento',
      color: 'text-purple-600 bg-purple-50',
      data: breakdown.mantenimiento
    },
    {
      key: 'operativo',
      icon: Building,
      label: 'Operativo',
      color: 'text-gray-600 bg-gray-50',
      data: breakdown.operativo
    }
  ];

  const confidenceConfig = {
    high: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Alta Precisión' },
    medium: { color: 'bg-yellow-100 text-yellow-800', icon: Info, label: 'Precisión Media' },
    low: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Estimación Básica' }
  };

  const config = confidenceConfig[breakdown.confidence];
  const savings = basicCost - breakdown.total;
  const savingsPercentage = basicCost > 0 ? ((savings / basicCost) * 100) : 0;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-900">
            <DollarSign className="h-5 w-5" />
            Análisis Inteligente de Costos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={config.color}>
              <config.icon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumen principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-700">
              ${breakdown.total.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Costo Inteligente</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">
              ${basicCost.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Cálculo Básico</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {savings >= 0 ? '-' : '+'}${Math.abs(savings).toLocaleString()}
            </div>
            <div className={`text-sm ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {savings >= 0 ? 'Ahorro' : 'Costo adicional'} ({Math.abs(savingsPercentage).toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* Desglose por categorías */}
        <div className="space-y-2">
          {costItems.map((item) => {
            const Icon = item.icon;
            const percentage = (item.data.amount / breakdown.total) * 100;
            
            return (
              <div key={item.key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-600">{item.data.details}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${item.data.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advertencias */}
        {breakdown.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800 font-medium mb-2">
              <AlertTriangle className="h-4 w-4" />
              Consideraciones
            </div>
            <ul className="space-y-1">
              {breakdown.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-700 flex items-start gap-1">
                  <span className="text-yellow-500 mt-1">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botón para mostrar detalles */}
        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Ocultar Cálculos Detallados
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Ver Cálculos Detallados
            </>
          )}
        </Button>

        {/* Detalles de cálculos */}
        {showDetails && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-3">Metodología de Cálculo</h4>
            {costItems.map((item) => (
              <div key={item.key} className="p-3 bg-white rounded border">
                <div className="font-medium text-gray-900 mb-1">{item.label}</div>
                <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                  {item.data.calculation}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
