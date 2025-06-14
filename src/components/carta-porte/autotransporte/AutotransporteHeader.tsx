
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, CheckCircle } from 'lucide-react';

interface AutotransporteHeaderProps {
  completionPercentage: number;
  isComplete: boolean;
}

export function AutotransporteHeader({ completionPercentage, isComplete }: AutotransporteHeaderProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Configuración de Autotransporte</h3>
              <p className="text-sm text-blue-700">
                Configure los datos del vehículo, permisos y seguros requeridos por el SAT
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-blue-300"></div>
              )}
              <span className="font-medium text-blue-900">
                {completionPercentage}% Completo
              </span>
            </div>
            <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
