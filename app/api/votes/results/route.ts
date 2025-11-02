import { NextRequest, NextResponse } from 'next/server';
import { VoteService } from '@/lib/services/voteService';
import { PhaseService } from '@/lib/services/phaseService';
import { getCurrentUser } from '@/lib/auth';

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

        return NextResponse.json({
            voteCounts,
            winningBooks,
            winningVoteCount,
            isTie,
            votingEnded,
            phase
        });
    } catch (error) {
        console.error('Error fetching vote results:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
