
import { DataTypes, Model, Sequelize } from "sequelize";
import db from "../../../utilities/db/db.js";
import MasterPost from "./mst_post.js"; 
import MasterUser from "../../users/models/mst_user.js";

class TnsPostVsUser extends Model {}

TnsPostVsUser.init({
        post_id: {
            type: DataTypes.UUID, 
            allowNull: false,
            references: {
              model: "mst_posts",
              key: "id",
            },
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
              model: "mst_users",
              key: "id",
            },
        }
    },
    {
        sequelize: db,
        modelName: 'tns_post_vs_user',
        freezeTableName: true,
        timestamps: true,
        underscored: true
    }
)

try{
    TnsPostVsUser.hasOne(MasterPost, {
      foreignKey: {
        name: "id",
      },
    });
    TnsPostVsUser.hasOne(MasterUser, {
      foreignKey: {
        name: "id",
      },
    });
    await TnsPostVsUser.sync({alter:true})
} catch (error){
    console.log(error)
}

export default TnsPostVsUser;