import { NextRequest, NextResponse } from 'next/server';
import { CycleService } from '@/lib/services/cycleService';
import { requireAuth, requireAdmin } from '@/lib/auth';

/**
 * GET /api/cycles - Get all cycles
 */
export async function GET() {
    try {
        await requireAuth();
        const cycles = await CycleService.getAllCycles();

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
 * POST /api/cycles - Create a new cycle (admin only)
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const {
            type,
            startsAt,
            endsAt,
            theme
        } = await request.json();

        // Validation
        if (!type || !startsAt || !endsAt) {
            return NextResponse.json(
                { error: 'Type, start date, and end date are required' },
                { status: 400 }
            );
        }

        if (type !== 'suggestion' && type !== 'voting') {
            return NextResponse.json(
                { error: 'Type must be either "suggestion" or "voting"' },
                { status: 400 }
            );
        }

        // Validate dates
        const start = new Date(startsAt);
        const end = new Date(endsAt);

        if (end <= start) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        const cycle = await CycleService.createCycle(
            type,
            start,
            end,
            theme
        );

        return NextResponse.json({
            success: true,
            cycle
        }, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Authentication required' || error.message === 'Admin access required') {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            );
        }

        console.error('Error creating cycle:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
