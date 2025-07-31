import createUsersTable from './utilities/db/create_users_table.js';
import { Logger } from './utilities/logger.js';

const runMigration = async () => {
  try {
    Logger().info('Starting database migration...');
    await createUsersTable();
    Logger().info('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    Logger().error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
};

runMigration(); 