
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  FileText, 
  Brain, 
  CheckCircle, 
  Clock, 
  Zap,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Bot
} from "lucide-react";
import { Link } from "react-router-dom";

const InteractiveDemoSection = () => {
  const [activeDemo, setActiveDemo] = useState('ai-assistant');
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = {
    'ai-assistant': {
      title: 'Asistente IA en Acción',
      description: 'Ve cómo la IA genera descripciones automáticamente',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      steps: [
        { text: 'Usuario sube factura con OCR', time: '2 seg', status: 'completed' },
        { text: 'IA lee y procesa datos automáticamente', time: '3 seg', status: 'completed' },
        { text: 'Genera descripción SAT perfecta', time: '1 seg', status: 'active' },
        { text: 'Valida cumplimiento automático', time: '1 seg', status: 'pending' }
      ]
    },
    'bulk-import': {
      title: 'Importación Masiva',
      description: 'Procesa cientos de documentos en minutos',
      icon: FileSpreadsheet,
      color: 'from-green-500 to-emerald-600',
      steps: [
        { text: 'Arrastra archivo Excel/PDF', time: '1 seg', status: 'completed' },
        { text: 'OCR extrae datos de 500 documentos', time: '30 seg', status: 'completed' },
        { text: 'IA valida y corrige automáticamente', time: '10 seg', status: 'active' },
        { text: 'Genera 500 cartas porte listas', time: '5 seg', status: 'pending' }
      ]
    },
    'automation': {
      title: 'Automatización Total',
      description: 'De inicio a fin sin intervención manual',
      icon: Bot,
      color: 'from-blue-500 to-cyan-600',
      steps: [
        { text: 'Recibe orden de transporte', time: '0 seg', status: 'completed' },
        { text: 'IA crea carta porte automáticamente', time: '15 seg', status: 'completed' },
        { text: 'Timbra con PAC integrado', time: '5 seg', status: 'completed' },
        { text: 'Envía por email y almacena', time: '2 seg', status: 'active' }
      ]
    }
  };

  const beforeAfterComparison = {
    before: {
      title: 'Proceso Manual Tradicional',
      time: '2-3 horas por carta porte',
      steps: [
        'Buscar facturas en folders físicos',
        'Escribir manualmente cada descripción',
        'Verificar códigos SAT uno por uno',
        'Corregir errores múltiples veces',
        'Enviar a timbrar y esperar respuesta'
      ],
      errors: '15-20% de errores',
      stress: 'Alto estrés y frustración'
    },
    after: {
      title: 'Con Interconecta IA',
      time: '10-15 minutos automático',
      steps: [
        'Sube documento con un click',
        'IA lee y procesa automáticamente',
        'Genera descripciones SAT perfectas',
        'Validación automática 99.9%',
        'Timbrado automático instantáneo'
      ],
      errors: '0.1% de errores',
      stress: 'Operación relajada y eficiente'
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-full px-4 py-2 mb-6">
            <Play className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-sm font-inter font-medium text-purple-700">
              Demo Interactivo
            </span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold font-sora text-interconecta-text-primary mb-4">
            Ve la Plataforma en Acción
          </h3>
          <p className="text-xl font-inter text-interconecta-text-secondary max-w-2xl mx-auto">
            Descubre cómo la inteligencia artificial transforma tu operación en tiempo real
          </p>
        </div>

        {/* Demo Selector */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(demoSteps).map(([key, demo]) => (
              <Button
                key={key}
                variant={activeDemo === key ? "default" : "outline"}
                onClick={() => setActiveDemo(key)}
                className={`p-6 h-auto flex flex-col items-center gap-3 transition-all duration-300 ${
                  activeDemo === key 
                    ? 'bg-gradient-to-r from-interconecta-primary to-interconecta-accent text-white shadow-lg scale-105' 
                    : 'hover:shadow-md hover:scale-102'
                }`}
              >
                <demo.icon className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-sora font-semibold">{demo.title}</div>
                  <div className="text-sm opacity-80">{demo.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Active Demo Display */}
        <div className="max-w-6xl mx-auto mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
            <CardHeader className={`bg-gradient-to-r ${demoSteps[activeDemo].color} text-white p-8`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <demoSteps[activeDemo].icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-sora text-white">
                      {demoSteps[activeDemo].title}
                    </CardTitle>
                    <p className="text-white/90 font-inter">
                      {demoSteps[activeDemo].description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  {isPlaying ? 'Pausar' : 'Reproducir'}
                  <Play className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              <div className="space-y-4">
                {demoSteps[activeDemo].steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-500 ${
                      step.status === 'completed' 
                        ? 'bg-green-50 border-green-200' 
                        : step.status === 'active'
                        ? 'bg-blue-50 border-blue-300 shadow-md scale-102'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : step.status === 'active' ? (
                        <Clock className="h-6 w-6 text-blue-600 animate-pulse" />
                      ) : (
                        <div className="h-6 w-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="font-inter font-medium text-gray-800">
                        {step.text}
                      </span>
                    </div>
                    <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                      {step.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Before/After Comparison */}
        <div className="max-w-6xl mx-auto">
          <h4 className="text-3xl font-bold font-sora text-center text-interconecta-text-primary mb-12">
            Transformación Completa de tu Proceso
          </h4>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <Card className="border-2 border-red-200 bg-red-50/50">
              <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardTitle className="font-sora flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  {beforeAfterComparison.before.title}
                </CardTitle>
                <p className="text-red-100 font-inter text-lg">
                  ⏱️ {beforeAfterComparison.before.time}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  {beforeAfterComparison.before.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="font-inter">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
                    <span className="font-inter font-medium">Tasa de Errores:</span>
                    <span className="font-sora font-bold text-red-600">
                      {beforeAfterComparison.before.errors}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
                    <span className="font-inter font-medium">Experiencia:</span>
                    <span className="font-sora font-bold text-red-600">
                      {beforeAfterComparison.before.stress}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border-2 border-green-200 bg-green-50/50 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardTitle className="font-sora flex items-center gap-3">
                  <Zap className="h-6 w-6" />
                  {beforeAfterComparison.after.title}
                </CardTitle>
                <p className="text-green-100 font-inter text-lg">
                  ⚡ {beforeAfterComparison.after.time}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  {beforeAfterComparison.after.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-inter">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                    <span className="font-inter font-medium">Tasa de Errores:</span>
                    <span className="font-sora font-bold text-green-600">
                      {beforeAfterComparison.after.errors}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                    <span className="font-inter font-medium">Experiencia:</span>
                    <span className="font-sora font-bold text-green-600">
                      {beforeAfterComparison.after.stress}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="max-w-2xl mx-auto">
            <h4 className="text-2xl font-bold font-sora text-interconecta-text-primary mb-4">
              ¿Listo para experimentar esta transformación?
            </h4>
            <p className="text-lg font-inter text-interconecta-text-secondary mb-8">
              Prueba gratis por 14 días y descubre por qué somos líderes en automatización
            </p>
            <Link to="/auth/trial">
              <Button size="lg" className="bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary text-white px-8 py-4 text-lg font-sora font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                Comenzar Prueba Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemoSection;
