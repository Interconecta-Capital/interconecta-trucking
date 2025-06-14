
export interface APIKey {
  id: string;
  userId: string;
  keyHash: string;
  name: string;
  permissions: APIPermission[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export interface APIPermission {
  resource: 'cartas_porte' | 'clientes' | 'vehiculos' | 'conductores' | 'timbrado';
  actions: ('read' | 'write' | 'delete')[];
  restrictions?: {
    ownDataOnly?: boolean;
    fields?: string[];
  };
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export interface APIRequest {
  apiKeyId: string;
  endpoint: string;
  method: string;
  userId: string;
  requestId: string;
  timestamp: Date;
  responseTime?: number;
  statusCode?: number;
  errorMessage?: string;
}

export class PublicAPIController {
  private rateLimitCache = new Map<string, Map<string, number[]>>();
  private apiKeys = new Map<string, APIKey>();

  constructor() {
    this.initializeDefaultPermissions();
  }

  private initializeDefaultPermissions() {
    // This would load API keys from database
    // For now, we'll use in-memory storage
  }

  async validateAPIKey(keyString: string): Promise<{ isValid: boolean; apiKey?: APIKey; error?: string }> {
    try {
      const keyHash = await this.hashAPIKey(keyString);
      const apiKey = Array.from(this.apiKeys.values()).find(key => key.keyHash === keyHash);

      if (!apiKey) {
        return { isValid: false, error: 'API key not found' };
      }

      if (!apiKey.isActive) {
        return { isValid: false, error: 'API key is disabled' };
      }

      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return { isValid: false, error: 'API key has expired' };
      }

      // Update last used
      apiKey.lastUsed = new Date();

      return { isValid: true, apiKey };
    } catch (error) {
      return { isValid: false, error: 'Invalid API key format' };
    }
  }

  async checkRateLimit(apiKey: APIKey, endpoint: string): Promise<RateLimitStatus> {
    const now = Date.now();
    const keyId = apiKey.id;
    
    if (!this.rateLimitCache.has(keyId)) {
      this.rateLimitCache.set(keyId, new Map());
    }
    
    const keyLimits = this.rateLimitCache.get(keyId)!;
    
    // Check different time windows
    const windows = [
      { key: 'minute', duration: 60 * 1000, limit: apiKey.rateLimit.requestsPerMinute },
      { key: 'hour', duration: 60 * 60 * 1000, limit: apiKey.rateLimit.requestsPerHour },
      { key: 'day', duration: 24 * 60 * 60 * 1000, limit: apiKey.rateLimit.requestsPerDay }
    ];

    for (const window of windows) {
      const windowKey = `${endpoint}:${window.key}`;
      
      if (!keyLimits.has(windowKey)) {
        keyLimits.set(windowKey, []);
      }
      
      const requests = keyLimits.get(windowKey)!;
      
      // Clean old requests
      const cutoff = now - window.duration;
      const validRequests = requests.filter(time => time > cutoff);
      keyLimits.set(windowKey, validRequests);
      
      if (validRequests.length >= window.limit) {
        const oldestRequest = Math.min(...validRequests);
        const resetTime = new Date(oldestRequest + window.duration);
        const retryAfter = Math.ceil((resetTime.getTime() - now) / 1000);
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter
        };
      }
    }

    // All windows passed, record the request
    for (const window of windows) {
      const windowKey = `${endpoint}:${window.key}`;
      const requests = keyLimits.get(windowKey)!;
      requests.push(now);
    }

    return {
      allowed: true,
      remaining: apiKey.rateLimit.requestsPerMinute - (keyLimits.get(`${endpoint}:minute`)?.length || 0),
      resetTime: new Date(now + 60 * 1000) // Next minute
    };
  }

  hasPermission(apiKey: APIKey, resource: string, action: string): boolean {
    return apiKey.permissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action as any)
    );
  }

  async logAPIRequest(request: APIRequest): Promise<void> {
    // This would log to database for analytics
    console.log('API Request:', {
      key: request.apiKeyId,
      endpoint: request.endpoint,
      method: request.method,
      timestamp: request.timestamp,
      responseTime: request.responseTime,
      status: request.statusCode
    });
  }

  async createAPIKey(
    userId: string, 
    name: string, 
    permissions: APIPermission[],
    rateLimit?: Partial<APIKey['rateLimit']>,
    expiresAt?: Date
  ): Promise<{ apiKey: APIKey; keyString: string }> {
    const keyString = this.generateAPIKeyString();
    const keyHash = await this.hashAPIKey(keyString);
    
    const apiKey: APIKey = {
      id: crypto.randomUUID(),
      userId,
      keyHash,
      name,
      permissions,
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        ...rateLimit
      },
      isActive: true,
      createdAt: new Date(),
      expiresAt
    };

    this.apiKeys.set(apiKey.id, apiKey);
    
    return { apiKey, keyString };
  }

  async revokeAPIKey(keyId: string): Promise<boolean> {
    const apiKey = this.apiKeys.get(keyId);
    if (apiKey) {
      apiKey.isActive = false;
      return true;
    }
    return false;
  }

  async getAPIKeysForUser(userId: string): Promise<APIKey[]> {
    return Array.from(this.apiKeys.values()).filter(key => key.userId === userId);
  }

  getAPIUsageStats(apiKeyId: string): any {
    const requests = this.rateLimitCache.get(apiKeyId);
    if (!requests) return null;

    const stats = {
      totalRequests: 0,
      requestsLast24h: 0,
      requestsLastHour: 0,
      mostUsedEndpoints: new Map<string, number>()
    };

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    for (const [endpoint, timestamps] of requests.entries()) {
      const cleanEndpoint = endpoint.split(':')[0];
      stats.totalRequests += timestamps.length;
      stats.requestsLast24h += timestamps.filter(t => t > oneDayAgo).length;
      stats.requestsLastHour += timestamps.filter(t => t > oneHourAgo).length;
      
      const count = stats.mostUsedEndpoints.get(cleanEndpoint) || 0;
      stats.mostUsedEndpoints.set(cleanEndpoint, count + timestamps.length);
    }

    return {
      ...stats,
      mostUsedEndpoints: Array.from(stats.mostUsedEndpoints.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  }

  private generateAPIKeyString(): string {
    const prefix = 'cp_live_';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = prefix;
    
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  private async hashAPIKey(keyString: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(keyString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Predefined permission templates
  static getPermissionTemplates(): Record<string, APIPermission[]> {
    return {
      'read_only': [
        {
          resource: 'cartas_porte',
          actions: ['read'],
          restrictions: { ownDataOnly: true }
        },
        {
          resource: 'clientes',
          actions: ['read'],
          restrictions: { ownDataOnly: true }
        }
      ],
      'full_access': [
        {
          resource: 'cartas_porte',
          actions: ['read', 'write', 'delete'],
          restrictions: { ownDataOnly: true }
        },
        {
          resource: 'clientes',
          actions: ['read', 'write', 'delete'],
          restrictions: { ownDataOnly: true }
        },
        {
          resource: 'vehiculos',
          actions: ['read', 'write'],
          restrictions: { ownDataOnly: true }
        },
        {
          resource: 'timbrado',
          actions: ['write'],
          restrictions: { ownDataOnly: true }
        }
      ],
      'timbrado_only': [
        {
          resource: 'cartas_porte',
          actions: ['read'],
          restrictions: { ownDataOnly: true, fields: ['id', 'status', 'xml_generado'] }
        },
        {
          resource: 'timbrado',
          actions: ['write'],
          restrictions: { ownDataOnly: true }
        }
      ]
    };
  }
}

// Singleton instance
export const publicAPIController = new PublicAPIController();
