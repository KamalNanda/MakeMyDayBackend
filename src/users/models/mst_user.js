import { DataTypes, Model, Sequelize } from "sequelize";
import db from "../../../utilities/db/db.js";

class MasterUser extends Model {}

MasterUser.init({
        id: {
            type: DataTypes.STRING, 
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Add FCM token and notification preferences
        fcm_token: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notification_preferences: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {
                new_posts: true,
                likes: true,
                comments: true,
                general: true
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true
        },
        last_login: {
            type: DataTypes.DATE,
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