import { NextRequest, NextResponse } from 'next/server';
import { CycleService } from '@/lib/services/cycleServiceNew';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cycles/create - Create a new top-level cycle (admin only)
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const {
            name,
            theme
        } = await request.json();

        // Create the cycle (name and theme are optional)
        const cycle = await CycleService.createCycle(name, theme);

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

        // Check if this is a validation error (like "cycle already active")
        if (error.message && error.message.includes('is still active')) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        console.error('Error creating cycle:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
