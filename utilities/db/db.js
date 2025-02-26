import { Sequelize } from "sequelize";
import { Logger } from "../logger.js";

// Option 1: Passing a connection URI
// postgresql://postgres:qBhNtOVZpNmkwwIhBvPxJKzbiRzuEcbD@interchange.proxy.rlwy.net:17860/railway
const db_config={
    host: 'interchange.proxy.rlwy.net',
    port: 17860,
    logging: false,
    dialect: 'postgres',
    schema: 'public'
}
let db = new Sequelize(
    'railway',
    'postgres',
    'qBhNtOVZpNmkwwIhBvPxJKzbiRzuEcbD',
    db_config
)

try {
    await db.authenticate(); 
    await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    Logger().info(`Connection has been established successfully`)
  } catch (error) {
    Logger().error(`Unable to connect to the database: ${error.message}`);
}

export default db;