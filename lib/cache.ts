/**
 * Simple in-memory cache for reducing database queries
 * This helps reduce latency for frequently accessed data
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

class MemoryCache {
	private cache: Map<string, CacheEntry<any>>;
	private readonly defaultTTL: number;

	constructor(defaultTTL: number = 60000) {
		// Default TTL: 60 seconds
		this.cache = new Map();
		this.defaultTTL = defaultTTL;
	}

	get<T>(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		// Check if cache entry is still valid
		const now = Date.now();
		if (now - entry.timestamp > this.defaultTTL) {
			this.cache.delete(key);
			return null;
		}

		return entry.data as T;
	}

	set<T>(key: string, data: T, ttl?: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
		});

		// Auto-cleanup after TTL
		const cleanupTTL = ttl || this.defaultTTL;
		setTimeout(() => {
			this.cache.delete(key);
		}, cleanupTTL);
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	// Helper to create cache keys
	static createKey(...parts: (string | number | undefined)[]): string {
		return parts.filter((p) => p !== undefined).join(':');
	}
}

// Export singleton instance
export const cache = new MemoryCache(60000); // 60 second default TTL

// Export specialized caches for different use cases
export const roundTypesCache = new MemoryCache(300000); // 5 minutes for round types (rarely change)
export const userProfileCache = new MemoryCache(120000); // 2 minutes for user profiles
export const statsCache = new MemoryCache(180000); // 3 minutes for statistics

