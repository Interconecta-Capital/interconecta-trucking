
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Play, CheckCircle, Truck, Users, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const EnhancedHeroSection = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [liveCounter, setLiveCounter] = useState(2547);

  const rotatingStats = [
    { icon: Users, value: "500+", label: "Empresas activas", color: "text-blue-600" },
    { icon: Truck, value: "1,200+", label: "Vehículos gestionados", color: "text-green-600" },
    { icon: Clock, value: "85%", label: "Reducción de tiempo", color: "text-purple-600" },
    { icon: Shield, value: "99.9%", label: "Cumplimiento SAT", color: "text-orange-600" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % rotatingStats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const counter = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(counter);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-interconecta-bg-alternate via-white to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-interconecta-primary/20 to-interconecta-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-interconecta-primary/5 to-interconecta-accent/5 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Badge Principal */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full px-6 py-3 mb-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <Truck className="h-5 w-5 text-interconecta-primary mr-2 animate-pulse" />
              <span className="text-sm font-inter font-semibold text-blue-700">
                Primera Plataforma IA Especializada en Transporte Mexicano
              </span>
            </div>
          </div>
          
          {/* Título Principal con Animación */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold font-sora text-interconecta-text-primary mb-6 leading-tight animate-fade-in">
              Revoluciona tu
              <br />
              <span className="relative inline-block">
                <span className="gradient-text animate-pulse">Negocio de Transporte</span>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-interconecta-primary to-interconecta-accent rounded-full animate-pulse"></div>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl font-inter text-interconecta-text-secondary mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Con inteligencia artificial, automatiza cartas porte, cumple con el SAT al 100% 
              y reduce el tiempo de gestión de <span className="font-bold text-interconecta-primary">2 horas a 15 minutos</span>
            </p>
          </div>

          {/* Live Counter */}
          <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="inline-flex items-center bg-white/70 backdrop-blur-sm border border-green-200 rounded-full px-6 py-3 shadow-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-sm font-inter font-medium text-gray-700">
                <span className="font-bold text-green-600">{liveCounter.toLocaleString()}</span> cartas porte generadas hoy
              </span>
            </div>
          </div>
          
          {/* Botones CTA Mejorados */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Link to="/auth/trial">
              <Button size="lg" className="bg-gradient-to-r from-interconecta-primary to-interconecta-accent hover:from-interconecta-accent hover:to-interconecta-primary text-white px-10 py-6 text-lg font-sora font-semibold shadow-2xl hover:shadow-interconecta-primary/50 transition-all duration-300 hover:scale-105 group">
                <Calendar className="mr-3 h-6 w-6 group-hover:animate-bounce" />
                Prueba 14 días GRATIS
                <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button size="lg" variant="outline" className="border-2 border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary hover:text-white px-10 py-6 text-lg font-sora font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group backdrop-blur-sm bg-white/80">
                <Play className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                Ver Demo en Vivo
              </Button>
            </Link>
          </div>

          {/* Stats Dinámicos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-interconecta-border-subtle hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="text-3xl font-bold font-sora text-interconecta-primary mb-2 group-hover:scale-110 transition-transform">$2.5M</div>
              <div className="text-sm font-inter text-interconecta-text-secondary">En multas evitadas</div>
              <CheckCircle className="h-5 w-5 text-green-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-interconecta-border-subtle hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="text-3xl font-bold font-sora text-interconecta-primary mb-2 group-hover:scale-110 transition-transform">500+</div>
              <div className="text-sm font-inter text-interconecta-text-secondary">Cartas porte diarias</div>
              <CheckCircle className="h-5 w-5 text-green-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-interconecta-border-subtle hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="text-3xl font-bold font-sora text-interconecta-primary mb-2 group-hover:scale-110 transition-transform">99.9%</div>
              <div className="text-sm font-inter text-interconecta-text-secondary">Precisión IA</div>
              <CheckCircle className="h-5 w-5 text-green-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-interconecta-border-subtle hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="text-3xl font-bold font-sora text-interconecta-primary mb-2 group-hover:scale-110 transition-transform">15 min</div>
              <div className="text-sm font-inter text-interconecta-text-secondary">vs 2 horas manual</div>
              <CheckCircle className="h-5 w-5 text-green-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Rotating Stat Display */}
          <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="inline-flex items-center bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-full px-8 py-4 shadow-lg">
              <div className="mr-4">
                {React.createElement(rotatingStats[currentStat].icon, {
                  className: `h-8 w-8 ${rotatingStats[currentStat].color} animate-pulse`
                })}
              </div>
              <div className="text-left">
                <div className={`text-2xl font-bold font-sora ${rotatingStats[currentStat].color}`}>
                  {rotatingStats[currentStat].value}
                </div>
                <div className="text-sm font-inter text-gray-600">
                  {rotatingStats[currentStat].label}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;
