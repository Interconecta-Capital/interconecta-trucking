
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactSalesModal } from "./ContactSalesModal";

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  buttonLink: string;
  isEnterprise?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <Card className={`relative h-[600px] p-10 transition-all duration-400 ease-premium transform-gpu card-premium ${
      plan.isPopular 
        ? 'border-2 border-blue-interconecta shadow-premium scale-105' 
        : 'border border-gray-20'
    }`}>
      
      {/* Popular Badge */}
      {plan.isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 gradient-premium text-pure-white font-semibold px-4 py-1">
          MÁS POPULAR
        </Badge>
      )}
      
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="text-xl font-bold text-gray-90 mb-4">
          {plan.name}
        </CardTitle>
        
        <div className="mb-4">
          <div className="text-3xl font-bold text-blue-interconecta font-mono">
            {plan.price}
          </div>
        </div>
        
        <p className="text-gray-60 leading-relaxed">
          {plan.description}
        </p>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        
        {/* Features List */}
        <ul className="space-y-4 mb-8 flex-1">
          {plan.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-70 text-sm leading-relaxed">
                {feature}
              </span>
            </li>
          ))}
        </ul>
        
        {/* CTA Button */}
        <div className="mt-auto">
          {plan.isEnterprise ? (
            <ContactSalesModal />
          ) : (
            <Link to={plan.buttonLink} className="block">
              <Button className={`w-full btn-premium font-semibold ${
                plan.isPopular 
                  ? 'gradient-premium text-pure-white shadow-premium' 
                  : 'border-2 border-blue-interconecta text-blue-interconecta hover:bg-blue-interconecta hover:text-pure-white'
              }`} variant={plan.isPopular ? 'default' : 'outline'}>
                {plan.buttonText}
              </Button>
            </Link>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}
