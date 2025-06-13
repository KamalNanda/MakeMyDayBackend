import db from "../../../utilities/db/db.js"
import { Logger } from "../../../utilities/logger.js"

export const fetch_post_by_id = async (req, res) => {
    const reqId = res.locals.uuid
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
            LEFT JOIN 
                tns_post_vs_tag pt ON p.id = pt.post_id
            LEFT JOIN 
                mst_tags t ON pt.tag_id = t.id
            WHERE 
                p.id = '${req.query.id}'
            GROUP BY 
                p.id, p.title, p.description, p.type, p.external_url, p.media_url, p.post_date, p.created_at;
        `
        let _posts
        await db
            .query(_query)
            .then(([results, metadata]) => {
                _posts = results;
            });

        return res.status(200).json({
            status: true,
            data: _posts[0]
        })
    } catch (error) {
        Logger(reqId).error(`Error in fetch_post_by_id - ${error.message}`)
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
 *  /mmd/v1/posts/fetch-post:
 *    summary: API to fetch all posts
 *    description: API to fetch all posts
 *    get:
 *      tags:
 *        - Posts
 *      summary: API to fetch all posts
 *      description: API to fetch all posts
 *      operationId: fetchPosts 
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
