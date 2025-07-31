import { Logger } from "../../../utilities/logger.js";
import FirebaseService from "../../../utilities/firebase_service.js";
import MasterUser from "../../users/models/mst_user.js";
import { Op } from "sequelize";

export const testNotification = async (req, res) => {
    const reqId = Math.random().toString(36).substring(7);
    
    try {
        Logger(reqId).info('Testing notification system...');
        
        // Test notification data
        const testNotification = {
            title: 'Test Notification 🧪',
            body: 'This is a test notification from MakeMyDay!',
        };

        const testData = {
            type: 'test',
            timestamp: new Date().toISOString(),
        };

        // Test with a sample FCM token (you can replace this with a real one)
        const testFcmToken = req.body.fcm_token || 'test_token';
        
        Logger(reqId).info(`Sending test notification to token: ${testFcmToken}`);
        
        const result = await FirebaseService.sendNotificationToDevice(
            testFcmToken,
            testNotification,
            testData
        );

        if (result.success) {
            Logger(reqId).info('Test notification sent successfully');
            return res.status(200).json({
                status: true,
                message: 'Test notification sent successfully',
                result: result
            });
        } else {
            Logger(reqId).error(`Test notification failed: ${result.error}`);
            return res.status(500).json({
                status: false,
                message: 'Test notification failed',
                error: result.error
            });
        }
    } catch (error) {
        Logger(reqId).error(`Error in test notification: ${error.message}`);
        return res.status(500).json({
            status: false,
            message: 'Error testing notification',
            error: error.message
        });
    }
};

export const checkRegisteredTokens = async (req, res) => {
    const reqId = Math.random().toString(36).substring(7);
    
    try {
        Logger(reqId).info('Checking registered FCM tokens...');
        
        // Get all users with FCM tokens
        const users = await MasterUser.findAll({
            where: {
                fcm_token: {
                    [Op.ne]: null
                }
            },
            attributes: ['id', 'email', 'fcm_token', 'notification_preferences', 'is_active']
        });

        Logger(reqId).info(`Found ${users.length} users with FCM tokens`);

        const tokenInfo = users.map(user => ({
            id: user.id,
            email: user.email,
            fcm_token_preview: user.fcm_token ? `${user.fcm_token.substring(0, 20)}...` : null,
            notification_preferences: user.notification_preferences,
            is_active: user.is_active
        }));

        return res.status(200).json({
            status: true,
            message: `Found ${users.length} registered users`,
            data: {
                total_users: users.length,
                users: tokenInfo
            }
        });
    } catch (error) {
        Logger(reqId).error(`Error checking registered tokens: ${error.message}`);
        return res.status(500).json({
            status: false,
            message: 'Error checking registered tokens',
            error: error.message
        });
    }
};

/**
 * @swagger
 * /mmd/v1/posts/test-notification:
 *   post:
 *     summary: Test notification system
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcm_token:
 *                 type: string
 *                 description: FCM token to send test notification to
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *       500:
 *         description: Test notification failed
 */ 