import { DataTypes, Model, Sequelize } from "sequelize";
import db from "../../../utilities/db/db.js";

class MasterMediaTable extends Model {}

MasterMediaTable.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM('image', 'video'),
            allowNull: true,
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize: db,
        modelName: 'mst_media',
        freezeTableName: true,
        timestamps: true,
        underscored: true
    }
)

try{
    await MasterMediaTable.sync({alter:true})
} catch (error){
    console.log(error)
}

export default MasterMediaTable;