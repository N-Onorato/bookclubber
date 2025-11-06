import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/admin/users/[userId]/reject
 * Reject (delete) a user pending approval
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        // Verify admin access
        await requireAdmin();

        const { userId } = params;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const success = await AuthService.rejectUser(userId);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to reject user. User may not exist or is already approved.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'User rejected successfully' });
    } catch (error) {
        console.error('Error rejecting user:', error);

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