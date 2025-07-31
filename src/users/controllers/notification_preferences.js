import { Logger } from "../../../utilities/logger.js";
import User from "../models/user.js";

export const getNotificationPreferences = async (req, res) => {
  const reqId = res.locals.uuid;
  const { user_id } = req.query;

  try {
    Logger(reqId).info(`Request received to get notification preferences for user: ${user_id}`);

    if (!user_id) {
      return res.status(400).json({
        status: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findOne({
      where: { firebase_uid: user_id }
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Notification preferences retrieved successfully',
      data: {
        notification_preferences: user.notification_preferences || {
          new_posts: true,
          likes: true,
          comments: true,
          general: true,
        }
      }
    });

  } catch (error) {
    Logger(reqId).error(`Error getting notification preferences: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: `Failed to get notification preferences - ${error.message}`
    });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  const reqId = res.locals.uuid;
  const { user_id, setting, enabled } = req.body;

  try {
    Logger(reqId).info(`Request received to update notification preference for user: ${user_id}, setting: ${setting}, enabled: ${enabled}`);

    if (!user_id || !setting) {
      return res.status(400).json({
        status: false,
        message: 'User ID and setting are required'
      });
    }

    const user = await User.findOne({
      where: { firebase_uid: user_id }
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Update the specific setting
    const currentPreferences = user.notification_preferences || {
      new_posts: true,
      likes: true,
      comments: true,
      general: true,
    };

    currentPreferences[setting] = enabled;

    await user.update({
      notification_preferences: currentPreferences
    });

    Logger(reqId).info(`Updated notification preference for user: ${user_id}, setting: ${setting}, enabled: ${enabled}`);

    return res.status(200).json({
      status: true,
      message: 'Notification preference updated successfully',
      data: {
        notification_preferences: currentPreferences
      }
    });

  } catch (error) {
    Logger(reqId).error(`Error updating notification preference: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: `Failed to update notification preference - ${error.message}`
    });
  }
};

/**
 * @swagger
 * paths:
 *  /mmd/v1/users/notification-preferences:
 *    get:
 *      summary: Get user notification preferences
 *      description: Retrieve notification preferences for a user
 *      tags:
 *        - Users
 *      parameters:
 *        - in: query
 *          name: user_id
 *          required: true
 *          schema:
 *            type: string
 *          description: Firebase UID of the user
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
 *                    message:
 *                      type: string
 *                    data:
 *                      type: object
 *                      properties:
 *                        notification_preferences:
 *                          type: object
 *                          properties:
 *                            new_posts:
 *                              type: boolean
 *                            likes:
 *                              type: boolean
 *                            comments:
 *                              type: boolean
 *                            general:
 *                              type: boolean
 *        '400':
 *          description: Bad Request
 *        '404':
 *          description: User not found
 *        '500':
 *          description: Internal Server Error
 *  /mmd/v1/users/update-notification-preferences:
 *    post:
 *      summary: Update user notification preference
 *      description: Update a specific notification preference for a user
 *      tags:
 *        - Users
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user_id:
 *                  type: string
 *                  description: Firebase UID of the user
 *                setting:
 *                  type: string
 *                  enum: [new_posts, likes, comments, general]
 *                  description: The notification setting to update
 *                enabled:
 *                  type: boolean
 *                  description: Whether the notification is enabled
 *              required:
 *                - user_id
 *                - setting
 *                - enabled
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
 *                    message:
 *                      type: string
 *                    data:
 *                      type: object
 *                      properties:
 *                        notification_preferences:
 *                          type: object
 *        '400':
 *          description: Bad Request
 *        '404':
 *          description: User not found
 *        '500':
 *          description: Internal Server Error
 */ 