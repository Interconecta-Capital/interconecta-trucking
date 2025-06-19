
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Trash2, LogOut, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface CartaPorteHeaderProps {
  borradorCargado: boolean;
  ultimoGuardado: Date | null;
  onGuardarBorrador: () => Promise<void>;
  onLimpiarBorrador: () => Promise<void>;
  onGuardarYSalir: () => Promise<void>;
  isGuardando: boolean;
}

export function CartaPorteHeader({
  borradorCargado,
  ultimoGuardado,
  onGuardarBorrador,
  onLimpiarBorrador,
  onGuardarYSalir,
  isGuardando
}: CartaPorteHeaderProps) {
  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Nunca guardado';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Guardado hace unos segundos';
    if (diffMins === 1) return 'Guardado hace 1 minuto';
    if (diffMins < 60) return `Guardado hace ${diffMins} minutos`;
    
    return `Guardado ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const getStatusBadge = () => {
    if (isGuardando) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="h-3 w-3 mr-1 animate-spin" />
          Guardando...
        </Badge>
      );
    }
    
    if (borradorCargado && ultimoGuardado) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Guardado
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
        <AlertCircle className="h-3 w-3 mr-1" />
        Sin guardar
      </Badge>
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Nueva Carta Porte v3.1
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                {getStatusBadge()}
                <span className="text-sm text-muted-foreground">
                  {formatLastSaved(ultimoGuardado)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onGuardarBorrador}
              disabled={isGuardando}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isGuardando ? 'Guardando...' : 'Guardar Borrador'}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onGuardarYSalir}
              disabled={isGuardando}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Guardar y Salir</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onLimpiarBorrador}
              disabled={isGuardando}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Limpiar</span>
            </Button>
          </div>
        </div>
        
        {/* ✅ SEPARATION: Clear distinction between draft saving and validation */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Guardado automático activado</p>
              <p className="text-blue-700">
                Tu progreso se guarda automáticamente cada 30 segundos. 
                Puedes guardar borradores incompletos - la validación completa solo es necesaria para el timbrado.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
