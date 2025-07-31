import express from 'express';
import { updateFcmToken } from '../controllers/update_fcm_token.js';
import { getNotificationPreferences, updateNotificationPreferences } from '../controllers/notification_preferences.js';

const router = express.Router();

// Update FCM token route
router.post('/update-fcm-token', updateFcmToken);

// Get notification preferences
router.get('/notification-preferences', getNotificationPreferences);

// Update notification preferences
router.post('/update-notification-preferences', updateNotificationPreferences);

export default router;
