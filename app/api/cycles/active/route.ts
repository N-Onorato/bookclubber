import { NextResponse } from 'next/server';
import { PhaseService } from '@/lib/services/phaseService';
import { CycleService } from '@/lib/services/cycleServiceNew';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/cycles/active - Get the currently active phase and its cycle
 */
export async function GET() {
    try {
        await requireAuth();

        const phase = await PhaseService.getActivePhase();

        if (!phase) {
            return NextResponse.json(
                { error: 'No active phase found' },
                { status: 404 }
            );
        }

        // Get the parent cycle
        const cycle = await CycleService.getCycleById(phase.cycle_id);

        return NextResponse.json({
            phase,
            cycle
        });
    } catch (error: any) {
        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Error fetching active phase:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
