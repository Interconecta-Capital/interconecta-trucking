
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, FileText, Truck, Clock, CheckCircle, ArrowRight, Monitor, Smartphone, Users } from "lucide-react";
import { useState } from "react";

const InteractiveDemoSection = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      title: "Carga de Datos",
      description: "Carga automática de información del transportista y mercancía",
      icon: FileText,
      duration: "30 segundos",
      color: "bg-blue-500"
    },
    {
      title: "Validación IA",
      description: "Inteligencia artificial valida cumplimiento con regulaciones SAT",
      icon: CheckCircle,
      duration: "15 segundos",
      color: "bg-green-500"
    },
    {
      title: "Generación XML",
      description: "Creación automática del XML de carta porte certificado",
      icon: Truck,
      duration: "10 segundos",
      color: "bg-purple-500"
    },
    {
      title: "Carta Porte Lista",
      description: "Documento listo para imprimir y presentar ante autoridades",
      icon: Clock,
      duration: "5 segundos",
      color: "bg-orange-500"
    }
  ];

  const testimonialData = [
    {
      name: "Carlos Mendoza",
      company: "Transportes del Norte",
      quote: "Reducimos el tiempo de 3 horas a 15 minutos por carta porte",
      savings: "$45,000 MXN/mes",
      image: "👨‍💼"
    },
    {
      name: "Ana García",
      company: "Logística Moderna",
      quote: "Cero multas desde que implementamos la plataforma",
      savings: "100% cumplimiento",
      image: "👩‍💼"
    },
    {
      name: "Roberto Silva",
      company: "Carga Segura",
      quote: "La IA detecta errores que antes pasábamos por alto",
      savings: "$80,000 MXN evitados",
      image: "👨‍🔧"
    }
  ];

  const handlePlayDemo = () => {
    setIsPlaying(true);
    // Simulate demo progression
    demoSteps.forEach((_, index) => {
      setTimeout(() => {
        setActiveDemo(index);
        if (index === demoSteps.length - 1) {
          setTimeout(() => setIsPlaying(false), 2000);
        }
      }, index * 2000);
    });
  };

  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold font-sora text-interconecta-text-primary mb-6">
            Ve la Plataforma en Acción
          </h3>
          <p className="text-xl font-inter text-interconecta-text-secondary max-w-3xl mx-auto mb-8">
            Observa cómo nuestra IA transforma el proceso de generación de cartas porte de horas a minutos
          </p>
          
          <Button 
            onClick={handlePlayDemo}
            disabled={isPlaying}
            size="lg" 
            className="bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary text-white px-8 py-4 text-lg font-sora font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <Play className="mr-3 h-6 w-6" />
            {isPlaying ? 'Demo en Progreso...' : 'Iniciar Demo Interactivo'}
          </Button>
        </div>

        {/* Interactive Demo Visualization */}
        <div className="max-w-6xl mx-auto mb-16">
          <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-interconecta-border-subtle shadow-2xl">
            <CardContent className="p-8">
              
              {/* Demo Steps Progress */}
              <div className="flex flex-col lg:flex-row justify-between items-center mb-8">
                {demoSteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center text-center max-w-xs mb-6 lg:mb-0">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${
                      index <= activeDemo && isPlaying 
                        ? `${step.color} text-white scale-110 shadow-lg` 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <h4 className="font-sora font-semibold text-interconecta-text-primary mb-2">
                      {step.title}
                    </h4>
                    <p className="text-sm font-inter text-interconecta-text-secondary mb-2">
                      {step.description}
                    </p>
                    <span className="text-xs font-inter text-interconecta-primary font-medium">
                      {step.duration}
                    </span>
                    
                    {/* Progress connector */}
                    {index < demoSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-24 h-0.5 bg-gray-300">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            index < activeDemo && isPlaying ? 'bg-interconecta-primary w-full' : 'bg-gray-300 w-0'
                          }`}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mock Interface */}
              <div className="bg-gray-900 rounded-lg p-6 text-green-400 font-mono text-sm">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-400">Interconecta Trucking Terminal</span>
                </div>
                
                {isPlaying && (
                  <div className="space-y-2">
                    {demoSteps.slice(0, activeDemo + 1).map((step, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>{step.title}: {step.description}</span>
                      </div>
                    ))}
                    {activeDemo < demoSteps.length - 1 && isPlaying && (
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-2 animate-spin">⟳</span>
                        <span>Procesando...</span>
                      </div>
                    )}
                  </div>
                )}
                
                {!isPlaying && (
                  <div className="text-gray-500">
                    Sistema listo. Presiona "Iniciar Demo" para ver el proceso completo.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Monitor,
              title: "Interfaz Intuitiva",
              description: "Dashboard moderno y fácil de usar, diseñado específicamente para transportistas mexicanos",
              features: ["Navegación simple", "Atajos de teclado", "Modo oscuro"]
            },
            {
              icon: Smartphone,
              title: "100% Responsive",
              description: "Accede desde cualquier dispositivo - computadora, tablet o móvil",
              features: ["App móvil nativa", "Sync en tiempo real", "Offline mode"]
            },
            {
              icon: Users,
              title: "Multi-usuario",
              description: "Gestiona permisos por usuario y mantén control total de tu equipo",
              features: ["Roles personalizados", "Auditoria completa", "Notificaciones"]
            }
          ].map((feature, index) => (
            <Card key={index} className="border-interconecta-border-subtle hover:border-interconecta-primary transition-all duration-300 hover:shadow-lg group">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-br from-interconecta-primary to-interconecta-accent p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-sora font-semibold text-interconecta-text-primary mb-3">
                  {feature.title}
                </h4>
                <p className="font-inter text-interconecta-text-secondary mb-4">
                  {feature.description}
                </p>
                <ul className="text-sm space-y-1">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="font-inter text-interconecta-text-body">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customer Success Stories */}
        <div className="max-w-5xl mx-auto">
          <h4 className="text-3xl font-bold font-sora text-interconecta-text-primary text-center mb-12">
            Casos de Éxito Reales
          </h4>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonialData.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-white to-interconecta-bg-alternate border-interconecta-border-subtle hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{testimonial.image}</div>
                  <h5 className="font-sora font-semibold text-interconecta-text-primary mb-1">
                    {testimonial.name}
                  </h5>
                  <p className="text-sm font-inter text-interconecta-text-secondary mb-4">
                    {testimonial.company}
                  </p>
                  <blockquote className="font-inter text-interconecta-text-body italic mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm font-medium">
                    {testimonial.savings}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary text-white px-8 py-4 text-lg font-sora font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            Comenzar Mi Prueba Gratuita
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemoSection;
