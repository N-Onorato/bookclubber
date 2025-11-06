import { cookies } from 'next/headers';
import { AuthService } from './services/authService';
import { User } from './types';

/**
 * Get the current user from the session cookie
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        if (!sessionId) {
            return null;
        }

        const user = await AuthService.validateSession(sessionId);
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser();
    return user !== null;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === 'admin';
}

/**
 * Require authentication - throws if not authenticated or not approved
 */
export async function requireAuth(): Promise<User> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Authentication required');
    }
    if (!user.approved) {
        throw new Error('Account pending approval');
    }
    return user;
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<User> {
    const user = await requireAuth();
    if (user.role !== 'admin') {
        throw new Error('Admin access required');
    }
    return user;
}
