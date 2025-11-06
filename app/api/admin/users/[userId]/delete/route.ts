import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { requireAdmin } from '@/lib/auth';

/**
 * DELETE /api/admin/users/[userId]/delete
 * Delete a user
 */
export async function DELETE(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        // Verify admin access and get current admin user
        const currentUser = await requireAdmin();

        const success = await AuthService.deleteUser(params.userId, currentUser.id);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete user' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'User deleted successfully',
            userId: params.userId
        });
    } catch (error) {
        console.error('Error deleting user:', error);

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

        if (error instanceof Error && error.message === 'Cannot delete yourself') {
            return NextResponse.json(
                { error: 'Cannot delete yourself' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
