import postsCache from "./posts_cache.js";
import { Logger } from "../../../utilities/logger.js";

/**
 * Cache invalidation utilities for posts
 */
export class PostsCacheInvalidation {
    
    /**
     * Invalidate cache when a new post is added
     * @param {string} reqId - Request ID for logging
     */
    static onPostAdded(reqId) {
        Logger(reqId).info('Invalidating posts cache due to new post');
        postsCache.invalidateAll();
    }

    /**
     * Invalidate cache when a post is updated
     * @param {string} postId - Post ID that was updated
     * @param {string} reqId - Request ID for logging
     */
    static onPostUpdated(postId, reqId) {
        Logger(reqId).info(`Invalidating posts cache due to post update: ${postId}`);
        postsCache.invalidateAll();
    }

    /**
     * Invalidate cache when a post is deleted
     * @param {string} postId - Post ID that was deleted
     * @param {string} reqId - Request ID for logging
     */
    static onPostDeleted(postId, reqId) {
        Logger(reqId).info(`Invalidating posts cache due to post deletion: ${postId}`);
        postsCache.invalidateAll();
    }

    /**
     * Invalidate cache when a post is liked/unliked
     * @param {string} postId - Post ID that was liked/unliked
     * @param {string} userId - User ID who performed the action
     * @param {string} reqId - Request ID for logging
     */
    static onPostLiked(postId, userId, reqId) {
        Logger(reqId).info(`Invalidating posts cache due to like action on post: ${postId} by user: ${userId}`);
        // Invalidate all cache since like counts affect all users
        postsCache.invalidateAll();
    }

    /**
     * Invalidate cache when tags are updated for a post
     * @param {string} postId - Post ID that had tags updated
     * @param {string} reqId - Request ID for logging
     */
    static onPostTagsUpdated(postId, reqId) {
        Logger(reqId).info(`Invalidating posts cache due to tag update on post: ${postId}`);
        postsCache.invalidateAll();
    }

    /**
     * Get cache statistics for monitoring
     * @param {string} reqId - Request ID for logging
     * @returns {Object} Cache statistics
     */
    static getCacheStats(reqId) {
        const stats = postsCache.getStats();
        Logger(reqId).info('Retrieved cache statistics', stats);
        return stats;
    }

    /**
     * Manually clear all cache (useful for maintenance)
     * @param {string} reqId - Request ID for logging
     */
    static clearAllCache(reqId) {
        Logger(reqId).info('Manually clearing all posts cache');
        postsCache.invalidateAll();
    }
}

export default PostsCacheInvalidation;
