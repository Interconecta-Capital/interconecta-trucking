import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Calculator, TrendingUp, AlertCircle } from "lucide-react";

interface CotizacionCostsProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function CotizacionCosts({ formData, updateFormData }: CotizacionCostsProps) {
  const [costos, setCostos] = useState({
    combustible: 0,
    casetas: 0,
    salario_conductor: 0,
    mantenimiento: 0,
    seguros: 0,
    otros: 0
  });

  useEffect(() => {
    // Cargar costos existentes si los hay
    if (formData.costos_internos && Object.keys(formData.costos_internos).length > 0) {
      setCostos(formData.costos_internos);
    }
  }, [formData.costos_internos]);

  const calcularCostoTotal = () => {
    const total = Object.values(costos).reduce((sum, valor) => sum + (valor || 0), 0);
    return total;
  };

  const calcularPrecioCotizado = () => {
    const costoTotal = calcularCostoTotal();
    const margen = formData.margen_ganancia || 0;
    const precio = costoTotal * (1 + margen / 100);
    return precio;
  };

  const actualizarCosto = (campo: string, valor: number) => {
    const nuevosCostos = { ...costos, [campo]: valor };
    setCostos(nuevosCostos);
    
    const costoTotal = Object.values(nuevosCostos).reduce((sum, val) => sum + (val || 0), 0);
    const precio = costoTotal * (1 + (formData.margen_ganancia || 0) / 100);
    
    updateFormData({
      costos_internos: nuevosCostos,
      costo_total_interno: costoTotal,
      precio_cotizado: precio
    });
  };

  const actualizarMargen = (nuevoMargen: number) => {
    updateFormData({ margen_ganancia: nuevoMargen });
    
    const costoTotal = calcularCostoTotal();
    const precio = costoTotal * (1 + nuevoMargen / 100);
    
    updateFormData({
      costo_total_interno: costoTotal,
      precio_cotizado: precio
    });
  };

  const calcularAutomatico = () => {
    // Cálculos automáticos basados en la distancia
    const distancia = formData.distancia_total || 0;
    const tiempo = formData.tiempo_estimado || 0;
    
    const costosCalculados = {
      combustible: distancia * 8.5, // $8.50 por km aproximadamente
      casetas: distancia * 2.3, // $2.30 por km en casetas
      salario_conductor: (tiempo / 60) * 250, // $250 por hora
      mantenimiento: distancia * 1.2, // $1.20 por km en mantenimiento
      seguros: distancia * 0.8, // $0.80 por km en seguros
      otros: distancia * 1.0 // $1.00 por km otros gastos
    };
    
    setCostos(costosCalculados);
    
    const costoTotal = Object.values(costosCalculados).reduce((sum, val) => sum + val, 0);
    const precio = costoTotal * (1 + (formData.margen_ganancia || 15) / 100);
    
    updateFormData({
      costos_internos: costosCalculados,
      costo_total_interno: costoTotal,
      precio_cotizado: precio
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Cálculo Automático */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cálculo de Costos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Cálculo Automático</p>
              <p className="text-sm text-muted-foreground">
                Calcula costos basados en la distancia ({formData.distancia_total || 0} km)
              </p>
            </div>
            <Button 
              onClick={calcularAutomatico}
              disabled={!formData.distancia_total}
              variant="outline"
            >
              Calcular Automático
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Costos Detallados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Desglose de Costos Internos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="combustible">Combustible</Label>
              <Input
                id="combustible"
                type="number"
                value={costos.combustible}
                onChange={(e) => actualizarCosto('combustible', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="casetas">Casetas y Peajes</Label>
              <Input
                id="casetas"
                type="number"
                value={costos.casetas}
                onChange={(e) => actualizarCosto('casetas', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="salario">Salario Conductor</Label>
              <Input
                id="salario"
                type="number"
                value={costos.salario_conductor}
                onChange={(e) => actualizarCosto('salario_conductor', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="mantenimiento">Mantenimiento</Label>
              <Input
                id="mantenimiento"
                type="number"
                value={costos.mantenimiento}
                onChange={(e) => actualizarCosto('mantenimiento', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="seguros">Seguros</Label>
              <Input
                id="seguros"
                type="number"
                value={costos.seguros}
                onChange={(e) => actualizarCosto('seguros', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="otros">Otros Gastos</Label>
              <Input
                id="otros"
                type="number"
                value={costos.otros}
                onChange={(e) => actualizarCosto('otros', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Margen y Precio Final */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Margen de Ganancia y Precio Final
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="margen">Margen de Ganancia (%)</Label>
              <Input
                id="margen"
                type="number"
                value={formData.margen_ganancia}
                onChange={(e) => actualizarMargen(parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label>Precio Cotizado Final</Label>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(calcularPrecioCotizado())}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Resumen de Costos */}
          <div className="space-y-3">
            <Label>Resumen Financiero</Label>
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold">{formatCurrency(calcularCostoTotal())}</div>
                <div className="text-sm text-muted-foreground">Costo Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(calcularPrecioCotizado() - calcularCostoTotal())}
                </div>
                <div className="text-sm text-muted-foreground">Ganancia Esperada</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">
                  {formatCurrency(calcularPrecioCotizado())}
                </div>
                <div className="text-sm text-muted-foreground">Precio Final</div>
              </div>
            </div>
          </div>

          {/* Validación de Margen */}
          {formData.margen_ganancia < 10 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Margen de ganancia bajo (menos del 10%). Considera aumentar el precio.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notas Internas */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Internas</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notas">Notas para el Equipo (No visible para el cliente)</Label>
            <Textarea
              id="notas"
              value={formData.notas_internas}
              onChange={(e) => updateFormData({ notas_internas: e.target.value })}
              placeholder="Notas sobre costos, consideraciones especiales, riesgos, etc."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}