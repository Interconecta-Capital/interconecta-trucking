
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator, AlertTriangle, TrendingUp } from "lucide-react";

const ROICalculator = () => {
  const [monthlyTrips, setMonthlyTrips] = useState([50]);
  const [avoidedFines, setAvoidedFines] = useState([2]);

  // Cálculos del ROI con números reales
  const timePerTripManual = 1.5; // 1.5 horas manual vs 15 minutos automatizado
  const timePerTripAuto = 0.25; // 15 minutos
  const savedTimePerTrip = timePerTripManual - timePerTripAuto; // 1.25 horas ahorradas
  const hourlyRate = 180; // MXN por hora (más realista)
  const fineAmount = 75000; // MXN promedio por multa (más realista)
  
  const monthlySavings = (monthlyTrips[0] * savedTimePerTrip * hourlyRate) + (avoidedFines[0] * fineAmount);
  const annualSavings = monthlySavings * 12;

  return (
    <div className="bg-gradient-to-br from-interconecta-bg-alternate to-white py-16">
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
          <Card className="border-interconecta-border-subtle shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-interconecta-primary to-interconecta-accent text-white rounded-t-lg">
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
                      max={300}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-interconecta-text-secondary mt-2">
                      <span>5</span>
                      <span>300</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold font-sora text-interconecta-text-primary mb-4">
                      Multas SAT evitadas por mes: {avoidedFines[0]}
                    </label>
                    <Slider
                      value={avoidedFines}
                      onValueChange={setAvoidedFines}
                      max={10}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-interconecta-text-secondary mt-2">
                      <span>0</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-interconecta-primary-light to-interconecta-bg-alternate p-6 rounded-lg border border-interconecta-border-subtle">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-interconecta-primary mx-auto mb-4" />
                    <h4 className="text-2xl font-bold font-sora text-interconecta-text-primary mb-2">
                      Ahorro Anual Estimado
                    </h4>
                    <div className="text-4xl font-bold font-sora text-interconecta-primary mb-4">
                      ${annualSavings.toLocaleString('es-MX')} MXN
                    </div>
                    <div className="text-lg font-medium font-inter text-interconecta-text-secondary">
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-interconecta-border-subtle">
                <div className="text-center">
                  <div className="text-2xl font-bold font-sora text-interconecta-primary">$500,000</div>
                  <div className="text-sm font-inter text-interconecta-text-secondary">Multa máxima SAT</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-sora text-interconecta-primary">15 min</div>
                  <div className="text-sm font-inter text-interconecta-text-secondary">vs 1.5 horas manual</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-sora text-interconecta-primary">99.9%</div>
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
