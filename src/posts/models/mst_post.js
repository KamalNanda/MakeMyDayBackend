import { DataTypes, Model, Sequelize } from "sequelize";
import db from "../../../utilities/db/db.js";

class MasterPost extends Model {}

MasterPost.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: Sequelize.UUIDV1,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM('news', 'video'),
            allowNull: true,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: true
        }, 
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        external_url: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        media_url: {
            type: DataTypes.TEXT, 
            allowNull: true
        },
        post_date: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        sequelize: db,
        modelName: 'mst_posts',
        freezeTableName: true,
        timestamps: true,
        underscored: true
    }
)

try{
    await MasterPost.sync({alter:true})
} catch (error){
    console.log(error)
}

export default MasterPost;