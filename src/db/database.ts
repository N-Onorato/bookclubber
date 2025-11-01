/**
 * Database module for BookClubber
 * Provides database initialization and management using numTwo
 */

import {
  DatabaseManager,
  createNodeDatabase,
  createNodeTestDatabase,
  createNodeFileSystem
} from '@cytoplum/numtwo';
import { parse as parseYaml } from 'yaml';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path configuration
const DATABASE_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'bookclubber.db');
const MIGRATIONS_PATH = process.env.MIGRATIONS_PATH || path.join(process.cwd(), 'migrations.yaml');

/**
 * Initialize the database and run migrations
 * @param dbPath - Optional custom database path
 * @returns DatabaseManager instance
 */
export async function initializeDatabase(dbPath: string = DATABASE_PATH): Promise<DatabaseManager> {
  console.log('Initializing database at:', dbPath);

  // Create database connection
  const db = createNodeDatabase(dbPath);
  const manager = new DatabaseManager(db);

  // Initialize migrations
  const fs = createNodeFileSystem();
  manager.initializeMigrations(fs, {
    migrationsPath: MIGRATIONS_PATH,
    yamlParser: parseYaml,
  });

  // Run migrations based on environment variable
  const migrationTarget = process.env.DATABASE_MIGRATION_TARGET || 'latest';

  if (migrationTarget !== 'skip') {
    console.log(`Running migrations to: ${migrationTarget}`);
    await manager.migrateTo(migrationTarget === 'latest' ? 'latest' : parseInt(migrationTarget));
    console.log('Database migrations completed successfully');
  } else {
    console.log('Skipping migrations (DATABASE_MIGRATION_TARGET=skip)');
  }

  return manager;
}

/**
 * Create a test database instance (in-memory)
 * Useful for testing without affecting the main database
 * @returns DatabaseManager instance for testing
 */
export async function createTestDb(): Promise<DatabaseManager> {
  const db = createNodeTestDatabase();
  const manager = new DatabaseManager(db);

  // Apply schema directly for testing (no migration files needed)
  const schemaPath = path.join(__dirname, 'schema.sql');
  const fs = createNodeFileSystem();
  const schema = await fs.readTextFile(schemaPath);
  manager.applySchema(schema);

  return manager;
}

// Re-export types for convenience
export { DatabaseManager } from '@cytoplum/numtwo';
export type { IDatabase, IStatement } from '@cytoplum/numtwo';
