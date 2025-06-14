export interface SystemMetrics {
  timestamp: Date;
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
  resources: {
    memoryUsage: number;
    cacheHitRate: number;
    databaseConnections: number;
    activeUsers: number;
  };
  business: {
    cartasPorteCreated: number;
    timbradosSuccessful: number;
    timbradosFailed: number;
    revenue: number;
  };
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  metadata: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  details: Record<string, any>;
}

export class MonitoringService {
  private metrics: SystemMetrics[] = [];
  private alerts: Alert[] = [];
  private healthChecks = new Map<string, HealthCheck>();
  private subscribers = new Set<(data: any) => void>();
  private metricsInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.startMetricsCollection();
    this.startHealthChecks();
  }

  private startMetricsCollection() {
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 30000); // Every 30 seconds
  }

  private startHealthChecks() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Every minute
  }

  private async collectMetrics() {
    try {
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        performance: await this.collectPerformanceMetrics(),
        resources: await this.collectResourceMetrics(),
        business: await this.collectBusinessMetrics()
      };

      this.metrics.push(metrics);
      
      // Keep only last 1000 metrics (about 8 hours at 30s intervals)
      if (this.metrics.length > 1000) {
        this.metrics.shift();
      }

      // Check for alerts
      this.checkMetricsForAlerts(metrics);

      // Notify subscribers
      this.notifySubscribers('metrics', metrics);

    } catch (error) {
      console.error('Error collecting metrics:', error);
      this.createAlert('error', 'high', 'Metrics Collection Failed', 
        'Failed to collect system metrics', 'monitoring', { error });
    }
  }

  private async collectPerformanceMetrics() {
    // In a real implementation, these would come from actual monitoring
    const recentRequests = this.getRecentRequests();
    
    return {
      responseTime: this.calculateAverageResponseTime(recentRequests),
      throughput: this.calculateThroughput(recentRequests),
      errorRate: this.calculateErrorRate(recentRequests),
      availability: this.calculateAvailability()
    };
  }

  private async collectResourceMetrics() {
    return {
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: this.getCacheHitRate(),
      databaseConnections: await this.getDatabaseConnections(),
      activeUsers: await this.getActiveUsers()
    };
  }

  private async collectBusinessMetrics() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return {
      cartasPorteCreated: await this.getCartasPorteCount(last24h),
      timbradosSuccessful: await this.getTimbradosCount(last24h, 'successful'),
      timbradosFailed: await this.getTimbradosCount(last24h, 'failed'),
      revenue: await this.getRevenue(last24h)
    };
  }

  private async performHealthChecks() {
    const services = [
      'database',
      'pac_providers',
      'cache',
      'external_apis'
    ];

    for (const service of services) {
      try {
        const healthCheck = await this.checkServiceHealth(service);
        this.healthChecks.set(service, healthCheck);

        if (healthCheck.status === 'down') {
          this.createAlert('error', 'critical', `${service} Service Down`, 
            `${service} is not responding`, service, healthCheck.details);
        } else if (healthCheck.status === 'degraded') {
          this.createAlert('warning', 'medium', `${service} Service Degraded`, 
            `${service} is experiencing issues`, service, healthCheck.details);
        }

      } catch (error) {
        this.createAlert('error', 'high', `Health Check Failed for ${service}`, 
          `Failed to check ${service} health`, 'monitoring', { error });
      }
    }

    this.notifySubscribers('health', Array.from(this.healthChecks.values()));
  }

  private async checkServiceHealth(service: string): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      switch (service) {
        case 'database':
          return await this.checkDatabaseHealth();
        case 'pac_providers':
          return await this.checkPACHealth();
        case 'cache':
          return this.checkCacheHealth();
        case 'external_apis':
          return await this.checkExternalAPIsHealth();
        default:
          throw new Error(`Unknown service: ${service}`);
      }
    } catch (error) {
      return {
        service,
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async checkDatabaseHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simple query to check database connectivity
      const { data, error } = await import('@/integrations/supabase/client').then(m => 
        m.supabase.from('profiles').select('count').limit(1)
      );
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        return {
          service: 'database',
          status: 'down',
          responseTime,
          lastCheck: new Date(),
          details: { error: error.message }
        };
      }

      return {
        service: 'database',
        status: responseTime > 1000 ? 'degraded' : 'healthy',
        responseTime,
        lastCheck: new Date(),
        details: { query_success: true }
      };

    } catch (error) {
      return {
        service: 'database',
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async checkPACHealth(): Promise<HealthCheck> {
    const { multiplePACManager } = await import('@/services/pac/MultiplePACManager');
    const providers = multiplePACManager.getProviderStatus();
    const healthyCount = multiplePACManager.getHealthyProvidersCount();
    
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (healthyCount === 0) {
      status = 'down';
    } else if (healthyCount < providers.filter(p => p.isActive).length / 2) {
      status = 'degraded';
    }

    return {
      service: 'pac_providers',
      status,
      responseTime: 0,
      lastCheck: new Date(),
      details: {
        total_providers: providers.length,
        healthy_providers: healthyCount,
        providers: providers.map(p => ({
          name: p.name,
          status: p.healthStatus,
          success_rate: p.successRate
        }))
      }
    };
  }

  private checkCacheHealth(): HealthCheck {
    const { smartCacheManager } = await import('@/services/cache/SmartCacheManager').then(m => ({ smartCacheManager: m.smartCacheManager }));
    const metrics = smartCacheManager.getMetrics();
    
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (metrics.hitRate < 0.5) {
      status = 'degraded';
    }

    return {
      service: 'cache',
      status,
      responseTime: 0,
      lastCheck: new Date(),
      details: {
        hit_rate: metrics.hitRate,
        total_items: metrics.totalItems,
        memory_usage: metrics.memoryUsage
      }
    };
  }

  private async checkExternalAPIsHealth(): Promise<HealthCheck> {
    // Check external services like Google Maps, SAT, etc.
    const checks = await Promise.allSettled([
      this.pingService('Google Maps', 'https://maps.googleapis.com'),
      this.pingService('SAT', 'https://www.sat.gob.mx')
    ]);

    const successful = checks.filter(check => check.status === 'fulfilled').length;
    const total = checks.length;
    
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (successful === 0) {
      status = 'down';
    } else if (successful < total) {
      status = 'degraded';
    }

    return {
      service: 'external_apis',
      status,
      responseTime: 0,
      lastCheck: new Date(),
      details: {
        total_services: total,
        healthy_services: successful,
        checks: checks.map((check, index) => ({
          service: ['Google Maps', 'SAT'][index],
          status: check.status
        }))
      }
    };
  }

  private async pingService(name: string, url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  createAlert(
    type: Alert['type'], 
    severity: Alert['severity'], 
    title: string, 
    message: string, 
    source: string, 
    metadata: Record<string, any> = {}
  ): Alert {
    const alert: Alert = {
      id: crypto.randomUUID(),
      type,
      severity,
      title,
      message,
      timestamp: new Date(),
      source,
      metadata,
      resolved: false
    };

    this.alerts.unshift(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.pop();
    }

    this.notifySubscribers('alert', alert);
    
    return alert;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.notifySubscribers('alert_resolved', alert);
      return true;
    }
    return false;
  }

  private checkMetricsForAlerts(metrics: SystemMetrics) {
    // Error rate too high
    if (metrics.performance.errorRate > 0.05) { // 5%
      this.createAlert('error', 'high', 'High Error Rate', 
        `Error rate is ${(metrics.performance.errorRate * 100).toFixed(1)}%`, 
        'performance', { error_rate: metrics.performance.errorRate });
    }

    // Response time too slow
    if (metrics.performance.responseTime > 5000) { // 5 seconds
      this.createAlert('warning', 'medium', 'Slow Response Time', 
        `Average response time is ${metrics.performance.responseTime}ms`, 
        'performance', { response_time: metrics.performance.responseTime });
    }

    // Low availability
    if (metrics.performance.availability < 0.99) { // 99%
      this.createAlert('error', 'critical', 'Low Availability', 
        `System availability is ${(metrics.performance.availability * 100).toFixed(2)}%`, 
        'availability', { availability: metrics.performance.availability });
    }

    // Memory usage too high
    if (metrics.resources.memoryUsage > 0.8) { // 80%
      this.createAlert('warning', 'medium', 'High Memory Usage', 
        `Memory usage is ${(metrics.resources.memoryUsage * 100).toFixed(1)}%`, 
        'resources', { memory_usage: metrics.resources.memoryUsage });
    }
  }

  // Helper methods (would be implemented with real data sources)
  private getRecentRequests(): any[] { return []; }
  private calculateAverageResponseTime(requests: any[]): number { return Math.random() * 1000; }
  private calculateThroughput(requests: any[]): number { return Math.random() * 100; }
  private calculateErrorRate(requests: any[]): number { return Math.random() * 0.02; }
  private calculateAvailability(): number { return 0.999 + Math.random() * 0.001; }
  private getMemoryUsage(): number { return Math.random() * 0.7; }
  private getCacheHitRate(): number { return 0.8 + Math.random() * 0.2; }
  private async getDatabaseConnections(): Promise<number> { return Math.floor(Math.random() * 50); }
  private async getActiveUsers(): Promise<number> { return Math.floor(Math.random() * 100); }
  private async getCartasPorteCount(since: Date): Promise<number> { return Math.floor(Math.random() * 100); }
  private async getTimbradosCount(since: Date, type: string): Promise<number> { return Math.floor(Math.random() * 50); }
  private async getRevenue(since: Date): Promise<number> { return Math.random() * 10000; }

  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(type: string, data: any): void {
    this.subscribers.forEach(callback => {
      try {
        callback({ type, data, timestamp: new Date() });
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  getMetrics(limit: number = 100): SystemMetrics[] {
    return this.metrics.slice(-limit);
  }

  getAlerts(includeResolved: boolean = false): Alert[] {
    return includeResolved ? this.alerts : this.alerts.filter(a => !a.resolved);
  }

  getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  getSystemOverview() {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    const unresolvedAlerts = this.alerts.filter(a => !a.resolved);
    const healthChecks = this.getHealthChecks();

    return {
      status: this.getOverallSystemStatus(),
      metrics: latestMetrics,
      alerts: {
        total: unresolvedAlerts.length,
        critical: unresolvedAlerts.filter(a => a.severity === 'critical').length,
        high: unresolvedAlerts.filter(a => a.severity === 'high').length
      },
      services: healthChecks.reduce((acc, check) => {
        acc[check.service] = check.status;
        return acc;
      }, {} as Record<string, string>)
    };
  }

  private getOverallSystemStatus(): 'healthy' | 'degraded' | 'down' {
    const healthChecks = this.getHealthChecks();
    const criticalAlerts = this.alerts.filter(a => !a.resolved && a.severity === 'critical');

    if (criticalAlerts.length > 0 || healthChecks.some(h => h.status === 'down')) {
      return 'down';
    }

    if (healthChecks.some(h => h.status === 'degraded')) {
      return 'degraded';
    }

    return 'healthy';
  }

  destroy() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.subscribers.clear();
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();
