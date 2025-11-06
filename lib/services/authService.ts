import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { getDatabase } from '../db/connection';
import { User, Session } from '../types';

const SALT_ROUNDS = 10;
const SESSION_DURATION_DAYS = 30;

export class AuthService {
    /**
     * Create a new user
     */
    static async createUser(
        email: string,
        password: string,
        name: string,
        role: 'admin' | 'member' = 'member'
    ): Promise<User | null> {
        try {
            const db = getDatabase();

            // Check if user already exists
            const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
            if (existingUser) {
                return null;
            }

            // Hash password
            const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

            // Create user with UUID
            const userId = randomUUID();
            const now = new Date().toISOString();

            // Admins are auto-approved, members need approval
            const approved = role === 'admin';
            const approved_at = approved ? now : null;

            const stmt = db.prepare(`
                INSERT INTO users (id, email, password_hash, name, role, approved, approved_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            stmt.run(userId, email, password_hash, name, role, approved ? 1 : 0, approved_at, now, now);

            // Fetch and return created user
            const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }

    /**
     * Authenticate user and create session
     */
    static async login(
        email: string,
        password: string
    ): Promise<{ user: User; session: Session } | null> {
        const db = getDatabase();

        // Find user by email
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
        if (!user) {
            return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return null;
        }

        // Create session
        const session = await this.createSession(user.id);

        return { user, session };
    }

    /**
     * Create a new session for a user
     */
    static async createSession(userId: string): Promise<Session> {
        const db = getDatabase();

        const sessionId = randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);
        const now = new Date().toISOString();

        const stmt = db.prepare(`
            INSERT INTO sessions (id, user_id, expires_at, created_at)
            VALUES (?, ?, ?, ?)
        `);

        stmt.run(sessionId, userId, expiresAt.toISOString(), now);

        return {
            id: sessionId,
            user_id: userId,
            expires_at: expiresAt.toISOString(),
            created_at: now,
        };
    }

    /**
     * Validate session and return user
     */
    static async validateSession(sessionId: string): Promise<User | null> {
        const db = getDatabase();

        const session = db.prepare(`
            SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')
        `).get(sessionId) as Session | undefined;

        if (!session) {
            return null;
        }

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as User | undefined;
        return user || null;
    }

    /**
     * Delete a session (logout)
     */
    static async deleteSession(sessionId: string): Promise<void> {
        const db = getDatabase();
        db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    }

    /**
     * Clean up expired sessions
     */
    static async cleanupExpiredSessions(): Promise<void> {
        const db = getDatabase();
        db.prepare(`DELETE FROM sessions WHERE expires_at <= datetime('now')`).run();
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<User | null> {
        const db = getDatabase();
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User | undefined;
        return user || null;
    }

    /**
     * Get all users
     */
    static async getAllUsers(): Promise<User[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM users ORDER BY name').all() as User[];
    }

    /**
     * Get users pending approval
     */
    static async getPendingUsers(): Promise<User[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM users WHERE approved = FALSE ORDER BY created_at DESC').all() as User[];
    }

    /**
     * Approve a user
     */
    static async approveUser(userId: string, approvedByUserId: string): Promise<boolean> {
        try {
            const db = getDatabase();
            const now = new Date().toISOString();

            const stmt = db.prepare(`
                UPDATE users
                SET approved = TRUE, approved_at = ?, approved_by_user_id = ?
                WHERE id = ?
            `);

            const result = stmt.run(now, approvedByUserId, userId);
            return result.changes > 0;
        } catch (error) {
            console.error('Error approving user:', error);
            return false;
        }
    }

    /**
     * Reject (delete) a user
     */
    static async rejectUser(userId: string): Promise<boolean> {
        try {
            const db = getDatabase();

            // Delete the user (cascade will handle sessions)
            const stmt = db.prepare('DELETE FROM users WHERE id = ? AND approved = FALSE');
            const result = stmt.run(userId);

            return result.changes > 0;
        } catch (error) {
            console.error('Error rejecting user:', error);
            return false;
        }
    }

    /**
     * Get all approved users (members and admins)
     */
    static async getApprovedUsers(): Promise<User[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM users WHERE approved = TRUE ORDER BY name').all() as User[];
    }

    /**
     * Update user role
     */
    static async updateUserRole(userId: string, newRole: 'admin' | 'member'): Promise<boolean> {
        try {
            const db = getDatabase();

            const stmt = db.prepare(`
                UPDATE users
                SET role = ?
                WHERE id = ?
            `);

            const result = stmt.run(newRole, userId);
            return result.changes > 0;
        } catch (error) {
            console.error('Error updating user role:', error);
            return false;
        }
    }

    /**
     * Delete user (admin can delete any user except themselves)
     */
    static async deleteUser(userId: string, deletingUserId: string): Promise<boolean> {
        try {
            const db = getDatabase();

            // Prevent self-deletion
            if (userId === deletingUserId) {
                throw new Error('Cannot delete yourself');
            }

            // Delete the user (cascade will handle sessions and related data)
            const stmt = db.prepare('DELETE FROM users WHERE id = ?');
            const result = stmt.run(userId);

            return result.changes > 0;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}