import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DistanciaEditableInputProps {
  distanciaCalculada: number;
  distanciaGuardada?: number;
  onSave: (distancia: number) => void;
}

export function DistanciaEditableInput({
  distanciaCalculada,
  distanciaGuardada,
  onSave
}: DistanciaEditableInputProps) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState<string>(
    distanciaGuardada?.toString() || distanciaCalculada?.toString() || '0'
  );
  
  const distanciaFinal = distanciaGuardada || distanciaCalculada || 0;
  const tieneDistanciaGuardada = distanciaGuardada && distanciaGuardada > 0;
  
  const handleSave = () => {
    const distancia = parseFloat(valor);
    if (!isNaN(distancia) && distancia > 0) {
      onSave(distancia);
      setEditando(false);
    }
  };
  
  const handleCancel = () => {
    setValor(distanciaFinal.toString());
    setEditando(false);
  };
  
  if (!editando) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={tieneDistanciaGuardada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
          {tieneDistanciaGuardada ? '✅' : '⚠️'} {distanciaFinal.toFixed(2)} km
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditando(true)}
          className="h-6 w-6 p-0"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        step="0.01"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="w-24 h-8"
        autoFocus
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        className="h-6 w-6 p-0 text-green-600"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        className="h-6 w-6 p-0 text-red-600"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
