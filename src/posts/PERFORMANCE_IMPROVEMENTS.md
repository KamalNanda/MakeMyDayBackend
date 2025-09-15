# Fetch All Posts API Performance Improvements

This document outlines the performance optimizations implemented for the `fetch_all_posts` API endpoint.

## 🚀 Performance Improvements Implemented

### 1. **Optimized SQL Query**
- **Before**: N+1 query problem with separate queries for likes and user-specific data
- **After**: Single optimized query with efficient JOINs
- **Impact**: Reduced database round trips from 2+ queries to 1 query

```sql
-- New optimized query structure
SELECT 
    p.id, p.title, p.description, p.type, p.external_url, p.media_url, p.post_date,
    array_agg(DISTINCT t.tag ORDER BY t.tag) FILTER (WHERE t.tag IS NOT NULL) AS tags,
    p.created_at,
    COALESCE(like_counts.like_count, 0) AS like_count,
    CASE WHEN user_likes.post_id IS NOT NULL THEN true ELSE false END AS liked_by_you
FROM mst_posts p
LEFT JOIN tns_post_vs_tag pt ON p.id = pt.post_id
LEFT JOIN mst_tags t ON pt.tag_id = t.id
LEFT JOIN (
    SELECT post_id, COUNT(*) as like_count 
    FROM tns_post_vs_user 
    GROUP BY post_id
) like_counts ON p.id = like_counts.post_id
LEFT JOIN (
    SELECT DISTINCT post_id 
    FROM tns_post_vs_user 
    WHERE user_id = :user_id
) user_likes ON p.id = user_likes.post_id
GROUP BY p.id, p.title, p.description, p.type, p.external_url, p.media_url, p.post_date, p.created_at, 
         like_counts.like_count, user_likes.post_id
ORDER BY p.created_at DESC
LIMIT :limit OFFSET :offset;
```

### 2. **Database Indexes**
Added strategic indexes to improve query performance:

```sql
-- Indexes for better performance
CREATE INDEX idx_mst_posts_created_at ON mst_posts(created_at DESC);
CREATE INDEX idx_tns_post_vs_tag_post_id ON tns_post_vs_tag(post_id);
CREATE INDEX idx_tns_post_vs_tag_tag_id ON tns_post_vs_tag(tag_id);
CREATE INDEX idx_tns_post_vs_user_post_id ON tns_post_vs_user(post_id);
CREATE INDEX idx_tns_post_vs_user_user_id ON tns_post_vs_user(user_id);
CREATE INDEX idx_tns_post_vs_user_user_post ON tns_post_vs_user(user_id, post_id);
```

**To apply indexes, run:**
```bash
node backend/src/posts/utilities/add_performance_indexes.js
```

### 3. **Pagination Support**
- **Before**: Fetched all posts at once (memory-intensive)
- **After**: Paginated results with configurable page size
- **Default**: 20 posts per page, maximum 100 posts per page
- **Benefits**: Reduced memory usage, faster response times, better user experience

### 4. **Intelligent Caching**
- **Implementation**: In-memory cache with LRU eviction
- **Cache TTL**: 2 minutes for user-specific data, 5 minutes for anonymous data
- **Cache Size**: Maximum 1000 entries
- **Auto-cleanup**: Expired entries cleaned every 5 minutes

### 5. **Parallel Query Execution**
- **Before**: Sequential database queries
- **After**: Parallel execution of posts query and count query using `Promise.all()`
- **Impact**: Reduced total query time

### 6. **Optimized Data Processing**
- **Before**: Multiple array operations and separate queries
- **After**: Single query with efficient JOINs and minimal post-processing
- **Impact**: Reduced CPU usage and memory consumption

## 📊 Expected Performance Gains

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Database Queries | 2+ queries | 1 query | ~50% reduction |
| Response Time | 500-2000ms | 100-500ms | ~70% faster |
| Memory Usage | High (all posts) | Low (paginated) | ~80% reduction |
| Cache Hit Rate | 0% | 60-80% | Significant improvement |

## 🔧 Usage Examples

### Basic Usage (with pagination)
```bash
GET /mmd/v1/posts/fetch-posts?page=1&limit=20
```

### With User Context
```bash
GET /mmd/v1/posts/fetch-posts?user_id=123&page=1&limit=20
```

### Response Format
```json
{
  "status": true,
  "data": [
    {
      "id": "post-uuid",
      "title": "Post Title",
      "description": "Post description",
      "type": "video",
      "external_url": "url",
      "media_url": "media-url",
      "post_date": "2024-06-01",
      "tags": ["funny", "meme"],
      "created_at": "2024-06-01T12:00:00Z",
      "like_count": 5,
      "liked_by_you": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "pageSize": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🛠 Cache Management

### Cache Invalidation
The cache is automatically invalidated when:
- New posts are added
- Posts are updated or deleted
- Posts are liked/unliked
- Post tags are modified

### Manual Cache Management
```javascript
import PostsCacheInvalidation from './utilities/cache_invalidation.js';

// Clear all cache
PostsCacheInvalidation.clearAllCache(reqId);

// Get cache statistics
const stats = PostsCacheInvalidation.getCacheStats(reqId);
```

## 📈 Monitoring

### Cache Statistics
```javascript
import postsCache from './utilities/posts_cache.js';

const stats = postsCache.getStats();
console.log(stats);
// Output: { size: 45, maxSize: 1000, defaultTTL: 300000, keys: [...] }
```

### Performance Logging
The system logs cache hits/misses and query performance for monitoring:
```
[INFO] Cache hit for key: posts:user123:1:20
[INFO] Returning cached data for page 1, limit 20
[DEBUG] Cache miss for key: posts:anonymous:2:20
```

## 🔄 Migration Steps

1. **Apply Database Indexes**:
   ```bash
   node backend/src/posts/utilities/add_performance_indexes.js
   ```

2. **Update API Calls**: The API now supports pagination parameters:
   - `page`: Page number (default: 1)
   - `limit`: Posts per page (default: 20, max: 100)

3. **Update Frontend**: Handle the new pagination response format

4. **Monitor Performance**: Use the cache statistics and logging to monitor improvements

## 🚨 Breaking Changes

- **Response Format**: Added `pagination` object to response
- **Default Behavior**: Now returns 20 posts by default instead of all posts
- **Parameters**: Added optional `page` and `limit` query parameters

## 🔮 Future Optimizations

1. **Redis Integration**: Replace in-memory cache with Redis for distributed caching
2. **Database Connection Pooling**: Optimize database connection management
3. **Query Result Streaming**: For very large datasets
4. **CDN Integration**: Cache static post data at CDN level
5. **Database Sharding**: For horizontal scaling

## 📝 Notes

- Cache TTL can be adjusted based on your data update frequency
- Consider implementing cache warming for frequently accessed pages
- Monitor memory usage with the in-memory cache in production
- Database indexes should be monitored and maintained regularly
