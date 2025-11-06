import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/users
 * Get all approved users (members)
 */
export async function GET() {
    try {
        // Verify admin access
        await requireAdmin();

        const users = await AuthService.getApprovedUsers();

        // Remove password hashes from response
        const sanitizedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            approved: user.approved,
            approved_at: user.approved_at,
            created_at: user.created_at
        }));

        return NextResponse.json({ users: sanitizedUsers });
    } catch (error) {
        console.error('Error fetching users:', error);

        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        if (error instanceof Error && error.message === 'Admin access required') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
