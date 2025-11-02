import { NextRequest, NextResponse } from 'next/server';
import { CycleService } from '@/lib/services/cycleServiceNew';
import { PhaseService } from '@/lib/services/phaseService';
import { requireAuth, requireAdmin } from '@/lib/auth';

/**
 * GET /api/cycles/[id] - Get a specific cycle with its phases
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAuth();

        const cycle = await CycleService.getCycleWithPhases(params.id);

        if (!cycle) {
            return NextResponse.json(
                { error: 'Cycle not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ cycle });
    } catch (error: any) {
        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Error fetching cycle:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/cycles/[id] - Update cycle (admin only)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();

        const { name, theme, winningBookId } = await request.json();

        const updates: { name?: string; theme?: string; winner_book_id?: string } = {};

        if (name !== undefined) {
            updates.name = name;
        }

        if (theme !== undefined) {
            updates.theme = theme;
        }

        if (winningBookId !== undefined) {
            updates.winner_book_id = winningBookId;
        }

        await CycleService.updateCycle(params.id, updates);

        const cycle = await CycleService.getCycleWithPhases(params.id);

        return NextResponse.json({
            success: true,
            cycle
        });
    } catch (error: any) {
        if (error.message === 'Authentication required' || error.message === 'Admin access required') {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            );
        }

        console.error('Error updating cycle:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/cycles/[id] - Delete a cycle and all its phases (admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();

        // Check if cycle exists
        const cycle = await CycleService.getCycleById(params.id);
        if (!cycle) {
            return NextResponse.json(
                { error: 'Cycle not found' },
                { status: 404 }
            );
        }

        // Delete the cycle (CASCADE will delete phases, and phases will cascade delete suggestions and votes)
        await CycleService.deleteCycle(params.id);

        return NextResponse.json({
            success: true,
            message: 'Cycle deleted successfully'
        });
    } catch (error: any) {
        if (error.message === 'Authentication required' || error.message === 'Admin access required') {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            );
        }

        console.error('Error deleting cycle:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
