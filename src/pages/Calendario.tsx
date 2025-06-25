
import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar, CheckSquare } from 'lucide-react';
const OperationsCalendar = React.lazy(() => import('@/components/calendar/OperationsCalendar'));

export default function Calendario() {
  const [showViajes, setShowViajes] = useState(true);
  const [showMantenimientos, setShowMantenimientos] = useState(true);

  const handleViajesChange = (checked: boolean | 'indeterminate') => {
    setShowViajes(checked === true);
  };

  const handleMantenimientosChange = (checked: boolean | 'indeterminate') => {
    setShowMantenimientos(checked === true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight">Calendario de Operaciones</h1>
        </div>
        <p className="text-muted-foreground">
          Visualiza y gestiona todos tus viajes y mantenimientos programados
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Filtros de Vista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="viajes" 
                checked={showViajes} 
                onCheckedChange={handleViajesChange} 
              />
              <Label htmlFor="viajes">Mostrar Viajes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="mantenimientos" 
                checked={showMantenimientos} 
                onCheckedChange={handleMantenimientosChange} 
              />
              <Label htmlFor="mantenimientos">Mostrar Mantenimientos</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Suspense fallback={<div className="p-4">Cargando calendario...</div>}>
            <OperationsCalendar
              showViajes={showViajes}
              showMantenimientos={showMantenimientos}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
