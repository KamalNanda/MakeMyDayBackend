
import { DataTypes, Model, Sequelize } from "sequelize";
import db from "../../../utilities/db/db.js";

class Contacts extends Model {}

Contacts.init({
        name: {
            type: DataTypes.TEXT, 
        },
        email: {
            type: DataTypes.TEXT, 
        },
        message: {
            type: DataTypes.TEXT, 
        }
    },
    {
        sequelize: db,
        modelName: 'contacts',
        freezeTableName: true,
        timestamps: true,
        underscored: true
    }
)

try{
    await Contacts.sync({alter:true})
} catch (error){
    console.log(error)
}

export default Contacts;