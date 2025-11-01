import { NextRequest, NextResponse } from 'next/server';
import { CycleService } from '@/lib/services/cycleService';
import { requireAuth, requireAdmin } from '@/lib/auth';

/**
 * GET /api/cycles/[id] - Get a specific cycle
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAuth();

        const cycle = await CycleService.getCycleById(params.id);

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

        const { isActive, winningBookId } = await request.json();

        if (typeof isActive === 'boolean') {
            if (isActive) {
                await CycleService.activateCycle(params.id);
            } else {
                await CycleService.deactivateCycle(params.id);
            }
        }

        if (winningBookId) {
            await CycleService.setWinningBook(params.id, winningBookId);
        }

        const cycle = await CycleService.getCycleById(params.id);

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
