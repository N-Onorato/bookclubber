import Database from "better-sqlite3";
import fs from "fs";
import bcrypt from "bcrypt";
import path from "path";

const dbPath = process.env.DATABASE_PATH || "./data/bookclub.db";

console.log("Initializing database at:", dbPath);

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log("Created data directory:", dbDir);
}

const db = new Database(dbPath);
console.log("Database connection established");

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");
console.log("WAL mode enabled");

// Read and execute schema
const schemaPath = "./lib/db/schema.sql";
console.log("Reading schema from:", schemaPath);

if (!fs.existsSync(schemaPath)) {
    console.error("Schema file not found at:", schemaPath);
    process.exit(1);
}

const schema = fs.readFileSync(schemaPath, "utf8");
console.log("Schema read, executing...");

try {
    db.exec(schema);
    console.log("Schema executed successfully");
} catch (error) {
    console.error("Error executing schema:", error);
    process.exit(1);
}

// Verify tables were created
try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("Tables created:", tables.map((t: any) => t.name));
} catch (error) {
    console.error("Error checking tables:", error);
}

// Create default admin user if none exists
try {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
        count: number;
    };
    
    if (userCount.count === 0) {
        const adminPassword = bcrypt.hashSync("admin123", 10);
        db.prepare(`
            INSERT INTO users (email, password_hash, first_name, last_name, role) 
            VALUES (?, ?, ?, ?, ?)
        `).run("admin@bookclub.com", adminPassword, "Admin", "User", "admin");

        console.log("Created default admin user: admin@bookclub.com / admin123");
    } else {
        console.log(`Database already has ${userCount.count} users`);
    }
} catch (error) {
    console.error("Error creating admin user:", error);
}

db.close();
console.log("Database initialization completed");