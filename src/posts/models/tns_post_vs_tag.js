
import { DataTypes, Model, Sequelize } from "sequelize";
import db from "../../../utilities/db/db.js";
import MasterPost from "./mst_post.js";
import MasterTag from "./mst_tags.js";

class TnsPostVsTag extends Model {}

TnsPostVsTag.init({
        post_id: {
            type: DataTypes.UUID, 
            allowNull: false,
            references: {
              model: "mst_posts",
              key: "id",
            },
        },
        tag_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
              model: "mst_tags",
              key: "id",
            },
        }
    },
    {
        sequelize: db,
        modelName: 'tns_post_vs_tag',
        freezeTableName: true,
        timestamps: true,
        underscored: true
    }
)

try{
    TnsPostVsTag.hasOne(MasterPost, {
      foreignKey: {
        name: "id",
      },
    });
    TnsPostVsTag.hasOne(MasterTag, {
      foreignKey: {
        name: "id",
      },
    });
    await TnsPostVsTag.sync({alter:true})
} catch (error){
    console.log(error)
}

export default TnsPostVsTag;