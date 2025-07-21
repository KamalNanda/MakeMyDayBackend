import { Logger } from "../../../utilities/logger.js"
import MasterPost from "../models/mst_post.js"
import TnsPostVsUser from "../models/tns_post_vs_users.js"

/**
 * @swagger
 * paths:
 *  /mmd/v1/posts/like-post:
 *    summary: API to like a post
 *    description: API to like a post by a user
 *    post:
 *      tags:
 *        - Posts
 *      summary: API to like a post
 *      description: API to like a post by a user
 *      operationId: likePost
 *      requestBody:
 *        description: Request Body
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              description: Like a post
 *              properties:
 *                post_id:
 *                  type: string
 *                  description: ID of the post to like
 *                user_id:
 *                  type: string
 *                  description: ID of the user liking the post
 *              required:
 *                - post_id
 *                - user_id
 *              example:
 *                post_id: "f6f19735-553c-4e2a-9c07-6c65df9bd47c"
 *                user_id: "user-123"
 *      responses:
 *        '200':
 *          description: OK
 *          content:
 *             application/json:
 *                schema:
 *                  type: object
 *                  description: Represents a success response
 *                  properties:
 *                    status:
 *                      type: boolean
 *                      description: Status
 *                    message:
 *                      type: string
 *                      description: message
 *                  example:
 *                    status: true
 *                    message: Post liked successfully
 *        '400':
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StandardErrorResponse'
 *              example:
 *                status: false
 *                message: 'Post already liked'
 *        '404':
 *          description: Not Found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StandardErrorResponse'
 *              example:
 *                status: false
 *                message: 'Post not found'
 *        '500':
 *          description: Internal Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StandardErrorResponse'
 *              example:
 *                status: false
 *                message: 'Failed to like post - error message'
 */
export const like_post_controller = async (req, res) => {
    const reqId = res.locals.uuid
    try {
        const { post_id, user_id } = req.body 

        const post = await MasterPost.findOne({
            where: {
                id: post_id
            }
        })
        if (!post) {
            return res.status(404).json({
                status: false,
                message: "Post not found"
            })
        }

        const post_vs_user = await TnsPostVsUser.findOne({
            where: {
                post_id: post_id,
                user_id: user_id
            }
        })

        if (post_vs_user) {
            return res.status(400).json({
                status: false,
                message: "Post already liked"
            })
        } 

        await TnsPostVsUser.create({
            post_id: post_id,
            user_id: user_id
        })

        return res.status(200).json({
            status: true,
            message: "Post liked successfully"
        })
            
    } catch (error) {
        Logger(reqId).error(`Error in like_post_controller - ${error.message}`)
        console.log(error)
        return res.status(500).json({
            status: false,
            message: `Failed to like post - ${error.message}`
        })
    }
}