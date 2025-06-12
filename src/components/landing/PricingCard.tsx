
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
    <Card className={`relative ${plan.isPopular ? 'border-interconecta-primary shadow-lg scale-105' : 'border-interconecta-border-subtle'}`}>
      {plan.isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-interconecta-primary text-white font-sora font-medium px-3 py-1 text-xs sm:text-sm">
          MÁS POPULAR
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-sora text-interconecta-text-primary">{plan.name}</CardTitle>
        <div className="mt-4">
          <div className="text-3xl font-bold font-sora text-interconecta-primary">{plan.price}</div>
        </div>
        <p className="text-interconecta-text-secondary font-inter">{plan.description}</p>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="font-inter text-interconecta-text-body text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        {plan.isEnterprise ? (
          <ContactSalesModal />
        ) : (
          <Link to={plan.buttonLink}>
            <Button className={`w-full font-sora font-medium ${
              plan.isPopular 
                ? 'bg-interconecta-primary hover:bg-interconecta-accent text-white' 
                : 'border-interconecta-primary text-interconecta-primary hover:bg-interconecta-primary-light'
            }`} variant={plan.isPopular ? 'default' : 'outline'}>
              {plan.buttonText}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
