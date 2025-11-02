import { randomUUID } from 'crypto';
import { getDatabase } from '../db/connection';
import { Cycle, CycleWithPhases } from '../types';

export class CycleService {
    /**
     * Create a new cycle
     */
    static async createCycle(
        name?: string,
        theme?: string
    ): Promise<Cycle> {
        const db = getDatabase();

        const cycleId = randomUUID();
        const now = new Date().toISOString();

        const stmt = db.prepare(`
            INSERT INTO cycles (id, name, theme, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(
            cycleId,
            name || null,
            theme || null,
            now,
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
     * Get cycle with its phases
     */
    static async getCycleWithPhases(cycleId: string): Promise<CycleWithPhases | null> {
        const db = getDatabase();

        const cycle = await this.getCycleById(cycleId);
        if (!cycle) return null;

        const phases = db.prepare('SELECT * FROM phases WHERE cycle_id = ? ORDER BY starts_at ASC')
            .all(cycleId);

        return {
            ...cycle,
            phases
        } as CycleWithPhases;
    }

    /**
     * Get all cycles
     */
    static async getAllCycles(): Promise<Cycle[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM cycles ORDER BY created_at DESC').all() as Cycle[];
    }

    /**
     * Get all cycles with their phases
     */
    static async getAllCyclesWithPhases(): Promise<CycleWithPhases[]> {
        const db = getDatabase();

        const cycles = await this.getAllCycles();
        const cyclesWithPhases: CycleWithPhases[] = [];

        for (const cycle of cycles) {
            const phases = db.prepare('SELECT * FROM phases WHERE cycle_id = ? ORDER BY starts_at ASC')
                .all(cycle.id);

            cyclesWithPhases.push({
                ...cycle,
                phases
            } as CycleWithPhases);
        }

        return cyclesWithPhases;
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
     * Update cycle
     */
    static async updateCycle(
        cycleId: string,
        updates: { name?: string; theme?: string; winner_book_id?: string }
    ): Promise<void> {
        const db = getDatabase();

        const fields: string[] = [];
        const values: any[] = [];

        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.theme !== undefined) {
            fields.push('theme = ?');
            values.push(updates.theme);
        }
        if (updates.winner_book_id !== undefined) {
            fields.push('winner_book_id = ?');
            values.push(updates.winner_book_id);
        }

        if (fields.length === 0) return;

        values.push(cycleId);

        db.prepare(`
            UPDATE cycles
            SET ${fields.join(', ')}
            WHERE id = ?
        `).run(...values);
    }

    /**
     * Delete a cycle and all its phases (cascade)
     */
    static async deleteCycle(cycleId: string): Promise<void> {
        const db = getDatabase();

        // Foreign key constraints with ON DELETE CASCADE will automatically handle
        // deletion of phases, and phases will cascade delete suggestions and votes
        db.prepare('DELETE FROM cycles WHERE id = ?').run(cycleId);
    }

    /**
     * Get the current active cycle (based on active phases)
     */
    static async getActiveCycle(): Promise<CycleWithPhases | null> {
        const db = getDatabase();
        const now = new Date().toISOString();

        // Find a cycle that has an active phase
        const result = db.prepare(`
            SELECT DISTINCT c.*
            FROM cycles c
            JOIN phases p ON c.id = p.cycle_id
            WHERE p.starts_at <= ?
              AND p.ends_at >= ?
            ORDER BY p.starts_at DESC
            LIMIT 1
        `).get(now, now) as Cycle | undefined;

        if (!result) return null;

        return this.getCycleWithPhases(result.id);
    }
}
