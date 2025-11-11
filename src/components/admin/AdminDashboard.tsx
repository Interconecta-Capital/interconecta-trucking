
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemHealthDashboard } from './SystemHealthDashboard';
import { PACStatusIndicator } from './PACStatusIndicator';
import { SecurityAuditDashboard } from './SecurityAuditDashboard';
import { SystemMetricsDashboard } from './SystemMetricsDashboard';
import { Activity, Server, Zap, Shield, BarChart3 } from 'lucide-react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Administration</h1>
        <p className="text-muted-foreground">
          Monitor and manage your Carta Porte system performance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="pac" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            PAC Status
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Audit
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            System Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SystemHealthDashboard />
            <PACStatusIndicator />
          </div>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <SystemHealthDashboard />
        </TabsContent>

        <TabsContent value="pac" className="mt-6">
          <PACStatusIndicator />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityAuditDashboard />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <SystemMetricsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
