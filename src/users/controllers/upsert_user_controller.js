import { Logger } from "../../../utilities/logger.js";
import MasterUser from "../models/mst_user.js";

export const upsert_user_controller = async (req, res) => {
    const reqId = res.locals.uuid
    const payload = req.body;
    try{
        let operation = ''
        Logger(reqId).info(`Request recieved in upsert_user_controller with payload - ${JSON.stringify(payload)}`);
        let user_existance_instance = await MasterUser.findOne({
            where: {
                id: payload.id
            }
        })
        if(!user_existance_instance) {
            // Create new user with FCM token and notification preferences
            const userData = {
                ...payload,
                fcm_token: payload.fcm_token || null,
                notification_preferences: payload.notification_preferences || {
                    new_posts: true,
                    likes: true,
                    comments: true,
                    general: true
                },
                is_active: true,
                last_login: new Date()
            };
            await MasterUser.create(userData);
            operation = 'created';
            Logger(reqId).info(`Created new user with FCM token: ${payload.id}`);
        } else {
            // Update existing user, including FCM token if provided
            user_existance_instance.username = payload.username;
            user_existance_instance.email = payload.email;
            
            // Update FCM token if provided
            if (payload.fcm_token) {
                user_existance_instance.fcm_token = payload.fcm_token;
                Logger(reqId).info(`Updated FCM token for user: ${payload.id}`);
            }
            
            // Update notification preferences if provided
            if (payload.notification_preferences) {
                user_existance_instance.notification_preferences = payload.notification_preferences;
            }
            
            user_existance_instance.last_login = new Date();
            await user_existance_instance.save();
            operation = 'updated';
        }
        return res.status(200).json({status: true, message: `User ${operation} successfully`})
    } catch(error){
            Logger(reqId).error(`Error in upsert_user_controller - ${error.message}`)
            console.log(error)
            return res.status(500).json({
                status: false,
                message: `Failed in upsert_user_controller - ${error.message}`
            })
    }
}


/**
 * @swagger
 * paths:
 *  /mmd/v1/users/upsert-user:
 *    summary: API to upsert a user
 *    description: API to upsert a user
 *    post:
 *      tags:
 *        - User
 *      summary: API to upsert a user
 *      description: API to upsert a user
 *      operationId: upsertUser
 *      requestBody:
 *        description: Request Body
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              description: Add user details
 *              properties:
 *                id:
 *                  type : string 
 *                username:
 *                  type: string 
 *                email:
 *                  type: string  
 *              required:
 *                - id
 *                - username
 *                - email  
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
 *                      type: String
 *                      description: message  
 *                    data:
 *                      type: object
 *                      description: created profile  
 *                  example: 
 *                    status: true
 *                    message: User added successfully  
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
