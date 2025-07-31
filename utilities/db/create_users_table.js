import db from './db.js';
import { Logger } from '../logger.js';

const createUsersTable = async () => {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        fcm_token TEXT,
        notification_preferences JSONB DEFAULT '{"new_posts": true, "likes": true, "comments": true, "general": true}',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    Logger().info('Users table created successfully');
    
    // Create index for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
      CREATE INDEX IF NOT EXISTS idx_users_fcm_token ON users(fcm_token);
      CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    `);

    Logger().info('Users table indexes created successfully');
    
  } catch (error) {
    Logger().error(`Error creating users table: ${error.message}`);
    throw error;
  }
};

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createUsersTable()
    .then(() => {
      Logger().info('Database migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      Logger().error(`Database migration failed: ${error.message}`);
      process.exit(1);
    });
}

export default createUsersTable; 