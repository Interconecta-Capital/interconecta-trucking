import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRutasPrecisas } from '@/hooks/useRutasPrecisas';
import { useSmartMercanciaAnalysis } from '@/hooks/useSmartMercanciaAnalysis';
import { toast } from 'sonner';

interface DiagnosticPanelProps {
  onClose?: () => void;
}

export function DiagnosticPanel({ onClose }: DiagnosticPanelProps) {
  const [direccionTest, setDireccionTest] = useState('calle itzcoatl 5, 62577, colonia el porvenir, jiutepec morelos');
  const [mercanciaTest, setMercanciaTest] = useState('transportar 50 cajas de manzanas rojas de 20kg cada una');
  const [resultados, setResultados] = useState<any>(null);
  
  const { geocodificarDireccion, calcularRutaOptimizada, calculandoRuta } = useRutasPrecisas();
  const { analyzeDescription, isAnalyzing } = useSmartMercanciaAnalysis();

  const testGeocodificacion = async () => {
    console.log('🧪 [TEST] Iniciando test de geocodificación...');
    toast.info('Probando geocodificación...');
    
    try {
      const resultado = await geocodificarDireccion(direccionTest);
      console.log('🧪 [TEST] Resultado geocodificación:', resultado);
      
      setResultados(prev => ({
        ...prev,
        geocodificacion: {
          exito: !!resultado,
          datos: resultado,
          error: !resultado ? 'Geocodificación falló' : null
        }
      }));
      
      if (resultado) {
        toast.success('✅ Geocodificación exitosa');
      } else {
        toast.error('❌ Geocodificación falló');
      }
    } catch (error) {
      console.error('🧪 [TEST] Error en geocodificación:', error);
      setResultados(prev => ({
        ...prev,
        geocodificacion: {
          exito: false,
          datos: null,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      }));
      toast.error('❌ Error en geocodificación');
    }
  };

  const testCalculoRuta = async () => {
    console.log('🧪 [TEST] Iniciando test de cálculo de ruta...');
    toast.info('Probando cálculo de ruta...');
    
    try {
      const resultado = await calcularRutaOptimizada(
        'Ciudad de México, CDMX',
        'Guadalajara, Jalisco'
      );
      console.log('🧪 [TEST] Resultado cálculo ruta:', resultado);
      
      setResultados(prev => ({
        ...prev,
        ruta: {
          exito: !!resultado,
          datos: resultado,
          error: !resultado ? 'Cálculo de ruta falló' : null
        }
      }));
      
      if (resultado) {
        toast.success('✅ Cálculo de ruta exitoso');
      } else {
        toast.error('❌ Cálculo de ruta falló');
      }
    } catch (error) {
      console.error('🧪 [TEST] Error en cálculo de ruta:', error);
      setResultados(prev => ({
        ...prev,
        ruta: {
          exito: false,
          datos: null,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      }));
      toast.error('❌ Error en cálculo de ruta');
    }
  };

  const testAnalisisMercancia = async () => {
    console.log('🧪 [TEST] Iniciando test de análisis de mercancía...');
    toast.info('Probando análisis de mercancía...');
    
    try {
      const resultado = await analyzeDescription(mercanciaTest);
      console.log('🧪 [TEST] Resultado análisis mercancía:', resultado);
      
      setResultados(prev => ({
        ...prev,
        mercancia: {
          exito: !!resultado,
          datos: resultado,
          error: !resultado ? 'Análisis de mercancía falló' : null
        }
      }));
      
      if (resultado) {
        toast.success('✅ Análisis de mercancía exitoso');
      } else {
        toast.error('❌ Análisis de mercancía falló');
      }
    } catch (error) {
      console.error('🧪 [TEST] Error en análisis de mercancía:', error);
      setResultados(prev => ({
        ...prev,
        mercancia: {
          exito: false,
          datos: null,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      }));
      toast.error('❌ Error en análisis de mercancía');
    }
  };

  const testTodo = async () => {
    console.log('🧪 [TEST] Iniciando test completo...');
    await testGeocodificacion();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
    await testCalculoRuta();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
    await testAnalisisMercancia();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            🔧 Panel de Diagnóstico - Sistema de Rutas y Mercancías
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Cerrar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Test de Geocodificación */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">🗺️ Test de Geocodificación</h3>
            <Input
              value={direccionTest}
              onChange={(e) => setDireccionTest(e.target.value)}
              placeholder="Dirección para geocodificar"
            />
            <Button onClick={testGeocodificacion} className="w-full">
              Probar Geocodificación
            </Button>
          </div>

          {/* Test de Cálculo de Ruta */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">🛣️ Test de Cálculo de Ruta</h3>
            <Button 
              onClick={testCalculoRuta} 
              className="w-full"
              disabled={calculandoRuta}
            >
              {calculandoRuta ? 'Calculando...' : 'Probar Cálculo de Ruta (CDMX → Guadalajara)'}
            </Button>
          </div>

          {/* Test de Análisis de Mercancía */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">🤖 Test de Análisis de Mercancía (IA)</h3>
            <Textarea
              value={mercanciaTest}
              onChange={(e) => setMercanciaTest(e.target.value)}
              placeholder="Descripción de mercancía para analizar"
              rows={3}
            />
            <Button 
              onClick={testAnalisisMercancia} 
              className="w-full"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analizando...' : 'Probar Análisis de Mercancía'}
            </Button>
          </div>

          {/* Test Completo */}
          <div className="space-y-3">
            <Button 
              onClick={testTodo} 
              variant="secondary" 
              className="w-full"
              disabled={calculandoRuta || isAnalyzing}
            >
              🚀 Ejecutar Todos los Tests
            </Button>
          </div>

          {/* Resultados */}
          {resultados && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">📊 Resultados</h3>
              
              {resultados.geocodificacion && (
                <Card className={`border-l-4 ${resultados.geocodificacion.exito ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {resultados.geocodificacion.exito ? '✅' : '❌'} Geocodificación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(resultados.geocodificacion, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {resultados.ruta && (
                <Card className={`border-l-4 ${resultados.ruta.exito ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {resultados.ruta.exito ? '✅' : '❌'} Cálculo de Ruta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(resultados.ruta, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {resultados.mercancia && (
                <Card className={`border-l-4 ${resultados.mercancia.exito ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {resultados.mercancia.exito ? '✅' : '❌'} Análisis de Mercancía
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(resultados.mercancia, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}