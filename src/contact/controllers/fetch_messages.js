import Contacts from "../models/contact_model.js"

export const fetch_messages = async (req, res) => {
    const reqId = res.locals.uuid
    try{
        const contacts = await Contacts.findAll({});
        return res.status(200).json({status:true, data: contacts})
    } catch (error){
        Logger(reqId).error(`Error in fetch_messages - ${error.message}`)
        console.log(error)
        return res.status(500)
    }
}
/**
 * @swagger
 * paths:
 *  /mmd/v1/messages/fetch-messages:
 *    summary: API to fetch all messages
 *    description: API to fetch all messages
 *    get:
 *      tags:
 *        - Messages
 *      summary: API to fetch all messages
 *      description: API to fetch all messages
 *      operationId: fetchmessages 
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
