import { randomUUID } from 'crypto';
import { getDatabase } from '../db/connection';
import { Cycle, CycleWithPhases, CycleStatus } from '../types';

export class CycleService {
    /**
     * Create a new cycle
     * NOTE: New cycles become 'active' if no other cycle has active phases
     */
    static async createCycle(
        name?: string,
        theme?: string
    ): Promise<Cycle> {
        const db = getDatabase();

        // Check if there's already an active cycle
        const existingActive = db.prepare(`
            SELECT id, name FROM cycles WHERE status = 'active' LIMIT 1
        `).get() as { id: string; name: string } | undefined;

        if (existingActive) {
            const cycleName = existingActive.name || 'The current cycle';
            throw new Error(`${cycleName} is still active. Please mark it as complete or archived before creating a new cycle.`);
        }

        const cycleId = randomUUID();
        const now = new Date().toISOString();

        // New cycles are always created as 'active'
        const stmt = db.prepare(`
            INSERT INTO cycles (id, name, theme, status, created_at, updated_at)
            VALUES (?, ?, ?, 'active', ?, ?)
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
     * Get all cycles (excludes archived by default)
     */
    static async getAllCycles(includeArchived: boolean = false): Promise<Cycle[]> {
        const db = getDatabase();

        if (includeArchived) {
            return db.prepare('SELECT * FROM cycles ORDER BY created_at DESC').all() as Cycle[];
        }

        return db.prepare(`
            SELECT * FROM cycles
            WHERE status != 'archived'
            ORDER BY created_at DESC
        `).all() as Cycle[];
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
        updates: { name?: string; theme?: string; winner_book_id?: string; status?: CycleStatus }
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
        if (updates.status !== undefined) {
            // If setting to active, ensure no other cycle is active
            if (updates.status === 'active') {
                const existingActive = db.prepare(`
                    SELECT id FROM cycles WHERE status = 'active' AND id != ?
                `).get(cycleId) as Cycle | undefined;

                if (existingActive) {
                    throw new Error('Another cycle is already active. Please complete or archive it first.');
                }
            }

            // If setting to completed or archived, deactivate all phases in this cycle
            if (updates.status === 'completed' || updates.status === 'archived') {
                db.prepare(`
                    UPDATE phases
                    SET is_active = 0
                    WHERE cycle_id = ?
                `).run(cycleId);
            }

            fields.push('status = ?');
            values.push(updates.status);
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
     * Get the current active cycle (based on status = 'active')
     * Returns the active cycle with all its phases
     */
    static async getActiveCycle(): Promise<CycleWithPhases | null> {
        const db = getDatabase();

        // Find the cycle marked as active
        const result = db.prepare(`
            SELECT * FROM cycles
            WHERE status = 'active'
            LIMIT 1
        `).get() as Cycle | undefined;

        if (!result) return null;

        return this.getCycleWithPhases(result.id);
    }

    /**
     * Get the most recently created cycle (regardless of status)
     */
    static async getLatestCycle(): Promise<CycleWithPhases | null> {
        const db = getDatabase();

        const result = db.prepare(`
            SELECT * FROM cycles
            ORDER BY created_at DESC
            LIMIT 1
        `).get() as Cycle | undefined;

        if (!result) return null;

        return this.getCycleWithPhases(result.id);
    }

    /**
     * Get cycles by status
     */
    static async getCyclesByStatus(status: CycleStatus): Promise<CycleWithPhases[]> {
        const db = getDatabase();

        const cycles = db.prepare(`
            SELECT * FROM cycles
            WHERE status = ?
            ORDER BY created_at DESC
        `).all(status) as Cycle[];

        const cyclesWithPhases: CycleWithPhases[] = [];

        for (const cycle of cycles) {
            const withPhases = await this.getCycleWithPhases(cycle.id);
            if (withPhases) {
                cyclesWithPhases.push(withPhases);
            }
        }

        return cyclesWithPhases;
    }

    /**
     * Update cycle status
     * Convenience method for status transitions
     */
    static async updateCycleStatus(cycleId: string, status: CycleStatus): Promise<void> {
        return this.updateCycle(cycleId, { status });
    }

    /**
     * Check if a cycle has any currently active phases (date-based and cycle must be active)
     */
    static async hasActivePhases(cycleId: string): Promise<boolean> {
        const db = getDatabase();
        const now = new Date().toISOString();

        const result = db.prepare(`
            SELECT COUNT(*) as count
            FROM phases p
            INNER JOIN cycles c ON p.cycle_id = c.id
            WHERE p.cycle_id = ?
              AND p.starts_at <= ?
              AND p.ends_at >= ?
              AND c.status = 'active'
        `).get(cycleId, now, now) as { count: number };

        return result.count > 0;
    }
}
