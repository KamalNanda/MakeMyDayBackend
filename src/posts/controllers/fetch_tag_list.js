import { Logger } from "../../../utilities/logger.js"
import MasterTag from "../models/mst_tags.js"


export const fetch_tag_list = async (req, res) => {
    const reqId = res.locals.uuid
    try {
        const _tags = await MasterTag.findAll({
            attributes: ['id', 'tag']
        })
        return res.status(200).json({
            status: true,
            data: _tags
        })
    } catch (error) {
        Logger(reqId).error(`Error in fetch_tag_list - ${error.message}`)
        console.log(error)
        return res.status(500).json({
            status: false,
            message: `Failed to fetch tags - ${error.message}`
        })
    }
}
/**
 * @swagger
 * paths:
 *  /mmd/v1/posts/fetch-tags:
 *    summary: API to fetch all Tags
 *    description: API to fetch all Tags
 *    get:
 *      tags:
 *        - Posts
 *      summary: API to fetch all Tags
 *      description: API to fetch all Tags
 *      operationId: fetchTags 
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
