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
                p.created_at,
                (SELECT COUNT(*) FROM tns_post_vs_user pu WHERE pu.post_id = p.id) AS like_count
            FROM 
                mst_posts p
            LEFT JOIN 
                tns_post_vs_tag pt ON p.id = pt.post_id
            LEFT JOIN 
                mst_tags t ON pt.tag_id = t.id
            WHERE 
                p.id = '${req.query.id}'
            GROUP BY 
                p.id, p.title, p.description, p.type, p.external_url, p.media_url, p.post_date, p.created_at
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
