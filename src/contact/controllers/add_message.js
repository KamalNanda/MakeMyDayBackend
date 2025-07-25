import { Logger } from "../../../utilities/logger.js";
import Contacts from "../models/contact_model.js"

export const add_message = async (req, res) => {
    const reqId = res.locals.uuid
    try{
        await Contacts.create(req.body);
        return res.status(200).json({status:true})
    } catch (error){
        Logger(reqId).error(`Error in add_message - ${error.message}`)
        console.log(error)
        return res.status(500).json({status:true})
    }
}