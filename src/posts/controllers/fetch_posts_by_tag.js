import db from "../../../utilities/db/db.js"
import { Logger } from "../../../utilities/logger.js"

export const fetch_posts_by_tag = async (req, res) => {
    const reqId = res.locals.uuid
    const tag_id = req.query.tag_id
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
                p.created_at,
                array_agg(t.tag ORDER BY t.tag) FILTER (WHERE t.tag IS NOT NULL) AS tags
            FROM 
                mst_posts p
            JOIN 
                tns_post_vs_tag pt ON p.id = pt.post_id
            JOIN 
                mst_tags t ON pt.tag_id = t.id
            WHERE 
                pt.tag_id = '${tag_id}'
            GROUP BY 
                p.id
            ORDER BY 
                p.created_at DESC;  
        `
        let _posts
        await db
            .query(_query)
            .then(([results, metadata]) => {
                _posts = results;
            });

        return res.status(200).json({
            status: true,
            data: _posts
        })
    } catch (error) {
        Logger(reqId).error(`Error in fetch_posts_by_tag - ${error.message}`)
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
 *  /mmd/v1/posts/fetch-posts-by-tag:
 *    summary: API to fetch all posts by tag
 *    description: API to fetch all posts by tag
 *    get:
 *      tags:
 *        - Posts
 *      summary: API to fetch all posts by tag
 *      description: API to fetch all posts by tag
 *      operationId: fetchPostsByTag
 *      parameters:
 *         - name: tag_id
 *           in: query
 *           required: false
 *           example: 'de3f25a0-f594-11ef-a6ae-a1ce8caff7b1'
 *           schema:
 *             type: string  
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
