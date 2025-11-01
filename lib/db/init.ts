import Database from "better-sqlite3";
import fs from "fs";
import bcrypt from "bcrypt";
import path from "path";
import { randomUUID } from "crypto";
import { execSync } from "child_process";

const dbPath = process.env.DATABASE_PATH || "./data/bookclub.db";

console.log("Initializing database at:", dbPath);

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log("Created data directory:", dbDir);
}

// Run migrations first to ensure schema is up to date
console.log("\n=== Running Database Migrations ===");
try {
    execSync("npm run db:migrate", {
        stdio: "inherit",
        env: { ...process.env, DATABASE_PATH: dbPath }
    });
    console.log("Migrations completed successfully\n");
} catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
}

// Now seed the database with initial data
console.log("=== Seeding Database ===");

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

// Seed default admin user if none exists
try {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
        count: number;
    };

    if (userCount.count === 0) {
        console.log("No users found, creating default admin...");

        const adminId = randomUUID();
        const adminPassword = bcrypt.hashSync("admin123", 10);

        db.prepare(`
            INSERT INTO users (id, email, password_hash, name, role)
            VALUES (?, ?, ?, ?, ?)
        `).run(adminId, "admin@bookclub.com", adminPassword, "Admin User", "admin");

        console.log("✓ Created default admin user");
        console.log("  Email: admin@bookclub.com");
        console.log("  Password: admin123");
        console.log("  ⚠️  IMPORTANT: Change this password after first login!\n");
    } else {
        console.log(`Database already has ${userCount.count} user(s), skipping seed\n`);
    }
} catch (error) {
    console.error("Error seeding admin user:", error);
    db.close();
    process.exit(1);
}

db.close();
console.log("=== Database initialization completed ===");
