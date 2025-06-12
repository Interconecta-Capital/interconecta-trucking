
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator, AlertTriangle, TrendingUp } from "lucide-react";

const ROICalculator = () => {
  const [monthlyTrips, setMonthlyTrips] = useState([50]);
  const [avoidedFines, setAvoidedFines] = useState([5]);

  // Cálculos del ROI
  const timePerTrip = 2; // 2 horas manual vs 15 minutos automatizado
  const savedTimePerTrip = 1.75; // 1 hora 45 minutos ahorrados
  const hourlyRate = 250; // MXN por hora
  const fineAmount = 100000; // MXN promedio por multa
  
  const monthlySavings = (monthlyTrips[0] * savedTimePerTrip * hourlyRate) + (avoidedFines[0] * fineAmount);
  const annualSavings = monthlySavings * 12;

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-red-100 border border-red-200 rounded-full px-4 py-2 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm font-inter font-medium text-red-700">
              Calculadora de Pérdidas
            </span>
          </div>
          <h3 className="text-4xl font-bold font-sora text-interconecta-text-primary mb-4">
            ¿Cuánto pierdes SIN Interconecta Trucking?
          </h3>
          <p className="text-xl font-inter text-interconecta-text-secondary max-w-2xl mx-auto">
            Calcula el costo real de seguir con procesos manuales y el riesgo de multas SAT
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-center text-2xl font-sora">
                <Calculator className="mr-3 h-6 w-6" />
                Calculadora de ROI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div>
                    <label className="block text-lg font-semibold font-sora text-interconecta-text-primary mb-4">
                      Número de viajes por mes: {monthlyTrips[0]}
                    </label>
                    <Slider
                      value={monthlyTrips}
                      onValueChange={setMonthlyTrips}
                      max={500}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-interconecta-text-secondary mt-2">
                      <span>10</span>
                      <span>500</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold font-sora text-interconecta-text-primary mb-4">
                      Multas SAT evitadas por mes: {avoidedFines[0]}
                    </label>
                    <Slider
                      value={avoidedFines}
                      onValueChange={setAvoidedFines}
                      max={20}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-interconecta-text-secondary mt-2">
                      <span>0</span>
                      <span>20</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h4 className="text-2xl font-bold font-sora text-green-700 mb-2">
                      Ahorro Anual Estimado
                    </h4>
                    <div className="text-4xl font-bold font-sora text-green-600 mb-4">
                      ${annualSavings.toLocaleString('es-MX')} MXN
                    </div>
                    <div className="text-lg font-medium font-inter text-green-700">
                      ${monthlySavings.toLocaleString('es-MX')} MXN por mes
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 text-sm font-inter">
                    <div className="flex justify-between">
                      <span>Ahorro en tiempo:</span>
                      <span className="font-semibold">${(monthlyTrips[0] * savedTimePerTrip * hourlyRate * 12).toLocaleString('es-MX')} MXN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multas evitadas:</span>
                      <span className="font-semibold">${(avoidedFines[0] * fineAmount * 12).toLocaleString('es-MX')} MXN</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold font-sora text-red-600">$500,000</div>
                  <div className="text-sm font-inter text-interconecta-text-secondary">Multa máxima SAT</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-sora text-interconecta-primary">15 min</div>
                  <div className="text-sm font-inter text-interconecta-text-secondary">vs 2 horas manual</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-sora text-green-600">99.9%</div>
                  <div className="text-sm font-inter text-interconecta-text-secondary">Precisión IA</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-sora text-interconecta-primary">#1</div>
                  <div className="text-sm font-inter text-interconecta-text-secondary">Plataforma IA México</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
