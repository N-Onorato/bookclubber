import { randomUUID } from 'crypto';
import { getDatabase } from '../db/connection';
import { Vote, VoteWithDetails, Book } from '../types';

export class VoteService {
    /**
     * Cast a vote for a book in a voting phase
     */
    static async castVote(
        phaseId: string,
        userId: string,
        bookId: string
    ): Promise<Vote> {
        const db = getDatabase();

        const voteId = randomUUID();
        const now = new Date().toISOString();

        const stmt = db.prepare(`
            INSERT INTO votes (id, phase_id, user_id, book_id, created_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(voteId, phaseId, userId, bookId, now);

        const vote = db.prepare('SELECT * FROM votes WHERE id = ?').get(voteId) as Vote;
        return vote;
    }

    /**
     * Remove a vote
     */
    static async removeVote(voteId: string): Promise<void> {
        const db = getDatabase();
        db.prepare('DELETE FROM votes WHERE id = ?').run(voteId);
    }

    /**
     * Remove a user's vote for a specific book in a phase
     */
    static async removeUserVoteForBook(
        phaseId: string,
        userId: string,
        bookId: string
    ): Promise<void> {
        const db = getDatabase();
        db.prepare('DELETE FROM votes WHERE phase_id = ? AND user_id = ? AND book_id = ?')
            .run(phaseId, userId, bookId);
    }

    /**
     * Get all votes for a phase
     */
    static async getVotesForPhase(phaseId: string): Promise<Vote[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM votes WHERE phase_id = ?').all(phaseId) as Vote[];
    }

    /**
     * Get votes for a phase with details (book, user info)
     */
    static async getVotesWithDetails(phaseId: string): Promise<VoteWithDetails[]> {
        const db = getDatabase();

        const votes = db.prepare(`
            SELECT
                v.*,
                b.title,
                b.author,
                b.cover_url,
                b.local_cover_path,
                b.description,
                u.name as voter_name
            FROM votes v
            LEFT JOIN books b ON v.book_id = b.id
            LEFT JOIN users u ON v.user_id = u.id
            WHERE v.phase_id = ?
            ORDER BY v.created_at DESC
        `).all(phaseId) as any[];

        return votes;
    }

    /**
     * Get a user's votes in a specific phase
     */
    static async getUserVotesInPhase(phaseId: string, userId: string): Promise<Vote[]> {
        const db = getDatabase();
        return db.prepare(
            'SELECT * FROM votes WHERE phase_id = ? AND user_id = ?'
        ).all(phaseId, userId) as Vote[];
    }

    /**
     * Get count of votes a user has cast in a phase
     */
    static async getUserVoteCount(phaseId: string, userId: string): Promise<number> {
        const db = getDatabase();
        const result = db.prepare(
            'SELECT COUNT(*) as count FROM votes WHERE phase_id = ? AND user_id = ?'
        ).get(phaseId, userId) as { count: number };
        return result.count;
    }

    /**
     * Check if a user has already voted for a specific book in a phase
     */
    static async hasUserVotedForBook(
        phaseId: string,
        userId: string,
        bookId: string
    ): Promise<boolean> {
        const db = getDatabase();
        const result = db.prepare(
            'SELECT COUNT(*) as count FROM votes WHERE phase_id = ? AND user_id = ? AND book_id = ?'
        ).get(phaseId, userId, bookId) as { count: number };
        return result.count > 0;
    }

    /**
     * Get vote counts for all books in a phase (for results)
     */
    static async getVoteCountsByBook(phaseId: string): Promise<{ bookId: string; count: number; book?: Book }[]> {
        const db = getDatabase();

        const results = db.prepare(`
            SELECT
                v.book_id,
                COUNT(*) as count,
                b.title,
                b.author,
                b.cover_url,
                b.local_cover_path,
                b.description,
                b.page_count
            FROM votes v
            LEFT JOIN books b ON v.book_id = b.id
            WHERE v.phase_id = ?
            GROUP BY v.book_id
            ORDER BY count DESC, b.title ASC
        `).all(phaseId) as any[];

        return results.map((r: any) => ({
            bookId: r.book_id,
            count: r.count,
            book: {
                id: r.book_id,
                title: r.title,
                author: r.author,
                cover_url: r.cover_url,
                local_cover_path: r.local_cover_path,
                description: r.description,
                page_count: r.page_count
            } as any
        }));
    }

    /**
     * Get winning book(s) for a phase (handles ties)
     */
    static async getWinningBooks(phaseId: string): Promise<{ books: Book[]; voteCount: number }> {
        const voteCounts = await this.getVoteCountsByBook(phaseId);

        if (voteCounts.length === 0) {
            return { books: [], voteCount: 0 };
        }

        const maxVotes = voteCounts[0].count;
        const winners = voteCounts.filter(v => v.count === maxVotes);

        return {
            books: winners.map(w => w.book!).filter(Boolean),
            voteCount: maxVotes
        };
    }

    /**
     * Get all books that are eligible for voting in a phase
     * (books suggested in the suggestion phase of the same cycle)
     */
    static async getVotableBooks(phaseId: string): Promise<Book[]> {
        const db = getDatabase();

        // Get all unique books from suggestions in this phase
        const books = db.prepare(`
            SELECT DISTINCT b.*
            FROM suggestions s
            JOIN books b ON s.book_id = b.id
            WHERE s.phase_id = ?
            AND b.deleted_at IS NULL
            ORDER BY b.title ASC
        `).all(phaseId) as Book[];

        return books;
    }

    /**
     * Check if voting has ended for a phase
     */
    static hasVotingEnded(phaseEndsAt: string): boolean {
        const now = new Date();
        const endsAt = new Date(phaseEndsAt);
        return now > endsAt;
    }

    /**
     * Get time remaining in milliseconds for a phase
     */
    static getTimeRemaining(phaseEndsAt: string): number {
        const now = new Date();
        const endsAt = new Date(phaseEndsAt);
        return Math.max(0, endsAt.getTime() - now.getTime());
    }
}