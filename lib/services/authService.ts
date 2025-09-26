import bcrypt from 'bcrypt';
import { DatabaseService } from '../db/connection';
import { User } from '../types';

export class AuthService {
    static async authenticateUser(email: string, password: string): Promise<User | null> {
        const user = DatabaseService.get<User>(
            'SELECT * FROM users WHERE email = ? AND is_active = 1',
            [email]
        );

        if (!user) {
            return null;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return null;
        }

        return user;
    }

    static async createUser(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        role: 'admin' | 'member' = 'member'
    ): Promise<User | null> {
        try {
            // Check if user already exists
            const existingUser = DatabaseService.get(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUser) {
                return null; // User already exists
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Insert new user
            const result = DatabaseService.run(
                `INSERT INTO users (email, password_hash, first_name, last_name, role) 
                 VALUES (?, ?, ?, ?, ?)`,
                [email, passwordHash, firstName, lastName, role]
            );

            // Get the created user
            const userId = result.lastInsertRowid;
            const user = DatabaseService.get<User>(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );

            return user || null;
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }

    static getUserById(id: number): User | null {
        return DatabaseService.get<User>(
            'SELECT * FROM users WHERE id = ? AND is_active = 1',
            [id]
        ) || null;
    }

    static getAllUsers(): User[] {
        return DatabaseService.all<User>(
            'SELECT * FROM users WHERE is_active = 1 ORDER BY first_name, last_name'
        );
    }
}