#!/usr/bin/env tsx
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Get environment variables
const RESET_DATA = process.env.RESET_DATA === "true" || process.env.RESET_DATA === "1";
const DATA_DIR = process.env.DATA_DIR || "./data";
const DATABASE_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, "bookclub.db");

console.log("=== Book Club Startup ===");
console.log("Data directory:", DATA_DIR);
console.log("Database path:", DATABASE_PATH);
console.log("Reset data:", RESET_DATA);
console.log();

// Reset data if requested
if (RESET_DATA) {
    console.log("⚠️  RESET_DATA is set - Removing all data...");

    if (fs.existsSync(DATA_DIR)) {
        fs.rmSync(DATA_DIR, { recursive: true, force: true });
        console.log("✓ Removed data directory:", DATA_DIR);
    }

    console.log("✓ Data reset complete");
    console.log();
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log("✓ Created data directory:", DATA_DIR);
}

// Ensure covers directory exists
const coversDir = path.join(DATA_DIR, "covers");
if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
    console.log("✓ Created covers directory:", coversDir);
}

// Initialize database if it doesn't exist or was just reset
if (!fs.existsSync(DATABASE_PATH) || RESET_DATA) {
    console.log("\n=== Initializing Database ===");
    try {
        execSync("npm run db:init", {
            stdio: "inherit",
            env: { ...process.env, DATABASE_PATH }
        });
        console.log("✓ Database initialized");
    } catch (error) {
        console.error("✗ Error initializing database:", error);
        process.exit(1);
    }
}

// Start the Next.js server
console.log("\n=== Starting Next.js Server ===");
try {
    execSync("next start", {
        stdio: "inherit",
        env: process.env
    });
} catch (error) {
    console.error("✗ Error starting server:", error);
    process.exit(1);
}
