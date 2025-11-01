import { randomUUID } from 'crypto';
import { getDatabase } from '../db/connection';
import { Cycle } from '../types';

export class CycleService {
    /**
     * Create a new cycle (suggestion or voting)
     */
    static async createCycle(
        type: 'suggestion' | 'voting',
        startsAt: Date,
        endsAt: Date,
        theme?: string
    ): Promise<Cycle> {
        const db = getDatabase();

        const cycleId = randomUUID();
        const now = new Date().toISOString();

        const stmt = db.prepare(`
            INSERT INTO cycles (
                id, type, theme, starts_at, ends_at, is_active, created_at
            )
            VALUES (?, ?, ?, ?, ?, FALSE, ?)
        `);

        stmt.run(
            cycleId,
            type,
            theme || null,
            startsAt.toISOString(),
            endsAt.toISOString(),
            now
        );

        const cycle = db.prepare('SELECT * FROM cycles WHERE id = ?').get(cycleId) as Cycle;
        return cycle;
    }

    /**
     * Get cycle by ID
     */
    static async getCycleById(cycleId: string): Promise<Cycle | null> {
        const db = getDatabase();
        const cycle = db.prepare('SELECT * FROM cycles WHERE id = ?').get(cycleId) as Cycle | undefined;
        return cycle || null;
    }

    /**
     * Get all cycles
     */
    static async getAllCycles(): Promise<Cycle[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM cycles ORDER BY created_at DESC').all() as Cycle[];
    }

    /**
     * Get active suggestion cycle (based on dates only)
     */
    static async getActiveSuggestionCycle(): Promise<Cycle | null> {
        const db = getDatabase();
        const now = new Date().toISOString();

        const cycle = db.prepare(`
            SELECT * FROM cycles
            WHERE type = 'suggestion'
            AND starts_at <= ?
            AND ends_at >= ?
            ORDER BY starts_at DESC
            LIMIT 1
        `).get(now, now) as Cycle | undefined;

        return cycle || null;
    }

    /**
     * Get active voting cycle (based on dates only)
     */
    static async getActiveVotingCycle(): Promise<Cycle | null> {
        const db = getDatabase();
        const now = new Date().toISOString();

        const cycle = db.prepare(`
            SELECT * FROM cycles
            WHERE type = 'voting'
            AND starts_at <= ?
            AND ends_at >= ?
            ORDER BY starts_at DESC
            LIMIT 1
        `).get(now, now) as Cycle | undefined;

        return cycle || null;
    }

    /**
     * Get any active cycle
     */
    static async getActiveCycle(): Promise<{ cycle: Cycle; phase: string } | null> {
        // First check for suggestion cycle
        const suggestionCycle = await this.getActiveSuggestionCycle();
        if (suggestionCycle) {
            return { cycle: suggestionCycle, phase: 'suggestion' };
        }

        // Then check for voting cycle
        const votingCycle = await this.getActiveVotingCycle();
        if (votingCycle) {
            return { cycle: votingCycle, phase: 'voting' };
        }

        return null;
    }

    /**
     * Check if cycle is currently active (within date range)
     */
    static isCycleActive(cycle: Cycle): boolean {
        const now = new Date();
        const startsAt = new Date(cycle.starts_at);
        const endsAt = new Date(cycle.ends_at);

        return now >= startsAt && now <= endsAt;
    }

    /**
     * Activate a cycle
     */
    static async activateCycle(cycleId: string): Promise<void> {
        const db = getDatabase();

        db.prepare(`
            UPDATE cycles
            SET is_active = TRUE
            WHERE id = ?
        `).run(cycleId);
    }

    /**
     * Deactivate a cycle
     */
    static async deactivateCycle(cycleId: string): Promise<void> {
        const db = getDatabase();

        db.prepare(`
            UPDATE cycles
            SET is_active = FALSE
            WHERE id = ?
        `).run(cycleId);
    }

    /**
     * Set winning book for a cycle
     */
    static async setWinningBook(cycleId: string, bookId: string): Promise<void> {
        const db = getDatabase();

        db.prepare(`
            UPDATE cycles
            SET winner_book_id = ?
            WHERE id = ?
        `).run(bookId, cycleId);
    }

    /**
     * Get cycles by type
     */
    static async getCyclesByType(type: 'suggestion' | 'voting'): Promise<Cycle[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM cycles WHERE type = ? ORDER BY created_at DESC').all(type) as Cycle[];
    }
}
