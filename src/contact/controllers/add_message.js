import { Logger } from "../../../utilities/logger.js";
import Contacts from "../models/contact_model.js"

export const add_message = async (req, res) => {
    const reqId = res.locals.uuid
    try{
        await Contacts.create(req.body);
        return res.status(200).json({status:true})
    } catch (error){
        Logger(reqId).error(`Error in add_message - ${error.message}`)
        console.log(error)
        return res.status(500).json({status:true})
    }
}

/**
 * @swagger
 * /mmd/v1/messages/add-message:
 *   post:
 *     operationId: addMessage
 *     summary: Submit a contact message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *             example:
 *               name: Jane Doe
 *               email: jane@example.com
 *               message: I would like to get in touch.
 *     responses:
 *       '200':
 *         description: Message accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *       '500':
 *         description: Failed to save the message
 */