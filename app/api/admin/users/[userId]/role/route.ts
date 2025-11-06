import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { requireAdmin } from '@/lib/auth';

/**
 * PATCH /api/admin/users/[userId]/role
 * Update a user's role
 */
export async function PATCH(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        // Verify admin access
        await requireAdmin();

        const { role } = await request.json();

        // Validate role
        if (!role || (role !== 'admin' && role !== 'member')) {
            return NextResponse.json(
                { error: 'Invalid role. Must be "admin" or "member"' },
                { status: 400 }
            );
        }

        const success = await AuthService.updateUserRole(params.userId, role);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to update user role' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'User role updated successfully',
            userId: params.userId,
            newRole: role
        });
    } catch (error) {
        console.error('Error updating user role:', error);

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
