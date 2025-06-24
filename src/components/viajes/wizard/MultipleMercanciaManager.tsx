
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { SmartMercanciaInputMejorado } from '@/components/ai/SmartMercanciaInputMejorado';
import { Mercancia } from '@/types/mercancias';

interface MultipleMercanciaManagerProps {
  mercancias: Mercancia[];
  onMercanciasChange: (mercancias: Mercancia[]) => void;
}

export function MultipleMercanciaManager({ mercancias, onMercanciasChange }: MultipleMercanciaManagerProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]));

  const agregarMercancia = () => {
    const nuevaMercancia: Mercancia = {
      id: `mercancia-${Date.now()}`,
      descripcion: '',
      claveProdServ: '',
      claveUnidad: '',
      cantidad: 1,
      pesoKg: 0,
      valorMercancia: 0,
      unidad: 'KGM',
      aiGenerated: false
    };

    const nuevasMercancias = [...mercancias, nuevaMercancia];
    onMercanciasChange(nuevasMercancias);
    
    // Expandir el nuevo item automáticamente
    setExpandedItems(prev => new Set([...prev, mercancias.length]));
  };

  const eliminarMercancia = (index: number) => {
    if (mercancias.length <= 1) return; // Siempre mantener al menos una mercancía
    
    const nuevasMercancias = mercancias.filter((_, i) => i !== index);
    onMercanciasChange(nuevasMercancias);
    
    // Actualizar items expandidos
    setExpandedItems(prev => {
      const newSet = new Set<number>();
      prev.forEach(i => {
        if (i < index) newSet.add(i);
        else if (i > index) newSet.add(i - 1);
      });
      return newSet;
    });
  };

  const actualizarMercancia = (index: number, mercanciaActualizada: Partial<Mercancia>) => {
    const nuevasMercancias = mercancias.map((m, i) => 
      i === index ? { ...m, ...mercanciaActualizada } : m
    );
    onMercanciasChange(nuevasMercancias);
  };

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const generarResumenCarga = () => {
    if (mercancias.length === 0) return '';
    
    const totalPeso = mercancias.reduce((sum, m) => sum + (m.pesoKg || 0), 0);
    const descripcionesValidas = mercancias
      .filter(m => m.descripcion && m.descripcion.trim())
      .map(m => m.descripcion);

    if (descripcionesValidas.length === 1) {
      return `${totalPeso > 0 ? `${totalPeso} kg de ` : ''}${descripcionesValidas[0]}`;
    } else if (descripcionesValidas.length > 1) {
      return `Carga mixta (${totalPeso} kg): ${descripcionesValidas.join(', ')}`;
    }
    
    return 'Carga sin especificar';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Mercancías a Transportar</h3>
          <Badge variant="outline">{mercancias.length} producto{mercancias.length !== 1 ? 's' : ''}</Badge>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={agregarMercancia}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar Producto
        </Button>
      </div>

      {/* Resumen de la carga */}
      {mercancias.some(m => m.descripcion) && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Resumen de la carga:</p>
          <p className="text-sm text-blue-700">{generarResumenCarga()}</p>
        </div>
      )}

      {/* Lista de mercancías */}
      <div className="space-y-3">
        {mercancias.map((mercancia, index) => {
          const isExpanded = expandedItems.has(index);
          const hasContent = mercancia.descripcion || mercancia.claveProdServ;
          
          return (
            <Card key={mercancia.id || index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>Producto #{index + 1}</span>
                    {hasContent && (
                      <Badge variant="secondary" className="text-xs">
                        {mercancia.claveProdServ ? 'Con clave SAT' : 'Sin clave SAT'}
                      </Badge>
                    )}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(index)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {mercancias.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarMercancia(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Vista previa cuando está colapsado */}
                {!isExpanded && hasContent && (
                  <div className="text-sm text-gray-600">
                    {mercancia.descripcion ? 
                      `${mercancia.descripcion.substring(0, 60)}${mercancia.descripcion.length > 60 ? '...' : ''}` : 
                      'Sin descripción'
                    }
                  </div>
                )}
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <SmartMercanciaInputMejorado
                    mercancia={mercancia}
                    onMercanciaChange={(updates) => actualizarMercancia(index, updates)}
                    showAdvancedOptions={true}
                    autoFocus={index === mercancias.length - 1}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
