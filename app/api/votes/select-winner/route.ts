import { NextRequest, NextResponse } from 'next/server';
import { CycleService } from '@/lib/services/cycleServiceNew';
import { PhaseService } from '@/lib/services/phaseService';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db/connection';

/**
 * POST /api/votes/select-winner - Admin selects winner when there's a tie
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Only admins can select winners
        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { phaseId, bookId } = await request.json();

        if (!phaseId || !bookId) {
            return NextResponse.json(
                { error: 'Phase ID and Book ID are required' },
                { status: 400 }
            );
        }

        // Check if phase exists
        const phase = await PhaseService.getPhaseById(phaseId);
        if (!phase) {
            return NextResponse.json(
                { error: 'Phase not found' },
                { status: 404 }
            );
        }

        // Set the winning book on the cycle
        await CycleService.setWinningBook(phase.cycle_id, bookId);

        // Update the book status to 'reading'
        const db = getDatabase();
        db.prepare(`
            UPDATE books
            SET status = 'reading'
            WHERE id = ?
        `).run(bookId);

        return NextResponse.json({
            success: true,
            message: 'Winner selected successfully'
        });
    } catch (error) {
        console.error('Error selecting winner:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
