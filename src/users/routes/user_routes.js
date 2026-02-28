import express from 'express';
import { updateFcmToken } from '../controllers/update_fcm_token.js';
import { saveFcmToken } from '../controllers/save_fcm_token.js';
import { getNotificationPreferences, updateNotificationPreferences } from '../controllers/notification_preferences.js';
import { upsert_user_controller } from '../controllers/upsert_user_controller.js';
import { generate_uuid_middleware } from "../../../utilities/middlewares/generate_uuid_middleware.js";

const router = express.Router()

// Upsert user (create/update mst_users row)
router.post('/upsert-user', generate_uuid_middleware(), upsert_user_controller);

// Update FCM token route (legacy - requires explicit user_id)
router.post('/update-fcm-token', generate_uuid_middleware(), updateFcmToken);

// Save FCM token route (for Flutter app - uses Firebase auth)
router.post('/save-fcm-token', generate_uuid_middleware(), saveFcmToken);

// Get notification preferences
router.get('/notification-preferences', generate_uuid_middleware(), getNotificationPreferences);

// Update notification preferences
router.post('/update-notification-preferences', generate_uuid_middleware(), updateNotificationPreferences);

export default router;
