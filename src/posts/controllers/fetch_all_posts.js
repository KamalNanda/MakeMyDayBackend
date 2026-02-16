import db from "../../../utilities/db/db.js"
import { Logger } from "../../../utilities/logger.js"
import postsCache from "../utilities/posts_cache.js"

export const fetch_all_posts = async (req, res) => {
    const reqId = res.locals.uuid
    const user_id = req.query.user_id;
    
    // Add pagination support with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Default to 20 posts per page, max 100
    const offset = (page - 1) * limit;
    
    try {
        // Check cache first
        const cacheKey = postsCache.generateKey(user_id, page, limit);
        const cachedData = postsCache.get(cacheKey);
        
        if (cachedData) {
            Logger(reqId).info(`Returning cached data for page ${page}, limit ${limit}`);
            return res.status(200).json(cachedData);
        }

        // Optimized query with single JOIN for user likes and pagination
        const _query = user_id ? `
           SELECT 
                p.id, 
                p.title, 
                p.description, 
                p.type,
                p.external_url,
                p.media_url, 
                p.post_date,
                array_agg(DISTINCT t.tag ORDER BY t.tag) FILTER (WHERE t.tag IS NOT NULL) AS tags,
                p.created_at,
                COALESCE(like_counts.like_count, 0) AS like_count,
                user_likes.post_id IS NOT NULL AS liked_by_you
            FROM 
                mst_posts p
            LEFT JOIN 
                tns_post_vs_tag pt ON p.id = pt.post_id
            LEFT JOIN 
                mst_tags t ON pt.tag_id = t.id
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
            GROUP BY 
                p.id, p.title, p.description, p.type, p.external_url, p.media_url, p.post_date, p.created_at, 
                like_counts.like_count, user_likes.post_id
            ORDER BY 
                p.created_at DESC
            LIMIT :limit OFFSET :offset;
        ` : `
           SELECT 
                p.id, 
                p.title, 
                p.description, 
                p.type,
                p.external_url,
                p.media_url, 
                p.post_date,
                array_agg(DISTINCT t.tag ORDER BY t.tag) FILTER (WHERE t.tag IS NOT NULL) AS tags,
                p.created_at,
                COALESCE(like_counts.like_count, 0) AS like_count,
                false AS liked_by_you
            FROM 
                mst_posts p
            LEFT JOIN 
                tns_post_vs_tag pt ON p.id = pt.post_id
            LEFT JOIN 
                mst_tags t ON pt.tag_id = t.id
            LEFT JOIN (
                SELECT post_id, COUNT(*) as like_count 
                FROM tns_post_vs_user 
                GROUP BY post_id
            ) like_counts ON p.id = like_counts.post_id
            GROUP BY 
                p.id, p.title, p.description, p.type, p.external_url, p.media_url, p.post_date, p.created_at, 
                like_counts.like_count
            ORDER BY 
                p.created_at DESC
            LIMIT :limit OFFSET :offset;
        `;

        // Get total count for pagination metadata
        const countQuery = `SELECT COUNT(DISTINCT p.id) AS total FROM mst_posts p;`;

        let _posts, totalCount;
        
        // Execute both queries in parallel for better performance
        const queryReplacements = user_id 
            ? { replacements: { user_id, limit, offset } }
            : { replacements: { limit, offset } };
            
        const [postsResult, countResult] = await Promise.all([
            db.query(_query, queryReplacements),
            db.query(countQuery)
        ]);

        _posts = postsResult[0];
        totalCount = countResult[0][0].total;

        const responseData = {
            status: true,
            data: _posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                pageSize: limit,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            }
        };

        // Cache the response (shorter TTL for user-specific data)
        const cacheTTL = user_id ? 2 * 60 * 1000 : 5 * 60 * 1000; // 2 min for user data, 5 min for anonymous
        postsCache.set(cacheKey, responseData, cacheTTL);

        return res.status(200).json(responseData)
    } catch (error) {
        Logger(reqId).error(`Error in fetch_all_posts - ${error.message}`)
        console.log(error)
        return res.status(500).json({
            status: false,
            message: `Failed to fetch posts - ${error.message}`
        })
    }
}

/**
 * @swagger
 * paths:
 *  /mmd/v1/posts/fetch-posts:
 *    summary: API to fetch all posts
 *    description: API to fetch all posts
 *    get:
 *      tags:
 *        - Posts
 *      summary: API to fetch all posts
 *      description: API to fetch all posts
 *      operationId: fetchPosts 
 *      parameters:
 *         - name: user_id
 *           in: query
 *           required: false
 *           schema:
 *             type: string
 *         - name: page
 *           in: query
 *           required: false
 *           example: 1
 *           schema:
 *             type: integer
 *             description: Page number for pagination (default: 1)
 *         - name: limit
 *           in: query
 *           required: false
 *           example: 20
 *           schema:
 *             type: integer
 *             description: Number of posts per page (default: 20, max: 100)
 *      responses:
 *        '200':
 *          description: OK
 *          content:
 *             application/json:
 *                schema:
 *                  type: object
 *                  description: Represents a robot config response
 *                  properties:
 *                    status:
 *                      type: string
 *                      description: Status
 *                    data:
 *                      type: array
 *                      description: Array of posts
 *                      items:
 *                        type: object
 *                        properties:
 *                          id:
 *                            type: string
 *                          title:
 *                            type: string
 *                          description:
 *                            type: string
 *                          type:
 *                            type: string
 *                          external_url:
 *                            type: string
 *                          media_url:
 *                            type: string
 *                          post_date:
 *                            type: string
 *                          tags:
 *                            type: array
 *                            items:
 *                              type: string
 *                          created_at:
 *                            type: string
 *                          like_count:
 *                            type: integer
 *                            description: Number of likes on the post
 *                          liked_by_you:
 *                            type: boolean
 *                            description: Whether the post is liked by the user (if user_id is provided)
 *                    pagination:
 *                      type: object
 *                      description: Pagination information
 *                      properties:
 *                        currentPage:
 *                          type: integer
 *                          description: Current page number
 *                        totalPages:
 *                          type: integer
 *                          description: Total number of pages
 *                        totalItems:
 *                          type: integer
 *                          description: Total number of posts
 *                        pageSize:
 *                          type: integer
 *                          description: Number of posts per page
 *                        hasNextPage:
 *                          type: boolean
 *                          description: Whether there is a next page
 *                        hasPrevPage:
 *                          type: boolean
 *                          description: Whether there is a previous page
 *                  example:
 *                    status: true
 *                    data:
 *                      - id: "post-uuid"
 *                        title: "Post Title"
 *                        description: "Post description"
 *                        type: "video"
 *                        external_url: "url"
 *                        media_url: "media-url"
 *                        post_date: "2024-06-01"
 *                        tags: ["funny", "meme"]
 *                        created_at: "2024-06-01T12:00:00Z"
 *                        like_count: 5
 *                        liked_by_you: true
 *                    pagination:
 *                      currentPage: 1
 *                      totalPages: 5
 *                      totalItems: 100
 *                      pageSize: 20
 *                      hasNextPage: true
 *                      hasPrevPage: false
 *        '500':
 *          description: Internal Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StandardErrorResponse'
 *              example:
 *                status: false
 *                message: 'Something went wrong'
 */
