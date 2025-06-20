
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { ProgressData } from '@/hooks/usePersonalProgress';

interface ProgressChartProps {
  data: ProgressData;
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data.tendenciasMensuales.map(item => ({
    ...item,
    tiempoAhorradoLabel: `${item.tiempoAhorrado}h`,
    erroresEvitadosLabel: `${item.erroresEvitados} errores`,
    eficienciaLabel: `${item.eficiencia}%`
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de tendencia de ahorro de tiempo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 Evolución de Tu Eficiencia</CardTitle>
          <p className="text-sm text-gray-600">
            Tiempo ahorrado y errores evitados mes a mes
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => [
                  name === 'tiempoAhorrado' ? `${value} horas` : 
                  name === 'erroresEvitados' ? `${value} errores` : `${value}%`,
                  name === 'tiempoAhorrado' ? 'Tiempo Ahorrado' : 
                  name === 'erroresEvitados' ? 'Errores Evitados' : 'Eficiencia'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="tiempoAhorrado" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="erroresEvitados" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de barras de eficiencia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🎯 Comparativa de Eficiencia</CardTitle>
          <p className="text-sm text-gray-600">
            Tu rendimiento vs. el promedio de la industria
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value}%`, 'Eficiencia']}
              />
              <Bar 
                dataKey="eficiencia" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              {/* Línea de referencia del promedio de la industria */}
              <Line 
                type="monotone" 
                dataKey={() => 65} 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Tu Eficiencia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-yellow-500 border-dashed"></div>
              <span>Promedio Industria (65%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
