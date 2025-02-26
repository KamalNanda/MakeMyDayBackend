import { Logger } from "../../../utilities/logger.js";
import MasterTag from "../models/mst_tags.js"


export const check_tag_existence_and_insert = async (tags, reqId) => {
    let tag_ids = []; 
    Logger(reqId).info(`check_tag_existence_and_insert called with following tags - ${tags}`)
    try{
        for(let i = 0; i < tags.length ; i++){
            let tag_instance = await MasterTag.findOne({
                where: {
                    tag: tags[i]
                }
            })
            if(!tag_instance){
                Logger(reqId).debug(`Tag - ${tags[i]} does not exists! Adding in db!`);
                tag_instance = new MasterTag({
                    tag: tags[i]
                })
                await tag_instance.save()
            } else Logger(reqId).debug(`Tag - ${tags[i]} already exists in db!`);
            tag_ids.push(tag_instance.id)
        }
    } catch (error) {
        Logger(reqId).error(`Error in check_tag_existence_and_insert - ${error.message}`)
        tag_ids = []; 
    }
    Logger(reqId).debug(`Returning tag ids - ${tag_ids}`);
    return tag_ids;
}