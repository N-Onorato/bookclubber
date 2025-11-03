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

        // Check if there's an active cycle with active phases
        const now = new Date().toISOString();
        const existingActiveWithPhases = db.prepare(`
            SELECT c.id
            FROM cycles c
            INNER JOIN phases p ON c.id = p.cycle_id
            WHERE c.status = 'active'
            AND p.starts_at <= ?
            AND p.ends_at >= ?
            LIMIT 1
        `).get(now, now) as { id: string } | undefined;

        // If previous active cycle has no active phases, set it to completed
        if (!existingActiveWithPhases) {
            db.prepare(`
                UPDATE cycles
                SET status = 'completed', updated_at = ?
                WHERE status = 'active'
            `).run(now);
        }

        const cycleId = randomUUID();

        // Determine initial status: active if no cycle has active phases, otherwise draft
        const initialStatus = existingActiveWithPhases ? 'draft' : 'active';

        const stmt = db.prepare(`
            INSERT INTO cycles (id, name, theme, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            cycleId,
            name || null,
            theme || null,
            initialStatus,
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
     * Check if a cycle has any currently active phases (date-based)
     */
    static async hasActivePhases(cycleId: string): Promise<boolean> {
        const db = getDatabase();
        const now = new Date().toISOString();

        const result = db.prepare(`
            SELECT COUNT(*) as count
            FROM phases
            WHERE cycle_id = ?
              AND starts_at <= ?
              AND ends_at >= ?
        `).get(cycleId, now, now) as { count: number };

        return result.count > 0;
    }
}
