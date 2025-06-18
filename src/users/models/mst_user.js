import { DataTypes, Model, Sequelize } from "sequelize";
import db from "../../../utilities/db/db.js";

class MasterUser extends Model {}

MasterUser.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize: db,
        modelName: 'mst_users',
        freezeTableName: true,
        timestamps: true,
        underscored: true
    }
)

try{
    await MasterUser.sync({alter:true})
} catch (error){
    console.log(error)
}

export default MasterUser;