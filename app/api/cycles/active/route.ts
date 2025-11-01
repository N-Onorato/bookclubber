import { NextResponse } from 'next/server';
import { CycleService } from '@/lib/services/cycleService';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/cycles/active - Get the currently active cycle
 */
export async function GET() {
    try {
        await requireAuth();

        const result = await CycleService.getActiveCycle();

        if (!result) {
            return NextResponse.json(
                { error: 'No active cycle found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            cycle: result.cycle,
            phase: result.phase
        });
    } catch (error: any) {
        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Error fetching active cycle:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
