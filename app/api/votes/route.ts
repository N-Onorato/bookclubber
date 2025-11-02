import { NextRequest, NextResponse } from 'next/server';
import { VoteService } from '@/lib/services/voteService';
import { PhaseService } from '@/lib/services/phaseService';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/votes - Cast a vote
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

        const { phaseId, bookId } = await request.json();

        // Validation
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

        // Check if phase is a voting phase
        if (phase.type !== 'voting') {
            return NextResponse.json(
                { error: 'This is not a voting phase' },
                { status: 400 }
            );
        }

        // Check if voting has ended
        if (VoteService.hasVotingEnded(phase.ends_at)) {
            return NextResponse.json(
                { error: 'Voting has ended for this phase' },
                { status: 403 }
            );
        }

        // Check if we're within the phase dates
        if (!PhaseService.isPhaseActive(phase)) {
            return NextResponse.json(
                { error: 'This phase is not currently active (outside date range)' },
                { status: 400 }
            );
        }

        // Check if user has already voted for this book
        const alreadyVoted = await VoteService.hasUserVotedForBook(phaseId, user.id, bookId);
        if (alreadyVoted) {
            return NextResponse.json(
                { error: 'You have already voted for this book' },
                { status: 409 }
            );
        }

        // Check vote limit
        const userVoteCount = await VoteService.getUserVoteCount(phaseId, user.id);
        if (userVoteCount >= phase.max_votes_per_user) {
            return NextResponse.json(
                { error: `You have reached the maximum of ${phase.max_votes_per_user} vote(s) for this phase` },
                { status: 403 }
            );
        }

        const vote = await VoteService.castVote(phaseId, user.id, bookId);

        return NextResponse.json({
            success: true,
            vote
        }, { status: 201 });
    } catch (error) {
        console.error('Error casting vote:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/votes?phaseId=xxx - Get votes for a phase
 * For admins: returns detailed vote information
 * For members: only returns their own votes (during voting) or all results (after voting ends)
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

        // During voting, regular users only see their own votes
        if (!votingEnded && user.role !== 'admin') {
            const userVotes = await VoteService.getUserVotesInPhase(phaseId, user.id);
            return NextResponse.json({
                votes: userVotes,
                userVotesOnly: true
            });
        }

        // After voting ends or for admins, show all votes
        const votes = await VoteService.getVotesForPhase(phaseId);
        return NextResponse.json({
            votes,
            userVotesOnly: false
        });
    } catch (error) {
        console.error('Error fetching votes:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/votes - Remove a vote
 */
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { phaseId, bookId } = await request.json();

        if (!phaseId || !bookId) {
            return NextResponse.json(
                { error: 'Phase ID and Book ID are required' },
                { status: 400 }
            );
        }

        // Check if phase exists and voting hasn't ended
        const phase = await PhaseService.getPhaseById(phaseId);
        if (!phase) {
            return NextResponse.json(
                { error: 'Phase not found' },
                { status: 404 }
            );
        }

        if (VoteService.hasVotingEnded(phase.ends_at)) {
            return NextResponse.json(
                { error: 'Voting has ended, cannot remove votes' },
                { status: 403 }
            );
        }

        await VoteService.removeUserVoteForBook(phaseId, user.id, bookId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing vote:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
