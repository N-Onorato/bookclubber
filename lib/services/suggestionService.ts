import { randomUUID } from 'crypto';
import { getDatabase } from '../db/connection';
import { Suggestion } from '../types';

export class SuggestionService {
    /**
     * Create a new book suggestion
     */
    static async createSuggestion(
        cycleId: string,
        userId: string,
        bookId: string,
        reason?: string
    ): Promise<Suggestion | null> {
        try {
            const db = getDatabase();

            // Check if user already suggested this book in this cycle
            const existingSuggestion = db.prepare(`
                SELECT id FROM suggestions
                WHERE cycle_id = ? AND user_id = ? AND book_id = ?
            `).get(cycleId, userId, bookId);

            if (existingSuggestion) {
                return null; // Already suggested
            }

            const suggestionId = randomUUID();
            const now = new Date().toISOString();

            const stmt = db.prepare(`
                INSERT INTO suggestions (id, cycle_id, user_id, book_id, reason, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            stmt.run(suggestionId, cycleId, userId, bookId, reason || null, now, now);

            const suggestion = db.prepare('SELECT * FROM suggestions WHERE id = ?').get(suggestionId) as Suggestion;
            return suggestion;
        } catch (error) {
            console.error('Error creating suggestion:', error);
            return null;
        }
    }

    /**
     * Get suggestion by ID
     */
    static async getSuggestionById(suggestionId: string): Promise<Suggestion | null> {
        const db = getDatabase();
        const suggestion = db.prepare('SELECT * FROM suggestions WHERE id = ?').get(suggestionId) as Suggestion | undefined;
        return suggestion || null;
    }

    /**
     * Get all suggestions for a cycle
     */
    static async getSuggestionsByCycle(cycleId: string): Promise<Suggestion[]> {
        const db = getDatabase();
        return db.prepare(`
            SELECT * FROM suggestions
            WHERE cycle_id = ?
            ORDER BY created_at ASC
        `).all(cycleId) as Suggestion[];
    }

    /**
     * Get suggestions by user for a cycle
     */
    static async getUserSuggestionsForCycle(cycleId: string, userId: string): Promise<Suggestion[]> {
        const db = getDatabase();
        return db.prepare(`
            SELECT * FROM suggestions
            WHERE cycle_id = ? AND user_id = ?
            ORDER BY created_at ASC
        `).all(cycleId, userId) as Suggestion[];
    }

    /**
     * Update suggestion reason
     */
    static async updateSuggestionReason(suggestionId: string, reason: string): Promise<boolean> {
        try {
            const db = getDatabase();
            const now = new Date().toISOString();

            db.prepare(`
                UPDATE suggestions
                SET reason = ?, updated_at = ?
                WHERE id = ?
            `).run(reason, now, suggestionId);

            return true;
        } catch (error) {
            console.error('Error updating suggestion:', error);
            return false;
        }
    }

    /**
     * Delete a suggestion
     */
    static async deleteSuggestion(suggestionId: string, userId: string, isAdmin: boolean = false): Promise<boolean> {
        try {
            const db = getDatabase();

            // Verify the suggestion belongs to the user or user is admin
            const suggestion = await this.getSuggestionById(suggestionId);
            if (!suggestion) {
                return false;
            }

            // Only allow deletion if user owns the suggestion or is an admin
            if (suggestion.user_id !== userId && !isAdmin) {
                return false;
            }

            db.prepare('DELETE FROM suggestions WHERE id = ?').run(suggestionId);
            return true;
        } catch (error) {
            console.error('Error deleting suggestion:', error);
            return false;
        }
    }

    /**
     * Get suggestions with book and user details
     */
    static async getSuggestionsWithDetails(cycleId: string): Promise<any[]> {
        const db = getDatabase();
        return db.prepare(`
            SELECT
                s.id,
                s.cycle_id,
                s.user_id,
                s.book_id,
                s.reason,
                s.created_at,
                s.updated_at,
                b.title,
                b.author,
                b.cover_url as cover_image_url,
                b.description,
                b.page_count,
                u.name as suggested_by
            FROM suggestions s
            JOIN books b ON s.book_id = b.id
            JOIN users u ON s.user_id = u.id
            WHERE s.cycle_id = ?
            ORDER BY s.created_at ASC
        `).all(cycleId) as any[];
    }

    /**
     * Get user's suggestion count for a cycle
     */
    static async getUserSuggestionCount(cycleId: string, userId: string): Promise<number> {
        const db = getDatabase();
        const result = db.prepare(`
            SELECT COUNT(*) as count
            FROM suggestions
            WHERE cycle_id = ? AND user_id = ?
        `).get(cycleId, userId) as { count: number };

        return result.count;
    }

    /**
     * Check if a book has already been suggested in a cycle
     */
    static async isBookSuggestedInCycle(cycleId: string, bookId: string): Promise<boolean> {
        const db = getDatabase();
        const result = db.prepare(`
            SELECT COUNT(*) as count
            FROM suggestions
            WHERE cycle_id = ? AND book_id = ?
        `).get(cycleId, bookId) as { count: number };

        return result.count > 0;
    }
}
