import { Logger } from "../../../utilities/logger.js";
import MasterUser from "../models/mst_user.js";

export const updateFcmToken = async (req, res) => {
  const reqId = res.locals.uuid;
  const { user_id, fcm_token } = req.body;

  try {
    Logger(reqId).info(`Request received to update FCM token for user: ${user_id}`);

    if (!user_id || !fcm_token) {
      return res.status(400).json({
        status: false,
        message: 'User ID and FCM token are required'
      });
    }

    // Find or create user
    let user = await MasterUser.findOne({
      where: { id: user_id }
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await MasterUser.create({
        id: user_id,
        email: req.body.email || 'unknown@example.com',
        username: req.body.display_name || 'User',
        fcm_token: fcm_token,
      });
      Logger(reqId).info(`Created new user with FCM token: ${user_id}`);
    } else {
      // Update existing user's FCM token
      await user.update({
        fcm_token: fcm_token,
        last_login: new Date(),
      });
      Logger(reqId).info(`Updated FCM token for existing user: ${user_id}`);
    }

    return res.status(200).json({
      status: true,
      message: 'FCM token updated successfully',
      data: {
        user_id: user.id,
        email: user.email,
      }
    });

  } catch (error) {
    Logger(reqId).error(`Error updating FCM token: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: `Failed to update FCM token - ${error.message}`
    });
  }
};

/**
 * @swagger
 * paths:
 *  /mmd/v1/users/update-fcm-token:
 *    summary: API to update user's FCM token
 *    description: API to update or create user with FCM token for push notifications
 *    post:
 *      tags:
 *        - Users
 *      summary: Update FCM token
 *      description: Update user's FCM token for push notifications
 *      operationId: updateFcmToken
 *      requestBody:
 *        description: Request Body
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user_id:
 *                  type: string
 *                  description: Firebase UID of the user
 *                fcm_token:
 *                  type: string
 *                  description: FCM token for push notifications
 *                email:
 *                  type: string
 *                  description: User's email (optional for new users)
 *                display_name:
 *                  type: string
 *                  description: User's display name (optional for new users)
 *              required:
 *                - user_id
 *                - fcm_token
 *              example:
 *                user_id: "firebase_uid_here"
 *                fcm_token: "fcm_token_here"
 *                email: "user@example.com"
 *                display_name: "John Doe"
 *      responses:
 *        '200':
 *          description: OK
 *          content:
 *             application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    status:
 *                      type: boolean
 *                      description: Status
 *                    message:
 *                      type: string
 *                      description: Success message
 *                    data:
 *                      type: object
 *                      description: User data
 *                  example:
 *                    status: true
 *                    message: "FCM token updated successfully"
 *                    data:
 *                      user_id: "uuid_here"
 *                      firebase_uid: "firebase_uid_here"
 *        '400':
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StandardErrorResponse'
 *        '500':
 *          description: Internal Server Error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StandardErrorResponse'
 */ 