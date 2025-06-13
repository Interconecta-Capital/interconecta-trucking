
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

interface ImprovedAuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  showLogo?: boolean;
}

export function ImprovedAuthCard({ 
  title, 
  description, 
  children, 
  showLogo = true 
}: ImprovedAuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-interconecta-bg-alternate via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            {showLogo && (
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-interconecta-primary to-interconecta-accent rounded-2xl blur-lg opacity-30"></div>
                  <div className="relative interconecta-gradient p-4 rounded-2xl">
                    <Truck className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
            )}
            <CardTitle className="text-3xl font-bold font-sora text-interconecta-text-primary bg-gradient-to-r from-interconecta-primary to-interconecta-accent bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <CardDescription className="font-inter text-interconecta-text-secondary text-lg mt-2">
              {description}
            </CardDescription>
            <div className="mt-4 h-1 w-20 bg-gradient-to-r from-interconecta-primary to-interconecta-accent rounded-full mx-auto"></div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {children}
          </CardContent>
        </Card>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-interconecta-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-interconecta-accent/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}
