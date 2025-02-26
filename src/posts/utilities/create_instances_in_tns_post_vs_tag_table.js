import { Logger } from "../../../utilities/logger.js";
import TnsPostVsTag from "../models/tns_post_vs_tag.js";


export const create_instances_in_tns_post_vs_tag_table = async (tag_ids, post_id, reqId) => {
    let instances_ids = []
    try{ 
        Logger(reqId).info(`create_instances_in_tns_post_vs_tag_table called with following tag_ids - ${tag_ids}, post_id - ${post_id}`)
        for(let i = 0; i < tag_ids.length ; i++){
            let TnsPostVsTag_instance = await TnsPostVsTag.findOne({
                where: {
                    tag_id: tag_ids[i],
                    post_id
                }
            })
            if(!TnsPostVsTag_instance){
                Logger(reqId).debug(`Instance TnsPostVsTag_instance with tag - ${tag_ids[i]} and post_id - ${post_id} does not exists! Adding in db!`);
                TnsPostVsTag_instance = new TnsPostVsTag({
                    tag_id: tag_ids[i],
                    post_id
                })
                await TnsPostVsTag_instance.save()
            } else Logger(reqId).debug(`Instance TnsPostVsTag_instance with tag - ${tag_ids[i]} and post_id - ${post_id} already exists in db!`);
            instances_ids.push(TnsPostVsTag_instance.id)
        }
    } catch(error) {
        Logger(reqId).error(`Error in create_instances_in_tns_post_vs_tag_table - ${error.message}`)  
        instances_ids = []
    }
    Logger(reqId).debug(`Returning tag ids - ${instances_ids}`);
    return instances_ids;
}