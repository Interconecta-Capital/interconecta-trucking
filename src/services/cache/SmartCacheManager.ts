export interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
  tags: string[];
  size: number;
}

export interface CacheMetrics {
  totalItems: number;
  memoryUsage: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  totalRequests: number;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  predictive?: boolean;
}

export class SmartCacheManager {
  private memoryCache = new Map<string, CacheItem>();
  private maxMemoryItems = 1000;
  private maxMemorySize = 50 * 1024 * 1024; // 50MB
  private metrics: CacheMetrics = {
    totalItems: 0,
    memoryUsage: 0,
    hitRate: 0,
    missRate: 0,
    evictions: 0,
    totalRequests: 0
  };
  private accessPatterns = new Map<string, number[]>();
  private predictiveCache = new Map<string, Set<string>>();

  async get<T>(key: string, fetchFunction?: () => Promise<T>, options?: CacheOptions): Promise<T | null> {
    this.metrics.totalRequests++;
    this.recordAccess(key);

    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && !this.isExpired(memoryItem)) {
      memoryItem.hits++;
      memoryItem.lastAccessed = Date.now();
      this.metrics.hitRate = (this.metrics.hitRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests;
      
      // Trigger predictive loading
      if (options?.predictive !== false) {
        this.triggerPredictiveLoading(key);
      }
      
      return memoryItem.value as T;
    }

    // Check Supabase cache for persistent items
    try {
      const supabaseItem = await this.getFromSupabaseCache(key);
      if (supabaseItem && !this.isExpired(supabaseItem)) {
        // Promote to memory cache
        this.setInMemory(key, supabaseItem.value, { ttl: supabaseItem.ttl, tags: supabaseItem.tags });
        this.metrics.hitRate = (this.metrics.hitRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests;
        return supabaseItem.value as T;
      }
    } catch (error) {
      console.warn('Supabase cache error:', error);
    }

    // Cache miss - fetch if function provided
    if (fetchFunction) {
      try {
        const value = await fetchFunction();
        await this.set(key, value, options);
        this.updateMissRate();
        return value;
      } catch (error) {
        this.updateMissRate();
        throw error;
      }
    }

    this.updateMissRate();
    return null;
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const ttl = options.ttl || 3600000; // 1 hour default
    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      lastAccessed: Date.now(),
      tags: options.tags || [],
      size: this.estimateSize(value)
    };

    // Set in memory cache
    this.setInMemory(key, value, options);

    // Set in Supabase for persistence (only for important items)
    if (options.priority === 'high' || options.tags?.includes('persistent')) {
      try {
        await this.setInSupabaseCache(item);
      } catch (error) {
        console.warn('Failed to persist to Supabase cache:', error);
      }
    }
  }

  private setInMemory<T>(key: string, value: T, options: CacheOptions): void {
    const ttl = options.ttl || 3600000;
    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      lastAccessed: Date.now(),
      tags: options.tags || [],
      size: this.estimateSize(value)
    };

    // Check if we need to evict items
    this.evictIfNeeded(item.size);

    this.memoryCache.set(key, item);
    this.metrics.totalItems = this.memoryCache.size;
    this.metrics.memoryUsage += item.size;
  }

  async invalidate(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await this.deleteFromSupabaseCache(key);
    } catch (error) {
      console.warn('Failed to invalidate Supabase cache:', error);
    }
    this.updateMetrics();
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keysToDelete: string[] = [];
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.tags.includes(tag)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.invalidate(key);
    }
  }

  private async getFromSupabaseCache(key: string): Promise<CacheItem | null> {
    // This would integrate with a Supabase table for persistent cache
    // For now, return null as we don't have the table set up
    return null;
  }

  private async setInSupabaseCache(item: CacheItem): Promise<void> {
    // This would save to a Supabase table for persistent cache
    // Implementation would depend on having a cache table
  }

  private async deleteFromSupabaseCache(key: string): Promise<void> {
    // This would delete from Supabase cache table
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private evictIfNeeded(newItemSize: number): void {
    // Check memory limits
    while (
      this.memoryCache.size >= this.maxMemoryItems ||
      this.metrics.memoryUsage + newItemSize > this.maxMemorySize
    ) {
      this.evictLeastRecentlyUsed();
    }
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const item = this.memoryCache.get(oldestKey);
      if (item) {
        this.metrics.memoryUsage -= item.size;
        this.metrics.evictions++;
      }
      this.memoryCache.delete(oldestKey);
    }
  }

  private recordAccess(key: string): void {
    const now = Date.now();
    if (!this.accessPatterns.has(key)) {
      this.accessPatterns.set(key, []);
    }
    
    const pattern = this.accessPatterns.get(key)!;
    pattern.push(now);
    
    // Keep only last 10 accesses for pattern analysis
    if (pattern.length > 10) {
      pattern.shift();
    }
  }

  private triggerPredictiveLoading(key: string): void {
    const related = this.predictiveCache.get(key);
    if (related) {
      related.forEach(relatedKey => {
        // Load related items in background if not already cached
        if (!this.memoryCache.has(relatedKey)) {
          this.backgroundLoad(relatedKey);
        }
      });
    }
  }

  private async backgroundLoad(key: string): Promise<void> {
    // This would implement background loading of predictively needed items
    // Based on usage patterns and relationships
  }

  addPredictiveRelation(key: string, relatedKeys: string[]): void {
    if (!this.predictiveCache.has(key)) {
      this.predictiveCache.set(key, new Set());
    }
    const relations = this.predictiveCache.get(key)!;
    relatedKeys.forEach(related => relations.add(related));
  }

  private estimateSize(value: any): number {
    return JSON.stringify(value).length * 2; // Rough estimate
  }

  private updateMissRate(): void {
    this.metrics.missRate = (this.metrics.missRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests;
  }

  private updateMetrics(): void {
    this.metrics.totalItems = this.memoryCache.size;
    let totalSize = 0;
    for (const item of this.memoryCache.values()) {
      totalSize += item.size;
    }
    this.metrics.memoryUsage = totalSize;
  }

  getMetrics(): CacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  // Specialized cache methods for common use cases
  async cacheCodigoPostal(cp: string, data: any): Promise<void> {
    await this.set(`cp:${cp}`, data, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      tags: ['codigos_postales', 'persistent'],
      priority: 'high'
    });
  }

  async getCachedCodigoPostal(cp: string): Promise<any> {
    return this.get(`cp:${cp}`);
  }

  async cacheClienteSearch(query: string, results: any[]): Promise<void> {
    await this.set(`cliente_search:${query.toLowerCase()}`, results, {
      ttl: 10 * 60 * 1000, // 10 minutes
      tags: ['cliente_search'],
      priority: 'medium'
    });

    // Add predictive relations for similar searches
    const relatedQueries = this.generateSimilarQueries(query);
    this.addPredictiveRelation(`cliente_search:${query.toLowerCase()}`, 
      relatedQueries.map(q => `cliente_search:${q}`));
  }

  private generateSimilarQueries(query: string): string[] {
    const similar: string[] = [];
    
    // Add partial matches
    if (query.length > 3) {
      similar.push(query.substring(0, query.length - 1));
      similar.push(query.substring(1));
    }
    
    // Add with common prefixes/suffixes
    similar.push(`${query} sa`);
    similar.push(`${query} de`);
    
    return similar;
  }

  async getCachedClienteSearch(query: string): Promise<any[]> {
    return this.get(`cliente_search:${query.toLowerCase()}`);
  }

  async cacheCatalogo(tipo: string, data: any[]): Promise<void> {
    await this.set(`catalogo:${tipo}`, data, {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      tags: ['catalogos', 'persistent'],
      priority: 'high'
    });
  }

  async getCachedCatalogo(tipo: string): Promise<any[]> {
    return this.get(`catalogo:${tipo}`);
  }

  async invalidateClienteCaches(): Promise<void> {
    await this.invalidateByTag('cliente_search');
  }

  async invalidateCatalogos(): Promise<void> {
    await this.invalidateByTag('catalogos');
  }

  clear(): void {
    this.memoryCache.clear();
    this.accessPatterns.clear();
    this.predictiveCache.clear();
    this.metrics = {
      totalItems: 0,
      memoryUsage: 0,
      hitRate: 0,
      missRate: 0,
      evictions: 0,
      totalRequests: 0
    };
  }
}

// Singleton instance
export const smartCacheManager = new SmartCacheManager();
