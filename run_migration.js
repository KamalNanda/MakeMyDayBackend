#!/usr/bin/env node

/**
 * Migration runner script for Railway.com deployment
 * This script can be run locally or on Railway to add performance indexes
 */

import { addPerformanceIndexes } from './src/posts/utilities/add_performance_indexes.js';

console.log('🚀 Starting database migration for performance indexes...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Database URL configured:', !!process.env.DATABASE_URL);

try {
    const result = await addPerformanceIndexes();
    
    if (result.status) {
        console.log('✅ Migration completed successfully!');
        console.log('📊 Performance indexes have been added to your database.');
        process.exit(0);
    } else {
        console.error('❌ Migration failed:', result.message);
        process.exit(1);
    }
} catch (error) {
    console.error('💥 Migration script failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}
