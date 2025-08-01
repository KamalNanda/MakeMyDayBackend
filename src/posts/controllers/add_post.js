import { Logger } from "../../../utilities/logger.js"
import MasterPost from "../models/mst_post.js";
import MasterUser from "../../users/models/mst_user.js";
import { check_tag_existence_and_insert } from "../utilities/check_tag_existence_and_insert.js";
import { create_instances_in_tns_post_vs_tag_table } from "../utilities/create_instances_in_tns_post_vs_tag_table.js";
import FirebaseService from "../../../utilities/firebase_service.js";
import { Op } from "sequelize";

export const add_post = async (req, res) => {
    const reqId = res.locals.uuid
    const payload = req.body
    try{
        Logger(reqId).info(`Request recieved to add a new post with payload - ${JSON.stringify(payload)}`);
        const is_post_exists_with_title = await MasterPost.findOne({
            where: {
                title: payload.title
            }
        })
        if(is_post_exists_with_title){
            return res.status(400).json({
                status: false,
                message: 'Post already exists with provided title'
            })
        }
        // Save Post to DB
        const post = new MasterPost({
            type: payload.type,
            title: payload.title,
            description: payload.description, 
            media_url: payload.media_url,
            external_url: payload.external_url,
            post_date: payload.post_date
        })
        
        await post.save();
        // Create tags and map tag with post
            // check if tag exists in db 
        let tag_ids = await check_tag_existence_and_insert([...new Set(payload.tags)], reqId)
        if(tag_ids.length != [...new Set(payload.tags)].length){ 
            return res.status(400).json({
                status: false,
                message: 'Something went wrong in adding tags!'
            })
        }
        let map_instances = await create_instances_in_tns_post_vs_tag_table(tag_ids, post.id, reqId)
        if(map_instances.length != tag_ids.length){ 
            return res.status(400).json({
                status: false,
                message: 'Something went wrong in mapping post with tags!'
            })
        } 

        // Send push notification to all users
        try {
            Logger(reqId).info('Starting notification process...');

            // Get all active users with FCM tokens
            const users = await MasterUser.findAll({ // Changed from User to MasterUser
                where: {
                    is_active: true,
                    fcm_token: {
                        [Op.ne]: null
                    }
                },
                attributes: ['fcm_token', 'notification_preferences']
            });

            Logger(reqId).info(`Found ${users.length} users with FCM tokens`);

            // Filter users who have enabled new post notifications
            const usersToNotify = users.filter(user => {
                const preferences = user.notification_preferences || {};
                const shouldNotify = preferences.new_posts !== false; // Default to true if not set
                Logger(reqId).info(`User ${user.fcm_token?.substring(0, 10)}... has new_posts preference: ${preferences.new_posts}, should notify: ${shouldNotify}`);
                return shouldNotify;
            });

            Logger(reqId).info(`Filtered to ${usersToNotify.length} users who should receive notifications`);

            if (usersToNotify.length > 0) {
                const fcmTokens = usersToNotify.map(user => user.fcm_token).filter(token => token);
                Logger(reqId).info(`Preparing to send notifications to ${fcmTokens.length} devices`);

                if (fcmTokens.length > 0) {
                    // Send notification
                    const notificationResult = await FirebaseService.sendNewPostNotification(
                        {
                            id: post.id,
                            title: post.title,
                            description: post.description,
                            media_url: post.media_url,
                            external_url: post.external_url,
                        },
                        fcmTokens
                    );

                    if (notificationResult.success) {
                        Logger(reqId).info(`Push notification sent successfully to ${notificationResult.successCount || 1} users`);
                    } else {
                        Logger(reqId).warn(`Failed to send push notification: ${notificationResult.error}`);
                    }
                } else {
                    Logger(reqId).warn('No valid FCM tokens found to send notifications');
                }
            } else {
                Logger(reqId).info('No users found to notify or all users have disabled new post notifications');
            }

            // Also trigger a local notification signal (for testing)
            Logger(reqId).info('Triggering local notification signal for testing');
            try {
                // This will help trigger local notifications in the Flutter app
                const localNotificationSignal = {
                    type: 'new_post',
                    post_id: post.id,
                    title: post.title,
                    description: post.description,
                    timestamp: new Date().toISOString()
                };
                Logger(reqId).info(`Local notification signal: ${JSON.stringify(localNotificationSignal)}`);
            } catch (localError) {
                Logger(reqId).error(`Error triggering local notification signal: ${localError.message}`);
            }
        } catch (notificationError) {
            Logger(reqId).error(`Error sending push notification: ${notificationError.message}`);
            Logger(reqId).error(`Notification error stack: ${notificationError.stack}`);
            // Don't fail the post creation if notification fails
        }

        Logger(reqId).info(`Post created`);
        return res.status(200).json({
            status: true,
            message: 'Post added'
        })
    } catch(error){
        Logger(reqId).error(`Error in add_post - ${error.message}`)
        console.log(error)
        return res.status(500).json({
            status: false,
            message: `Failed to add post - ${error.message}`
        })
    }
}

/**
 * @swagger
 * paths:
 *  /mmd/v1/posts/create-post:
 *    summary: API to create a new Post
 *    description: API to create a new Post
 *    post:
 *      tags:
 *        - Posts
 *      summary: API to create a new Post
 *      description: API to create a new Post
 *      operationId: createPost
 *      requestBody:
 *        description: Request Body
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              description: Add user details
 *              properties:
 *                type:
 *                  type : string 
 *                title:
 *                  type: string 
 *                description:
 *                  type: string 
 *                tags:
 *                  type: array 
 *                media_url:
 *                  type: string 
 *                external_url:
 *                  type: string 
 *              required:
 *                - type
 *                - title
 *                - tags
 *                - media_url 
 *              example:
 *                type : video  
 *                title : 'Happy Video'  
 *                description : 'This is a description'
 *                tags : ['meme', 'funny']  
 *                media_url : 'f6f19735-553c-4e2a-9c07-6c65df9bd47c'
 *                external_url: 'kamal'
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
 *                    message: Post Created 
 *        '400':
 *          description: Bad Request
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/StandardErrorResponse'
 *              example:
 *                status: false
 *                message: 'Profile already exist by provided profile name' 
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
