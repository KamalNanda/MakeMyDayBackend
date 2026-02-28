import { Logger } from "../../../utilities/logger.js";
import MasterUser from "../models/mst_user.js";
import admin from 'firebase-admin';

/**
 * Save FCM token for authenticated user
 * Called by Flutter app when initializing or when token is refreshed
 */
export const saveFcmToken = async (req, res) => {
  const reqId = res.locals.uuid;
  const { fcm_token, platform, device_name } = req.body;

  try {
    Logger(reqId).info(`Request received to save FCM token`);
    Logger(reqId).info(`  Platform: ${platform}`);
    Logger(reqId).info(`  Device: ${device_name}`);

    // Validate request
    if (!fcm_token) {
      return res.status(400).json({
        status: false,
        message: 'FCM token is required'
      });
    }

    // Get authenticated user from Firebase token (if sent in headers)
    let userId = null;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
        Logger(reqId).info(`Verified user from Firebase token: ${userId}`);
      } catch (authError) {
        Logger(reqId).warn(`Could not verify Firebase token: ${authError.message}`);
        // Continue without user verification - some requests might not have auth
      }
    }

    // If we don't have userId from Firebase, check if it's in the request body
    if (!userId && req.body.user_id) {
      userId = req.body.user_id;
      Logger(reqId).info(`Using user_id from request body: ${userId}`);
    }

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: 'User authentication required. Please provide Firebase token or user_id'
      });
    }

    // Find or create user
    let user = await MasterUser.findOne({
      where: { id: userId }
    });

    if (!user) {
      // Create new user with FCM token
      user = await MasterUser.create({
        id: userId,
        fcm_token: fcm_token,
        notification_preferences: {
          new_posts: true,
          likes: true,
          comments: true,
          general: true
        },
        is_active: true,
        last_login: new Date()
      });
      Logger(reqId).info(`Created new user with FCM token: ${userId}`);
    } else {
      // Update existing user's FCM token
      user.fcm_token = fcm_token;
      user.last_login = new Date();
      await user.save();
      Logger(reqId).info(`Updated FCM token for user: ${userId}`);
    }

    Logger(reqId).info(`✅ FCM token saved successfully for user: ${userId}`);

    return res.status(200).json({
      status: true,
      message: 'FCM token saved successfully',
      data: {
        user_id: user.id,
        token_saved: true
      }
    });

  } catch (error) {
    Logger(reqId).error(`Error saving FCM token: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: `Failed to save FCM token - ${error.message}`
    });
  }
};

/**
 * @swagger
 * /mmd/v1/users/save-fcm-token:
 *   post:
 *     summary: Save FCM token for user
 *     tags: [Users]
 *     description: Save or update FCM token for push notifications (called by Flutter app)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcm_token:
 *                 type: string
 *                 description: Firebase Cloud Messaging token
 *               platform:
 *                 type: string
 *                 enum: [android, ios]
 *                 description: Device platform
 *               device_name:
 *                 type: string
 *                 description: Device name (optional)
 *             required:
 *               - fcm_token
 *             example:
 *               fcm_token: "fZD0fH7Tz0K:APA91bEZX9w3..."
 *               platform: "android"
 *               device_name: "Samsung Galaxy S21"
 *     responses:
 *       '200':
 *         description: FCM token saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     token_saved:
 *                       type: boolean
 *       '400':
 *         description: Missing required fields
 *       '401':
 *         description: User authentication required
 *       '500':
 *         description: Server error
 */
