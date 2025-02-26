
import { DataTypes, Model, Sequelize } from "sequelize";
import db from "../../../utilities/db/db.js";

class MasterTag extends Model {}

MasterTag.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        tag: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        sequelize: db,
        modelName: 'mst_tags',
        freezeTableName: true,
        timestamps: true,
        underscored: true
    }
)

try{
    await MasterTag.sync({alter:true})
} catch (error){
    console.log(error)
}

export default MasterTag;