import { Logger } from "../../../utilities/logger.js"
import MasterPost from "../models/mst_post.js";
import { check_tag_existence_and_insert } from "../utilities/check_tag_existence_and_insert.js";
import { create_instances_in_tns_post_vs_tag_table } from "../utilities/create_instances_in_tns_post_vs_tag_table.js";

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
            external_url: payload.external_url
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
