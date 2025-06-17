
import { useState, useEffect } from "react";
import { Crown, Bot, Shield, TrendingUp } from "lucide-react";

const TruckAnimation = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Crown,
      title: "Producto Único en México",
      description: "Primera y única plataforma IA especializada",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Bot,
      title: "Inteligencia Artificial Avanzada",
      description: "OCR que lee cualquier documento en segundos",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: Shield,
      title: "Cumplimiento Garantizado",
      description: "100% compatible con regulaciones SAT",
      color: "from-green-400 to-green-600"
    },
    {
      icon: TrendingUp,
      title: "Escalabilidad Sin Límites",
      description: "Desde 1 hasta 1,000+ vehículos",
      color: "from-purple-400 to-purple-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentFeatureData = features[currentFeature];
  const IconComponent = currentFeatureData.icon;

  return (
    <div className="relative w-full max-w-4xl mx-auto h-96 flex items-center justify-center">
      
      {/* Truck SVG */}
      <div className="relative">
        <svg 
          width="400" 
          height="200" 
          viewBox="0 0 400 200" 
          className="drop-shadow-2xl"
        >
          {/* Truck Body */}
          <rect 
            x="50" 
            y="80" 
            width="250" 
            height="80" 
            rx="8" 
            fill="#3B82F6"
            className="animate-pulse"
          />
          
          {/* Truck Cab */}
          <rect 
            x="280" 
            y="60" 
            width="80" 
            height="100" 
            rx="8" 
            fill="#1E40AF"
          />
          
          {/* Windshield */}
          <rect 
            x="290" 
            y="70" 
            width="60" 
            height="40" 
            rx="4" 
            fill="#93C5FD"
            opacity="0.7"
          />
          
          {/* Front Bumper */}
          <rect 
            x="360" 
            y="90" 
            width="15" 
            height="50" 
            rx="4" 
            fill="#1E40AF"
          />
          
          {/* Wheels */}
          <circle cx="110" cy="180" r="20" fill="#374151" />
          <circle cx="110" cy="180" r="12" fill="#6B7280" />
          <circle cx="240" cy="180" r="20" fill="#374151" />
          <circle cx="240" cy="180" r="12" fill="#6B7280" />
          <circle cx="320" cy="180" r="20" fill="#374151" />
          <circle cx="320" cy="180" r="12" fill="#6B7280" />
          
          {/* Animated Cargo Box */}
          <rect 
            x="70" 
            y="100" 
            width="200" 
            height="40" 
            rx="6" 
            className={`bg-gradient-to-r ${currentFeatureData.color} transition-all duration-1000 ease-in-out transform`}
            fill="url(#gradient)"
          />
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
          
          {/* Truck Lines/Details */}
          <line x1="50" y1="120" x2="300" y2="120" stroke="#1E40AF" strokeWidth="2" />
          <line x1="280" y1="100" x2="280" y2="160" stroke="#1E40AF" strokeWidth="2" />
        </svg>
        
        {/* Animated Feature Card */}
        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4 transition-all duration-1000 ease-in-out`}>
          <div className={`bg-gradient-to-r ${currentFeatureData.color} p-6 rounded-16 text-white shadow-2xl max-w-xs animate-bounce`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg">{currentFeatureData.title}</h3>
            </div>
            <p className="text-sm opacity-90">{currentFeatureData.description}</p>
          </div>
        </div>
      </div>
      
      {/* Progress Indicators */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-2">
        {features.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentFeature 
                ? 'bg-blue-interconecta scale-125' 
                : 'bg-gray-30'
            }`}
          />
        ))}
      </div>
      
      {/* Road Animation */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-400 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-400 animate-pulse" />
      </div>
      
    </div>
  );
};

export default TruckAnimation;
