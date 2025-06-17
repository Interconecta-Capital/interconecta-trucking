
import { useState, useEffect } from "react";
import { Crown, Bot, Shield, TrendingUp } from "lucide-react";

const TruckAnimation = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Crown,
      title: "Producto Único en México",
      description: "Primera y única plataforma IA especializada",
      color: "from-yellow-400 to-orange-500",
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      iconBg: "bg-yellow-500"
    },
    {
      icon: Bot,
      title: "Inteligencia Artificial Avanzada",
      description: "OCR que lee cualquier documento en segundos",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-500"
    },
    {
      icon: Shield,
      title: "Cumplimiento Garantizado",
      description: "100% compatible con regulaciones SAT",
      color: "from-green-400 to-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      iconBg: "bg-green-500"
    },
    {
      icon: TrendingUp,
      title: "Escalabilidad Sin Límites",
      description: "Desde 1 hasta 1,000+ vehículos",
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconBg: "bg-purple-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentFeatureData = features[currentFeature];
  const IconComponent = currentFeatureData.icon;

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[500px] flex items-center justify-center">
      
      {/* Feature Card - Positioned above truck */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className={`${currentFeatureData.bgColor} p-8 rounded-20 shadow-2xl max-w-md border border-white/50 backdrop-blur-sm transition-all duration-1000 ease-in-out transform hover:scale-105`}
             style={{
               animation: `fade-in 1s ease-in-out`,
               boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5)'
             }}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 ${currentFeatureData.iconBg} rounded-16 flex items-center justify-center shadow-lg`}>
              <IconComponent className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-800 mb-2 leading-tight">
                {currentFeatureData.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {currentFeatureData.description}
              </p>
            </div>
          </div>
          
          {/* Navigation arrows */}
          <div className="flex justify-between items-center mt-6">
            <button 
              onClick={() => setCurrentFeature((prev) => (prev - 1 + features.length) % features.length)}
              className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition-colors shadow-md"
            >
              <span className="text-gray-600 text-lg">←</span>
            </button>
            
            <div className="flex gap-2">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentFeature 
                      ? 'bg-blue-500 scale-125' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button 
              onClick={() => setCurrentFeature((prev) => (prev + 1) % features.length)}
              className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-white transition-colors shadow-md"
            >
              <span className="text-gray-600 text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Modern Truck Illustration */}
      <div className="relative z-10">
        <svg 
          width="500" 
          height="280" 
          viewBox="0 0 500 280" 
          className="drop-shadow-2xl"
        >
          {/* Truck Shadow */}
          <ellipse 
            cx="250" 
            cy="260" 
            rx="180" 
            ry="15" 
            fill="rgba(0,0,0,0.1)"
            className="animate-pulse"
          />
          
          {/* Truck Body/Container */}
          <rect 
            x="80" 
            y="120" 
            width="280" 
            height="100" 
            rx="12" 
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="2"
            className="transition-all duration-1000"
          />
          
          {/* Container Detail Lines */}
          <line x1="90" y1="140" x2="350" y2="140" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="90" y1="200" x2="350" y2="200" stroke="#e2e8f0" strokeWidth="1" />
          
          {/* Truck Cab */}
          <rect 
            x="340" 
            y="100" 
            width="90" 
            height="120" 
            rx="12" 
            fill="#3b82f6"
            className="transition-all duration-500"
          />
          
          {/* Cab Details */}
          <rect 
            x="350" 
            y="110" 
            width="70" 
            height="50" 
            rx="6" 
            fill="#93c5fd"
            opacity="0.8"
          />
          
          {/* Door Line */}
          <line x1="370" y1="100" x2="370" y2="220" stroke="#1e40af" strokeWidth="2" />
          
          {/* Front Grille */}
          <rect 
            x="425" 
            y="130" 
            width="15" 
            height="60" 
            rx="6" 
            fill="#1e40af"
          />
          
          {/* Wheels with Animation */}
          <g className="animate-[spin_3s_linear_infinite]" style={{ transformOrigin: "140px 240px" }}>
            <circle cx="140" cy="240" r="25" fill="#374151" />
            <circle cx="140" cy="240" r="18" fill="#6b7280" />
            <circle cx="140" cy="240" r="8" fill="#9ca3af" />
          </g>
          
          <g className="animate-[spin_3s_linear_infinite]" style={{ transformOrigin: "290px 240px" }}>
            <circle cx="290" cy="240" r="25" fill="#374151" />
            <circle cx="290" cy="240" r="18" fill="#6b7280" />
            <circle cx="290" cy="240" r="8" fill="#9ca3af" />
          </g>
          
          <g className="animate-[spin_3s_linear_infinite]" style={{ transformOrigin: "380px 240px" }}>
            <circle cx="380" cy="240" r="25" fill="#374151" />
            <circle cx="380" cy="240" r="18" fill="#6b7280" />
            <circle cx="380" cy="240" r="8" fill="#9ca3af" />
          </g>
          
          {/* Animated Cargo Load Indicator */}
          <rect 
            x="100" 
            y="140" 
            width="220" 
            height="40" 
            rx="8" 
            className={`transition-all duration-1000 ease-in-out ${currentFeatureData.bgColor.replace('bg-gradient-to-br', 'fill-current')}`}
            style={{
              fill: `url(#gradient-${currentFeature})`
            }}
          />
          
          {/* Dynamic Gradients */}
          <defs>
            {features.map((feature, index) => (
              <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={feature.color.includes('yellow') ? '#fbbf24' : 
                                              feature.color.includes('blue') ? '#3b82f6' :
                                              feature.color.includes('green') ? '#10b981' : '#8b5cf6'} />
                <stop offset="100%" stopColor={feature.color.includes('yellow') ? '#f59e0b' : 
                                                feature.color.includes('blue') ? '#1d4ed8' :
                                                feature.color.includes('green') ? '#059669' : '#7c3aed'} />
              </linearGradient>
            ))}
          </defs>
          
          {/* Motion Lines */}
          <g className="opacity-30">
            <line x1="20" y1="180" x2="60" y2="180" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
            <line x1="30" y1="160" x2="50" y2="160" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            <line x1="25" y1="200" x2="55" y2="200" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" className="animate-pulse" style={{ animationDelay: '1s' }} />
          </g>
        </svg>
      </div>
      
      {/* Road with animated dashes */}
      <div className="absolute bottom-8 left-0 right-0 h-3 bg-gray-300 overflow-hidden rounded-full">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-400 transform -translate-y-1/2">
          <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-pulse" />
        </div>
        {/* Moving road marks */}
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-0.5">
          <div className="w-8 h-full bg-white animate-[slide-in-right_2s_ease-in-out_infinite] opacity-70" />
        </div>
      </div>
      
    </div>
  );
};

export default TruckAnimation;
