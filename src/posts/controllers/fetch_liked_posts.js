import db from "../../../utilities/db/db.js";
import { Logger } from "../../../utilities/logger.js";

/**
 * @swagger
 * paths:
 *  /mmd/v1/posts/fetch-liked-posts:
 *    summary: API to fetch all posts liked by a user
 *    description: API to fetch all posts liked by a user
 *    get:
 *      tags:
 *        - Posts
 *      summary: API to fetch all posts liked by a user
 *      description: API to fetch all posts liked by a user
 *      operationId: fetchLikedPosts
 *      parameters:
 *        - in: query
 *          name: user_id
 *          schema:
 *            type: string
 *          required: true
 *          description: ID of the user whose liked posts are to be fetched
 *      responses:
 *        '200':
 *          description: OK
 *          content:
 *             application/json:
 *                schema:
 *                  type: object
 *                  description: Represents a liked posts response
 *                  properties:
 *                    status:
 *                      type: boolean
 *                      description: Status
 *                    data:
 *                      type: array
 *                      description: Array of liked posts
 *                  example:
 *                    status: true
 *                    data: []
 *        '400':
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StandardErrorResponse'
 *              example:
 *                status: false
 *                message: 'user_id is required'
 *        '500':
 *          description: Internal Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StandardErrorResponse'
 *              example:
 *                status: false
 *                message: 'Failed to fetch liked posts - error message'
 */

export const fetch_liked_posts = async (req, res) => {
    const reqId = res.locals.uuid;
    const user_id = req.query.user_id;
    if (!user_id) {
        return res.status(400).json({
            status: false,
            message: "user_id is required"
        });
    }
    try {
        const _query = `
            SELECT 
                p.id, 
                p.title, 
                p.description, 
                p.type,
                p.external_url,
                p.media_url, 
                p.post_date,
                array_agg(t.tag ORDER BY t.tag) FILTER (WHERE t.tag IS NOT NULL) AS tags,
                p.created_at
            FROM 
                mst_posts p
            JOIN 
                tns_post_vs_user pu ON p.id = pu.post_id
            LEFT JOIN 
                tns_post_vs_tag pt ON p.id = pt.post_id
            LEFT JOIN 
                mst_tags t ON pt.tag_id = t.id
            WHERE 
                pu.user_id = :user_id
            GROUP BY 
                p.id, p.title, p.description, p.type, p.external_url, p.media_url, p.post_date, p.created_at
            ORDER BY 
                p.created_at DESC;
        `;
        let liked_posts;
        await db.query(_query, { replacements: { user_id } }).then(([results]) => {
            liked_posts = results;
        });
        return res.status(200).json({
            status: true,
            data: liked_posts
        });
    } catch (error) {
        Logger(reqId).error(`Error in fetch_liked_posts - ${error.message}`);
        console.log(error);
        return res.status(500).json({
            status: false,
            message: `Failed to fetch liked posts - ${error.message}`
        });
    }
};
