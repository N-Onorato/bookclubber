import { randomUUID } from 'crypto';
import { getDatabase } from '../db/connection';
import { Phase, PhaseType } from '../types';

export class PhaseService {
    /**
     * Create a new phase (suggestion, voting, or reading)
     */
    static async createPhase(
        cycleId: string,
        type: PhaseType,
        startsAt: Date,
        endsAt: Date,
        theme?: string,
        maxSuggestionsPerUser: number = 3,
        maxVotesPerUser: number = 3
    ): Promise<Phase> {
        const db = getDatabase();

        const phaseId = randomUUID();
        const now = new Date().toISOString();

        const stmt = db.prepare(`
            INSERT INTO phases (
                id, cycle_id, type, theme, starts_at, ends_at, is_active,
                max_suggestions_per_user, max_votes_per_user, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, FALSE, ?, ?, ?)
        `);

        stmt.run(
            phaseId,
            cycleId,
            type,
            theme || null,
            startsAt.toISOString(),
            endsAt.toISOString(),
            maxSuggestionsPerUser,
            maxVotesPerUser,
            now
        );

        const phase = db.prepare('SELECT * FROM phases WHERE id = ?').get(phaseId) as Phase;
        return phase;
    }

    /**
     * Get phase by ID
     */
    static async getPhaseById(phaseId: string): Promise<Phase | null> {
        const db = getDatabase();
        const phase = db.prepare('SELECT * FROM phases WHERE id = ?').get(phaseId) as Phase | undefined;
        return phase || null;
    }

    /**
     * Get all phases
     */
    static async getAllPhases(): Promise<Phase[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM phases ORDER BY created_at DESC').all() as Phase[];
    }

    /**
     * Get all phases for a specific cycle
     */
    static async getPhasesByCycle(cycleId: string): Promise<Phase[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM phases WHERE cycle_id = ? ORDER BY starts_at ASC').all(cycleId) as Phase[];
    }

    /**
     * Get active suggestion phase (based on dates and cycle status)
     */
    static async getActiveSuggestionPhase(): Promise<Phase | null> {
        const db = getDatabase();
        const now = new Date().toISOString();

        const phase = db.prepare(`
            SELECT p.* FROM phases p
            INNER JOIN cycles c ON p.cycle_id = c.id
            WHERE p.type = 'suggestion'
            AND p.starts_at <= ?
            AND p.ends_at >= ?
            AND c.status = 'active'
            ORDER BY p.starts_at DESC
            LIMIT 1
        `).get(now, now) as Phase | undefined;

        return phase || null;
    }

    /**
     * Get active voting phase (based on dates and cycle status)
     */
    static async getActiveVotingPhase(): Promise<Phase | null> {
        const db = getDatabase();
        const now = new Date().toISOString();

        const phase = db.prepare(`
            SELECT p.* FROM phases p
            INNER JOIN cycles c ON p.cycle_id = c.id
            WHERE p.type = 'voting'
            AND p.starts_at <= ?
            AND p.ends_at >= ?
            AND c.status = 'active'
            ORDER BY p.starts_at DESC
            LIMIT 1
        `).get(now, now) as Phase | undefined;

        return phase || null;
    }

    /**
     * Get any active phase
     * Priority: suggestion > voting > reading
     */
    static async getActivePhase(): Promise<Phase | null> {
        // First check for suggestion phase
        const suggestionPhase = await this.getActiveSuggestionPhase();
        if (suggestionPhase) {
            return suggestionPhase;
        }

        // Then check for voting phase
        const votingPhase = await this.getActiveVotingPhase();
        if (votingPhase) {
            return votingPhase;
        }

        // Finally check for reading phase
        const readingPhase = await this.getActiveReadingPhase();
        if (readingPhase) {
            return readingPhase;
        }

        return null;
    }

    /**
     * Check if phase is currently active (within date range)
     */
    static isPhaseActive(phase: Phase): boolean {
        const now = new Date();
        const startsAt = new Date(phase.starts_at);
        const endsAt = new Date(phase.ends_at);

        return now >= startsAt && now <= endsAt;
    }

    /**
     * Activate a phase
     */
    static async activatePhase(phaseId: string): Promise<void> {
        const db = getDatabase();

        db.prepare(`
            UPDATE phases
            SET is_active = TRUE
            WHERE id = ?
        `).run(phaseId);
    }

    /**
     * Deactivate a phase
     */
    static async deactivatePhase(phaseId: string): Promise<void> {
        const db = getDatabase();

        db.prepare(`
            UPDATE phases
            SET is_active = FALSE
            WHERE id = ?
        `).run(phaseId);
    }

    /**
     * Get active reading phase (based on dates and cycle status)
     */
    static async getActiveReadingPhase(): Promise<Phase | null> {
        const db = getDatabase();
        const now = new Date().toISOString();

        const phase = db.prepare(`
            SELECT p.* FROM phases p
            INNER JOIN cycles c ON p.cycle_id = c.id
            WHERE p.type = 'reading'
            AND p.starts_at <= ?
            AND p.ends_at >= ?
            AND c.status = 'active'
            ORDER BY p.starts_at DESC
            LIMIT 1
        `).get(now, now) as Phase | undefined;

        return phase || null;
    }

    /**
     * Get phases by type
     */
    static async getPhasesByType(type: PhaseType): Promise<Phase[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM phases WHERE type = ? ORDER BY created_at DESC').all(type) as Phase[];
    }

    /**
     * Delete a phase and all its dependent data (suggestions, votes)
     * Note: This uses CASCADE DELETE defined in the schema for suggestions and votes
     */
    static async deletePhase(phaseId: string): Promise<void> {
        const db = getDatabase();

        // Foreign key constraints with ON DELETE CASCADE will automatically handle
        // deletion of suggestions and votes
        db.prepare('DELETE FROM phases WHERE id = ?').run(phaseId);
    }

    /**
     * Get the suggestion phase for a voting phase (within the same cycle)
     */
    static async getSuggestionPhaseForVoting(votingPhaseId: string): Promise<Phase | null> {
        const db = getDatabase();

        const result = db.prepare(`
            SELECT p2.*
            FROM phases p1
            JOIN phases p2 ON p1.cycle_id = p2.cycle_id
            WHERE p1.id = ?
              AND p1.type = 'voting'
              AND p2.type = 'suggestion'
            ORDER BY p2.starts_at DESC
            LIMIT 1
        `).get(votingPhaseId) as Phase | undefined;

        return result || null;
    }
}
