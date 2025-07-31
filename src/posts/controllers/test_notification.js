import { Logger } from "../../../utilities/logger.js";
import FirebaseService from "../../../utilities/firebase_service.js";

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