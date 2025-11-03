import { NextRequest, NextResponse } from 'next/server';
import { CycleService } from '@/lib/services/cycleServiceNew';
import { PhaseService } from '@/lib/services/phaseService';
import { requireAuth, requireAdmin } from '@/lib/auth';

/**
 * GET /api/cycles - Get all cycles with their phases
 */
export async function GET() {
    try {
        await requireAuth();
        const cycles = await CycleService.getAllCyclesWithPhases();

        return NextResponse.json({ cycles });
    } catch (error) {
        console.error('Error fetching cycles:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/cycles - Create a new phase within a cycle (admin only)
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const {
            cycleId,
            type,
            startsAt,
            endsAt,
            theme,
            maxSuggestionsPerUser,
            maxVotesPerUser
        } = await request.json();

        // Validation
        if (!cycleId || !type || !startsAt || !endsAt) {
            return NextResponse.json(
                { error: 'Cycle ID, type, start date, and end date are required' },
                { status: 400 }
            );
        }

        if (type !== 'suggestion' && type !== 'voting' && type !== 'reading') {
            return NextResponse.json(
                { error: 'Type must be either "suggestion", "voting", or "reading"' },
                { status: 400 }
            );
        }

        // Verify cycle exists
        const cycle = await CycleService.getCycleById(cycleId);
        if (!cycle) {
            return NextResponse.json(
                { error: 'Cycle not found' },
                { status: 404 }
            );
        }

        // Validate dates (skip for reading phases as they have no inherent time information)
        const start = new Date(startsAt);
        const end = new Date(endsAt);

        if (type !== 'reading' && end <= start) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        // Validate max values (optional, defaults to 3)
        const maxSuggestions = maxSuggestionsPerUser ?? 3;
        const maxVotes = maxVotesPerUser ?? 3;

        if (maxSuggestions < 1 || maxVotes < 1) {
            return NextResponse.json(
                { error: 'Max suggestions and votes must be at least 1' },
                { status: 400 }
            );
        }

        const phase = await PhaseService.createPhase(
            cycleId,
            type,
            start,
            end,
            theme,
            maxSuggestions,
            maxVotes
        );

        return NextResponse.json({
            success: true,
            phase
        }, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Authentication required' || error.message === 'Admin access required') {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            );
        }

        console.error('Error creating phase:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
