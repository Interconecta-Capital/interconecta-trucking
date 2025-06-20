
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Package, AlertTriangle, CheckCircle, Zap, Globe } from 'lucide-react';
import { CatalogoSelectorInteligente } from './CatalogoSelectorInteligente';
import { useCatalogosSATInteligente } from '@/hooks/useCatalogosSATInteligente';

interface SmartMercanciaInputMejoradoProps {
  value: string;
  onChange: (value: string) => void;
  onMercanciaSelect?: (data: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  field?: string;
  showValidation?: boolean;
  showClaveProducto?: boolean;
}

interface AnalisisMercancia {
  peso?: {
    cantidad: number;
    unidad: string;
    pesoKg: number;
  };
  categoria?: string;
  riesgo?: {
    nivel: 'bajo' | 'medio' | 'alto';
    tipos: string[];
    alertas: string[];
  };
  comercioExterior?: {
    detectado: boolean;
    tipo: 'exportacion' | 'importacion' | null;
    fraccionSugerida?: string;
  };
  clavesDetectadas?: {
    producto?: string;
    unidad?: string;
  };
}

export function SmartMercanciaInputMejorado({
  value,
  onChange,
  onMercanciaSelect,
  placeholder = "Describe la mercancía que vas a transportar...",
  disabled = false,
  className,
  field = 'descripcion_mercancia',
  showValidation = true,
  showClaveProducto = true
}: SmartMercanciaInputMejoradoProps) {
  const [analisisMercancia, setAnalisisMercancia] = useState<AnalisisMercancia | null>(null);
  const [claveProductoSeleccionada, setClaveProductoSeleccionada] = useState('');
  const [unidadSeleccionada, setUnidadSeleccionada] = useState('');
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Hook para obtener sugerencias de productos basadas en descripción
  const {
    obtenerSugerenciasPorDescripcion,
    validarCodigoSAT
  } = useCatalogosSATInteligente({
    tipo: 'productos',
    enableIA: true
  });

  // Analizar texto de mercancía con IA
  const analizarMercancia = async (descripcion: string) => {
    if (!descripcion || descripcion.length < 10) {
      setAnalisisMercancia(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log('🔍 Analizando mercancía:', descripcion);
      
      const texto = descripcion.toLowerCase();
      const analisis: AnalisisMercancia = {};

      // 1. Análisis de peso
      const pesoMatch = texto.match(/(\d+(?:\.\d+)?)\s*(ton|toneladas|kg|kilogramos|t)\b/i);
      if (pesoMatch) {
        const cantidad = parseFloat(pesoMatch[1]);
        const unidad = pesoMatch[2].toLowerCase();
        analisis.peso = {
          cantidad,
          unidad,
          pesoKg: unidad.includes('ton') || unidad === 't' ? cantidad * 1000 : cantidad
        };
      }

      // 2. Análisis de categoría y riesgo
      const categoriasRiesgo = {
        'químicos': ['químico', 'ácido', 'tóxico', 'corrosivo', 'inflamable'],
        'explosivos': ['explosivo', 'pirotécnico', 'dinamita', 'pólvora'],
        'líquidos_peligrosos': ['gasolina', 'diesel', 'combustible', 'alcohol'],
        'materiales_radioactivos': ['radioactivo', 'uranio', 'plutonio'],
        'especies_protegidas': ['jaguar', 'águila', 'tortuga', 'madera preciosa', 'coral']
      };

      const riesgos: string[] = [];
      const alertas: string[] = [];
      
      for (const [categoria, palabras] of Object.entries(categoriasRiesgo)) {
        if (palabras.some(palabra => texto.includes(palabra))) {
          riesgos.push(categoria);
          
          if (categoria === 'químicos') {
            alertas.push('Material peligroso detectado - Requiere clasificación UN');
          } else if (categoria === 'especies_protegidas') {
            alertas.push('Especie protegida - Requiere permisos SEMARNAT/CITES');
          } else if (categoria === 'explosivos') {
            alertas.push('Material explosivo - Requiere permisos especiales SEDENA');
          }
        }
      }

      if (riesgos.length > 0) {
        analisis.riesgo = {
          nivel: riesgos.length > 2 ? 'alto' : riesgos.length > 1 ? 'medio' : 'bajo',
          tipos: riesgos,
          alertas
        };
      }

      // 3. Análisis de comercio exterior
      const comercioExteriorPatterns = [
        'exportación', 'export', 'importación', 'import', 
        'aduanas', 'frontera', 'internacional'
      ];
      
      if (comercioExteriorPatterns.some(pattern => texto.includes(pattern))) {
        analisis.comercioExterior = {
          detectado: true,
          tipo: texto.includes('export') || texto.includes('exportación') ? 'exportacion' : 'importacion'
        };

        // Sugerir fracciones arancelarias comunes
        if (texto.includes('aguacate')) {
          analisis.comercioExterior.fraccionSugerida = '08044000';
        } else if (texto.includes('tequila')) {
          analisis.comercioExterior.fraccionSugerida = '22085000';
        }
      }

      // 4. Detección de claves SAT sugeridas
      const claves: any = {};
      
      // Productos comunes
      if (texto.includes('aguacate')) {
        claves.producto = '01012902';
      } else if (texto.includes('cemento')) {
        claves.producto = '23011001';
      } else if (texto.includes('flete') || texto.includes('transporte')) {
        claves.producto = '78101800';
      }

      // Unidades sugeridas
      if (analisis.peso) {
        claves.unidad = analisis.peso.unidad.includes('ton') ? 'TNE' : 'KGM';
      } else if (texto.includes('pieza') || texto.includes('unidad')) {
        claves.unidad = 'H87';
      } else if (texto.includes('litro') || texto.includes('líquido')) {
        claves.unidad = 'LTR';
      }

      if (Object.keys(claves).length > 0) {
        analisis.clavesDetectadas = claves;
      }

      // 5. Categorización general
      const categorias = {
        'alimentos': ['fruta', 'verdura', 'carne', 'lácteo', 'aguacate', 'mango'],
        'construcción': ['cemento', 'varilla', 'ladrillo', 'arena', 'grava'],
        'automotriz': ['auto', 'refacción', 'llanta', 'motor'],
        'textil': ['ropa', 'tela', 'algodón', 'hilo'],
        'electrónico': ['computadora', 'celular', 'televisión', 'componente']
      };

      for (const [cat, palabras] of Object.entries(categorias)) {
        if (palabras.some(palabra => texto.includes(palabra))) {
          analisis.categoria = cat;
          break;
        }
      }

      setAnalisisMercancia(analisis);
      
      // Obtener sugerencias de productos SAT
      if (descripcion.length > 15) {
        const sugerenciasProducto = await obtenerSugerenciasPorDescripcion(descripcion);
        if (sugerenciasProducto.length > 0) {
          setShowSugerencias(true);
        }
      }

      console.log('✅ Análisis completado:', analisis);
      
    } catch (error) {
      console.error('❌ Error analizando mercancía:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analizar cuando cambie el valor
  useEffect(() => {
    const timer = setTimeout(() => {
      analizarMercancia(value);
    }, 800);

    return () => clearTimeout(timer);
  }, [value]);

  // Aplicar sugerencias automáticamente
  const aplicarSugerencias = () => {
    if (analisisMercancia?.clavesDetectadas) {
      if (analisisMercancia.clavesDetectadas.producto) {
        setClaveProductoSeleccionada(analisisMercancia.clavesDetectadas.producto);
      }
      if (analisisMercancia.clavesDetectadas.unidad) {
        setUnidadSeleccionada(analisisMercancia.clavesDetectadas.unidad);
      }
    }
  };

  const handleMercanciaChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleClaveProductoChange = (clave: string) => {
    setClaveProductoSeleccionada(clave);
    onMercanciaSelect?.({
      descripcion: value,
      claveProducto: clave,
      unidad: unidadSeleccionada,
      analisis: analisisMercancia
    });
  };

  const contextualData = {
    descripcionMercancia: value,
    categoria: analisisMercancia?.categoria,
    peso: analisisMercancia?.peso,
    comercioExterior: analisisMercancia?.comercioExterior?.detectado
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input principal de descripción */}
      <div>
        <Label htmlFor={field} className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Descripción de la Mercancía
          <Sparkles className="h-4 w-4 text-purple-500" />
          {isAnalyzing && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500" />}
        </Label>
        <Textarea
          id={field}
          value={value}
          onChange={(e) => handleMercanciaChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="mt-2 min-h-[100px]"
        />
      </div>

      {/* Análisis inteligente */}
      {analisisMercancia && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-blue-500" />
              Análisis Inteligente
              {analisisMercancia.clavesDetectadas && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={aplicarSugerencias}
                  className="ml-auto"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Aplicar Sugerencias
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Información detectada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analisisMercancia.peso && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Peso: {analisisMercancia.peso.cantidad} {analisisMercancia.peso.unidad}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    ({analisisMercancia.peso.pesoKg} kg)
                  </span>
                </div>
              )}

              {analisisMercancia.categoria && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Categoría: {analisisMercancia.categoria}
                  </Badge>
                </div>
              )}

              {analisisMercancia.comercioExterior?.detectado && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    <Globe className="h-3 w-3 mr-1" />
                    Comercio Exterior
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {analisisMercancia.comercioExterior.tipo}
                  </span>
                </div>
              )}
            </div>

            {/* Alertas de riesgo */}
            {analisisMercancia.riesgo && (
              <div className="space-y-2">
                {analisisMercancia.riesgo.alertas.map((alerta, index) => (
                  <Alert key={index} variant={analisisMercancia.riesgo?.nivel === 'alto' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{alerta}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selectores de catálogos SAT */}
      {showClaveProducto && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CatalogoSelectorInteligente
            tipo="productos"
            value={claveProductoSeleccionada}
            onChange={handleClaveProductoChange}
            label="Clave de Producto SAT"
            placeholder="Buscar producto..."
            enableIA={true}
            contextualData={contextualData}
            showValidation={true}
          />

          <CatalogoSelectorInteligente
            tipo="unidades"
            value={unidadSeleccionada}
            onChange={setUnidadSeleccionada}
            label="Unidad de Medida SAT"
            placeholder="Buscar unidad..."
            enableIA={true}
            contextualData={contextualData}
            showValidation={true}
          />
        </div>
      )}

      {/* Sugerencias adicionales */}
      {analisisMercancia?.comercioExterior?.fraccionSugerida && (
        <Alert className="bg-orange-50 border-orange-200">
          <Globe className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Comercio Exterior:</strong> Se sugiere la fracción arancelaria{' '}
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              {analisisMercancia.comercioExterior.fraccionSugerida}
            </Badge>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
