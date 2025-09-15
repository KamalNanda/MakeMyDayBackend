import db from "../../../utilities/db/db.js";
import { Logger } from "../../../utilities/logger.js";

/**
 * Database indexes to improve fetch_all_posts performance
 * Run this script to add the necessary indexes
 */
export const addPerformanceIndexes = async () => {
    const reqId = 'index-migration-' + Date.now();
    
    try {
        Logger(reqId).info('Starting to add performance indexes...');
        
        // Index on mst_posts.created_at for ORDER BY performance
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_mst_posts_created_at 
            ON mst_posts(created_at DESC);
        `);
        Logger(reqId).info('✓ Added index on mst_posts.created_at');
        
        // Index on tns_post_vs_tag.post_id for JOIN performance
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_tns_post_vs_tag_post_id 
            ON tns_post_vs_tag(post_id);
        `);
        Logger(reqId).info('✓ Added index on tns_post_vs_tag.post_id');
        
        // Index on tns_post_vs_tag.tag_id for JOIN performance
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_tns_post_vs_tag_tag_id 
            ON tns_post_vs_tag(tag_id);
        `);
        Logger(reqId).info('✓ Added index on tns_post_vs_tag.tag_id');
        
        // Index on tns_post_vs_user.post_id for like count performance
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_tns_post_vs_user_post_id 
            ON tns_post_vs_user(post_id);
        `);
        Logger(reqId).info('✓ Added index on tns_post_vs_user.post_id');
        
        // Index on tns_post_vs_user.user_id for user likes performance
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_tns_post_vs_user_user_id 
            ON tns_post_vs_user(user_id);
        `);
        Logger(reqId).info('✓ Added index on tns_post_vs_user.user_id');
        
        // Composite index on tns_post_vs_user(user_id, post_id) for user likes lookup
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_tns_post_vs_user_user_post 
            ON tns_post_vs_user(user_id, post_id);
        `);
        Logger(reqId).info('✓ Added composite index on tns_post_vs_user(user_id, post_id)');
        
        // Index on mst_tags.id for JOIN performance (though this should already exist as primary key)
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_mst_tags_id 
            ON mst_tags(id);
        `);
        Logger(reqId).info('✓ Added index on mst_tags.id');
        
        Logger(reqId).info('✅ All performance indexes added successfully!');
        
        return {
            status: true,
            message: 'Performance indexes added successfully'
        };
        
    } catch (error) {
        Logger(reqId).error(`Error adding performance indexes: ${error.message}`);
        console.error(error);
        return {
            status: false,
            message: `Failed to add performance indexes: ${error.message}`
        };
    }
};

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    addPerformanceIndexes()
        .then(result => {
            console.log(result);
            process.exit(result.status ? 0 : 1);
        })
        .catch(error => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}
