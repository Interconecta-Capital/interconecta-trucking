import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Route, CheckCircle, Edit2, Check, X, RefreshCw, Loader2, MapPin, Clock } from 'lucide-react';

interface DistanceMetricsPanelProps {
  distanciaTotal: number;
  tiempoEstimado: number;
  isCalculating: boolean;
  onRecalcular: () => void;
  onManualEdit: (distancia: number) => void;
}

export function DistanceMetricsPanel({
  distanciaTotal,
  tiempoEstimado,
  isCalculating,
  onRecalcular,
  onManualEdit
}: DistanceMetricsPanelProps) {
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(distanciaTotal.toString());

  const handleSave = () => {
    const newDistance = parseFloat(editValue);
    if (newDistance > 0) {
      onManualEdit(newDistance);
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    setEditValue(distanciaTotal.toString());
    setEditMode(false);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Métricas de Ruta
          </span>
          {distanciaTotal > 0 && !editMode && (
            <Badge className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Calculada
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid de 2 columnas para distancia y tiempo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distancia */}
          <div className="p-4 bg-background rounded-lg border-2 border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Distancia Total
              </span>
              {!editMode && distanciaTotal > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setEditMode(true);
                    setEditValue(distanciaTotal.toString());
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {!editMode ? (
              <div className="text-3xl font-bold text-foreground">
                {distanciaTotal > 0 ? `${distanciaTotal.toFixed(2)} km` : '-- km'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-2xl font-bold"
                  autoFocus
                />
                <Button onClick={handleSave} size="sm" className="bg-green-500 hover:bg-green-600">
                  <Check className="h-4 w-4" />
                </Button>
                <Button onClick={handleCancel} size="sm" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Tiempo */}
          <div className="p-4 bg-background rounded-lg border-2 border-border">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              Tiempo Estimado
            </span>
            <div className="text-3xl font-bold text-foreground">
              {tiempoEstimado > 0 ? formatTime(tiempoEstimado) : '-- h'}
            </div>
          </div>
        </div>
        
        {/* Botón de recalcular */}
        <Button 
          onClick={onRecalcular}
          disabled={isCalculating}
          className="w-full"
          size="lg"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculando con Google Maps...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalcular Ruta con Google Maps
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Cálculo y visualización con Google Maps API
        </p>
      </CardContent>
    </Card>
  );
}
