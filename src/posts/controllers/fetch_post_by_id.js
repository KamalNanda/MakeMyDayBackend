import db from "../../../utilities/db/db.js"
import { Logger } from "../../../utilities/logger.js"
import postsCache from "../utilities/posts_cache.js"

export const fetch_post_by_id = async (req, res) => {
    const reqId = res.locals.uuid
    const user_id = req.query.user_id;
    const post_id = req.query.id;
    
    if (!post_id) {
        return res.status(400).json({
            status: false,
            message: "Post ID is required"
        });
    }

    try {
        // Check cache first
        const cacheKey = `post:${post_id}:${user_id || 'anonymous'}`;
        const cachedData = postsCache.get(cacheKey);
        
        if (cachedData) {
            Logger(reqId).info(`Returning cached post data for post: ${post_id}`);
            return res.status(200).json(cachedData);
        }

        // Optimized query with single JOIN for user likes
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
            WHERE 
                p.id = :post_id
            GROUP BY 
                p.id, p.title, p.description, p.type, p.external_url, p.media_url, p.post_date, p.created_at, 
                like_counts.like_count, user_likes.post_id
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
            WHERE 
                p.id = :post_id
            GROUP BY 
                p.id, p.title, p.description, p.type, p.external_url, p.media_url, p.post_date, p.created_at, 
                like_counts.like_count
        `;

        const queryReplacements = user_id 
            ? { replacements: { user_id, post_id } }
            : { replacements: { post_id } };

        const [results] = await db.query(_query, queryReplacements);
        const post = results[0];

        if (!post) {
            return res.status(404).json({
                status: false,
                message: "Post not found"
            });
        }

        const responseData = {
            status: true,
            data: post
        };

        // Cache the response (shorter TTL for user-specific data)
        const cacheTTL = user_id ? 2 * 60 * 1000 : 5 * 60 * 1000; // 2 min for user data, 5 min for anonymous
        postsCache.set(cacheKey, responseData, cacheTTL);

        return res.status(200).json(responseData);
    } catch (error) {
        Logger(reqId).error(`Error in fetch_post_by_id - ${error.message}`)
        console.log(error)
        return res.status(500).json({
            status: false,
            message: `Failed to fetch post - ${error.message}`
        })
    }
}

/**
 * @swagger
 * paths:
 *  /mmd/v1/posts/fetch-post:
 *    summary: API to fetch a post by id
 *    description: API to fetch a post by id
 *    get:
 *      tags:
 *        - Posts
 *      summary: API to fetch a post by id
 *      description: API to fetch a post by id
 *      operationId: fetchPostById 
 *      parameters:
 *         - name: id
 *           in: query
 *           required: true
 *           schema:
 *             type: string
 *         - name: user_id
 *           in: query
 *           required: false
 *           schema:
 *             type: string
 *      responses:
 *        '200':
 *          description: OK
 *          content:
 *             application/json:
 *                schema:
 *                  type: object
 *                  description: Represents a post response
 *                  properties:
 *                    status:
 *                      type: string
 *                      description: Status
 *                    data:
 *                      type: object
 *                      description: Post Data
 *                      properties:
 *                        id:
 *                          type: string
 *                        title:
 *                          type: string
 *                        description:
 *                          type: string
 *                        type:
 *                          type: string
 *                        external_url:
 *                          type: string
 *                        media_url:
 *                          type: string
 *                        post_date:
 *                          type: string
 *                        tags:
 *                          type: array
 *                          items:
 *                            type: string
 *                        created_at:
 *                          type: string
 *                        like_count:
 *                          type: integer
 *                          description: Number of likes on the post
 *                        liked_by_you:
 *                          type: boolean
 *                          description: Whether the post is liked by the user (if user_id is provided)
 *                  example:
 *                    status: true
 *                    data:
 *                      id: "post-uuid"
 *                      title: "Post Title"
 *                      description: "Post description"
 *                      type: "video"
 *                      external_url: "url"
 *                      media_url: "media-url"
 *                      post_date: "2024-06-01"
 *                      tags: ["funny", "meme"]
 *                      created_at: "2024-06-01T12:00:00Z"
 *                      like_count: 5
 *                      liked_by_you: true
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
