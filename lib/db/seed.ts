import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

/**
 * Database seeding script
 * Add sample data for development/testing
 */

const dbPath = process.env.DATABASE_PATH || "./bookclubber.db";

console.log("Seeding database at:", dbPath);

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

try {
    // Seed additional users
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };

    if (userCount.count === 1) {
        console.log("Seeding sample users...");

        const users = [
            {
                id: randomUUID(),
                email: "alice@bookclub.com",
                password: bcrypt.hashSync("password123", 10),
                name: "Alice Reader",
                role: "member"
            },
            {
                id: randomUUID(),
                email: "bob@bookclub.com",
                password: bcrypt.hashSync("password123", 10),
                name: "Bob Bookworm",
                role: "member"
            },
            {
                id: randomUUID(),
                email: "charlie@bookclub.com",
                password: bcrypt.hashSync("password123", 10),
                name: "Charlie Pages",
                role: "member"
            }
        ];

        const stmt = db.prepare(`
            INSERT INTO users (id, email, password_hash, name, role)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const user of users) {
            stmt.run(user.id, user.email, user.password, user.name, user.role);
            console.log(`  ✓ Created user: ${user.name} (${user.email})`);
        }

        console.log("\n✓ Sample users created");
        console.log("  Password for all sample users: password123\n");
    } else {
        console.log(`Database has ${userCount.count} users, skipping sample user seed`);
    }

    // Seed sample themes (optional)
    const themeCount = db.prepare("SELECT COUNT(*) as count FROM themes").get() as { count: number };

    if (themeCount.count === 0) {
        console.log("Seeding sample themes...");

        const themes = [
            { id: randomUUID(), theme_text: "Science Fiction", used_count: 0, last_used_at: null },
            { id: randomUUID(), theme_text: "Mystery & Thriller", used_count: 0, last_used_at: null },
            { id: randomUUID(), theme_text: "Classic Literature", used_count: 0, last_used_at: null },
            { id: randomUUID(), theme_text: "Non-Fiction", used_count: 0, last_used_at: null },
            { id: randomUUID(), theme_text: "Fantasy", used_count: 0, last_used_at: null },
            { id: randomUUID(), theme_text: "Historical Fiction", used_count: 0, last_used_at: null },
            { id: randomUUID(), theme_text: "Contemporary Fiction", used_count: 0, last_used_at: null },
            { id: randomUUID(), theme_text: "Biography & Memoir", used_count: 0, last_used_at: null }
        ];

        const stmt = db.prepare(`
            INSERT INTO themes (id, theme_text, used_count, last_used_at)
            VALUES (?, ?, ?, ?)
        `);

        for (const theme of themes) {
            stmt.run(theme.id, theme.theme_text, theme.used_count, theme.last_used_at);
            console.log(`  ✓ Created theme: ${theme.theme_text}`);
        }

        console.log("\n✓ Sample themes created\n");
    } else {
        console.log(`Database has ${themeCount.count} themes, skipping theme seed`);
    }

    db.close();
    console.log("=== Seeding completed ===");
} catch (error) {
    console.error("Error seeding database:", error);
    db.close();
    process.exit(1);
}
