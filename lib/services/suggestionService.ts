import { randomUUID } from 'crypto';
import { getDatabase } from '../db/connection';
import { Suggestion } from '../types';
import { ImageService } from './imageService';

export class SuggestionService {
    /**
     * Create a new book suggestion
     */
    static async createSuggestion(
        phaseId: string,
        userId: string,
        bookId: string,
        reason?: string
    ): Promise<Suggestion | null> {
        try {
            const db = getDatabase();

            // Check if user already suggested this book in this phase
            const existingSuggestion = db.prepare(`
                SELECT id FROM suggestions
                WHERE phase_id = ? AND user_id = ? AND book_id = ?
            `).get(phaseId, userId, bookId);

            if (existingSuggestion) {
                return null; // Already suggested
            }

            const suggestionId = randomUUID();
            const now = new Date().toISOString();

            const stmt = db.prepare(`
                INSERT INTO suggestions (id, phase_id, user_id, book_id, reason, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            stmt.run(suggestionId, phaseId, userId, bookId, reason || null, now, now);

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
     * Get all suggestions for a phase
     */
    static async getSuggestionsByPhase(phaseId: string): Promise<Suggestion[]> {
        const db = getDatabase();
        return db.prepare(`
            SELECT * FROM suggestions
            WHERE phase_id = ?
            ORDER BY created_at ASC
        `).all(phaseId) as Suggestion[];
    }

    /**
     * Get suggestions by user for a phase
     */
    static async getUserSuggestionsForPhase(phaseId: string, userId: string): Promise<Suggestion[]> {
        const db = getDatabase();
        return db.prepare(`
            SELECT * FROM suggestions
            WHERE phase_id = ? AND user_id = ?
            ORDER BY created_at ASC
        `).all(phaseId, userId) as Suggestion[];
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
    static async getSuggestionsWithDetails(phaseId: string): Promise<any[]> {
        const db = getDatabase();
        const suggestions = db.prepare(`
            SELECT
                s.id,
                s.phase_id,
                s.user_id,
                s.book_id,
                s.reason,
                s.created_at,
                s.updated_at,
                b.title,
                b.author,
                b.local_cover_path,
                b.original_cover_url,
                b.cover_url,
                b.description,
                b.page_count,
                u.name as suggested_by
            FROM suggestions s
            JOIN books b ON s.book_id = b.id
            JOIN users u ON s.user_id = u.id
            WHERE s.phase_id = ?
            ORDER BY s.created_at ASC
        `).all(phaseId) as any[];

        // Transform to include proper cover_image_url
        return suggestions.map(suggestion => ({
            ...suggestion,
            cover_image_url: suggestion.local_cover_path
                ? ImageService.getImageUrl(suggestion.local_cover_path)
                : (suggestion.original_cover_url || suggestion.cover_url)
        }));
    }

    /**
     * Get user's suggestion count for a phase
     */
    static async getUserSuggestionCount(phaseId: string, userId: string): Promise<number> {
        const db = getDatabase();
        const result = db.prepare(`
            SELECT COUNT(*) as count
            FROM suggestions
            WHERE phase_id = ? AND user_id = ?
        `).get(phaseId, userId) as { count: number };

        return result.count;
    }

    /**
     * Check if a book has already been suggested in a phase
     */
    static async isBookSuggestedInPhase(phaseId: string, bookId: string): Promise<boolean> {
        const db = getDatabase();
        const result = db.prepare(`
            SELECT COUNT(*) as count
            FROM suggestions
            WHERE phase_id = ? AND book_id = ?
        `).get(phaseId, bookId) as { count: number };

        return result.count > 0;
    }
}
