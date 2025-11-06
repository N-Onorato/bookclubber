/**
 * Emergency script to approve admin users
 * Run with: npx tsx scripts/approve-admin.ts
 */

import { getDatabase } from '../lib/db/connection';

async function approveAdmins() {
    try {
        const db = getDatabase();

        // Approve all admin users
        const result = db.prepare(`
            UPDATE users
            SET approved = TRUE,
                approved_at = CURRENT_TIMESTAMP
            WHERE role = 'admin' AND approved = FALSE
        `).run();

        console.log(`✅ Approved ${result.changes} admin user(s)`);

        // Show all users and their approval status
        const users = db.prepare(`
            SELECT email, name, role, approved, approved_at
            FROM users
            ORDER BY role DESC, email
        `).all();

        console.log('\n📋 Current user status:');
        console.table(users);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

approveAdmins();