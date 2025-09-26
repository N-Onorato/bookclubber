import Database from "better-sqlite3";
import NodeCache from "node-cache";

let db: Database.Database | null = null;
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

export function getDatabase(): Database.Database {
    if (!db) {
        const dbPath = process.env.DATABASE_PATH || "./data/bookclub.db";
        db = new Database(dbPath);
        db.pragma("journal_mode = WAL");
    }
    return db;
}

export class DatabaseService {
    static get<T = any>(sql: string, params: any[] = []): T | undefined {
        return getDatabase().prepare(sql).get(params) as T | undefined;
    }

    static all<T = any>(sql: string, params: any[] = []): T[] {
        return getDatabase().prepare(sql).all(params) as T[];
    }

    static run(sql: string, params: any[] = []) {
        return getDatabase().prepare(sql).run(params);
    }

    // Cache methods
    static getCached<T = any>(key: string): T | undefined {
        return cache.get<T>(key);
    }

    static setCached<T = any>(key: string, value: T, ttl = 3600): boolean {
        return cache.set(key, value, ttl);
    }
}