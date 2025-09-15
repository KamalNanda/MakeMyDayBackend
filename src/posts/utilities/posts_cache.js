import { Logger } from "../../../utilities/logger.js";

/**
 * Simple in-memory cache for posts data
 * In production, consider using Redis or another distributed cache
 */
class PostsCache {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.maxCacheSize = 1000; // Maximum number of cached entries
    }

    /**
     * Generate cache key for posts query
     * @param {string} user_id - User ID (optional)
     * @param {number} page - Page number
     * @param {number} limit - Page size
     * @returns {string} Cache key
     */
    generateKey(user_id, page, limit) {
        return `posts:${user_id || 'anonymous'}:${page}:${limit}`;
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {Object|null} Cached data or null if not found/expired
     */
    get(key) {
        const reqId = 'cache-get-' + Date.now();
        
        if (!this.cache.has(key)) {
            Logger(reqId).debug(`Cache miss for key: ${key}`);
            return null;
        }

        const expiry = this.cacheExpiry.get(key);
        if (expiry && Date.now() > expiry) {
            Logger(reqId).debug(`Cache expired for key: ${key}`);
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            return null;
        }

        Logger(reqId).debug(`Cache hit for key: ${key}`);
        return this.cache.get(key);
    }

    /**
     * Set cached data
     * @param {string} key - Cache key
     * @param {Object} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds (optional)
     */
    set(key, data, ttl = this.defaultTTL) {
        const reqId = 'cache-set-' + Date.now();
        
        // Implement LRU eviction if cache is full
        if (this.cache.size >= this.maxCacheSize) {
            this.evictOldest();
        }

        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + ttl);
        
        Logger(reqId).debug(`Cached data for key: ${key}, TTL: ${ttl}ms`);
    }

    /**
     * Evict oldest cache entry (simple LRU implementation)
     */
    evictOldest() {
        const oldestKey = this.cache.keys().next().value;
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.cacheExpiry.delete(oldestKey);
            Logger('cache-evict').debug(`Evicted oldest cache entry: ${oldestKey}`);
        }
    }

    /**
     * Invalidate cache entries for a specific user
     * @param {string} user_id - User ID
     */
    invalidateUserCache(user_id) {
        const reqId = 'cache-invalidate-' + Date.now();
        let invalidatedCount = 0;
        
        for (const key of this.cache.keys()) {
            if (key.includes(`:${user_id}:`)) {
                this.cache.delete(key);
                this.cacheExpiry.delete(key);
                invalidatedCount++;
            }
        }
        
        Logger(reqId).info(`Invalidated ${invalidatedCount} cache entries for user: ${user_id}`);
    }

    /**
     * Invalidate all cache entries (useful when posts are updated)
     */
    invalidateAll() {
        const reqId = 'cache-invalidate-all-' + Date.now();
        const size = this.cache.size;
        
        this.cache.clear();
        this.cacheExpiry.clear();
        
        Logger(reqId).info(`Invalidated all cache entries (${size} entries cleared)`);
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            defaultTTL: this.defaultTTL,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Clear expired entries
     */
    cleanup() {
        const reqId = 'cache-cleanup-' + Date.now();
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, expiry] of this.cacheExpiry.entries()) {
            if (now > expiry) {
                this.cache.delete(key);
                this.cacheExpiry.delete(key);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            Logger(reqId).info(`Cleaned up ${cleanedCount} expired cache entries`);
        }
    }
}

// Create singleton instance
const postsCache = new PostsCache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
    postsCache.cleanup();
}, 5 * 60 * 1000);

export default postsCache;
