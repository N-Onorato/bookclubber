import { NextRequest, NextResponse } from 'next/server';
import { VoteService } from '@/lib/services/voteService';
import { PhaseService } from '@/lib/services/phaseService';
import { CycleService } from '@/lib/services/cycleServiceNew';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db/connection';

export const dynamic = 'force-dynamic';

/**
 * GET /api/votes/results?phaseId=xxx - Get voting results for a phase
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const phaseId = searchParams.get('phaseId');

        if (!phaseId) {
            return NextResponse.json(
                { error: 'Phase ID is required' },
                { status: 400 }
            );
        }

        const phase = await PhaseService.getPhaseById(phaseId);
        if (!phase) {
            return NextResponse.json(
                { error: 'Phase not found' },
                { status: 404 }
            );
        }

        const votingEnded = VoteService.hasVotingEnded(phase.ends_at);

        // Get vote counts for all books
        const voteCounts = await VoteService.getVoteCountsByBook(phaseId);

        // Get winning books
        const { books: winningBooks, voteCount: winningVoteCount } = await VoteService.getWinningBooks(phaseId);

        // Determine if there's a tie
        const isTie = winningBooks.length > 1;

        // Automatically set winner if voting ended and there's no tie
        const cycle = await CycleService.getCycleById(phase.cycle_id);
        if (votingEnded && !isTie && winningBooks.length === 1 && !cycle?.winner_book_id) {
            const winningBookId = winningBooks[0].id;
            await CycleService.setWinningBook(phase.cycle_id, winningBookId);

            // Update the book status to 'reading'
            const db = getDatabase();
            db.prepare(`
                UPDATE books
                SET status = 'reading'
                WHERE id = ?
            `).run(winningBookId);
        }

        // Fetch the updated cycle to get the winner_book_id
        const updatedCycle = await CycleService.getCycleById(phase.cycle_id);

        return NextResponse.json({
            voteCounts,
            winningBooks,
            winningVoteCount,
            isTie,
            votingEnded,
            phase,
            winnerBookId: updatedCycle?.winner_book_id || null
        });
    } catch (error) {
        console.error('Error fetching vote results:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
