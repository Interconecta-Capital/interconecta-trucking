import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Save, FileText, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IdCCPDisplay } from '../IdCCPDisplay';

interface CartaPorteHeaderProps {
  borradorCargado: boolean;
  ultimoGuardado: Date | null;
  idCCP?: string;
  onGuardarBorrador: () => Promise<void>;
  onLimpiarBorrador: () => Promise<void>;
  onGuardarYSalir: () => Promise<void>;
  isGuardando: boolean;
}

export function CartaPorteHeader({
  borradorCargado,
  ultimoGuardado,
  idCCP,
  onGuardarBorrador,
  onLimpiarBorrador,
  onGuardarYSalir,
  isGuardando
}: CartaPorteHeaderProps) {
  const navigate = useNavigate();

  const handleVolverAListado = () => {
    navigate('/cartas-porte');
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Nueva Carta Porte
              </h1>
            </div>
            
            {borradorCargado && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Borrador cargado
              </Badge>
            )}
            
            {ultimoGuardado && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Guardado: {ultimoGuardado.toLocaleTimeString()}
              </div>
            )}
            
            {isGuardando && (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Guardando...
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleVolverAListado}
              className="flex items-center gap-2"
            >
              Volver al listado
            </Button>
            
            <Button
              variant="outline"
              onClick={onGuardarBorrador}
              disabled={isGuardando}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Borrador
            </Button>
            
            {borradorCargado && (
              <Button
                variant="outline"
                onClick={onLimpiarBorrador}
                disabled={isGuardando}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Limpiar
              </Button>
            )}
            
            <Button
              onClick={onGuardarYSalir}
              disabled={isGuardando}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isGuardando ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Guardar y Salir
            </Button>
          </div>
        </div>

        {/* Mostrar IdCCP */}
        <IdCCPDisplay idCCP={idCCP} />
      </CardContent>
    </Card>
  );
}
