import db from "../../../utilities/db/db.js";
import { Logger } from "../../../utilities/logger.js";

export const fetch_all_posts_by_pagination = async (req, res) => {
    const reqId = res.locals.uuid;
    
    // Extract page and limit from query parameters, set defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const _query = `
            SELECT 
                p.id, 
                p.title, 
                p.description, 
                p.type,
                p.external_url,
                p.media_url, 
                array_agg(t.tag ORDER BY t.tag) FILTER (WHERE t.tag IS NOT NULL) AS tags,
                p.created_at
            FROM 
                mst_posts p
            LEFT JOIN 
                tns_post_vs_tag pt ON p.id = pt.post_id
            LEFT JOIN 
                mst_tags t ON pt.tag_id = t.id
            GROUP BY 
                p.id, p.title, p.description, p.type, p.external_url, p.media_url, p.created_at
            ORDER BY 
                p.created_at DESC
            LIMIT :limit OFFSET :offset;
        `;

        const countQuery = `SELECT COUNT(*) AS total FROM mst_posts;`; // Get total count for frontend pagination

        let _posts, totalCount;
        
        await db.query(_query, { replacements: { limit, offset } }).then(([results]) => {
            _posts = results;
        });

        await db.query(countQuery).then(([results]) => {
            totalCount = results[0].total;
        });

        return res.status(200).json({
            status: true,
            data: _posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                pageSize: limit,
            },
        });

    } catch (error) {
        Logger(reqId).error(`Error in fetch_all_posts - ${error.message}`);
        console.log(error);
        return res.status(500).json({
            status: false,
            message: `Failed to fetch posts - ${error.message}`,
        });
    }
};

/**
 * @swagger
 * paths:
 *  /mmd/v1/posts/fetch-posts-by-pagination:
 *    summary: API to fetch all posts
 *    description: API to fetch all posts
 *    get:
 *      tags:
 *        - Posts
 *      summary: API to fetch all posts
 *      description: API to fetch all posts
 *      operationId: fetchPostsByP
 *      parameters:
 *         - name: page
 *           in: query
 *           required: false
 *           example: 1
 *           schema:
 *             type: integer  
 *         - name: limit
 *           in: query
 *           required: false
 *           example: 5
 *           schema:
 *             type: integer  
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
 *                      type: object
 *                      description: Response Data
 *                  example:
 *                    status: true
 *                    data : []
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
