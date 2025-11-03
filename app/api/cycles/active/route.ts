import { NextResponse } from 'next/server';
import { PhaseService } from '@/lib/services/phaseService';
import { CycleService } from '@/lib/services/cycleServiceNew';
import { BookService } from '@/lib/services/bookService';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/cycles/active - Get the currently active cycle with all phases and computed metadata
 */
export async function GET() {
    try {
        await requireAuth();

        // Get the active cycle (status = 'active')
        const cycleWithPhases = await CycleService.getActiveCycle();

        if (!cycleWithPhases) {
            return NextResponse.json(
                { error: 'No active cycle found' },
                { status: 404 }
            );
        }

        const now = new Date();
        const phases = cycleWithPhases.phases || [];

        // Compute metadata about phases
        const currentPhase = phases.find(p => {
            const start = new Date(p.starts_at);
            const end = new Date(p.ends_at);
            return now >= start && now <= end;
        });

        const pastPhases = phases.filter(p => new Date(p.ends_at) < now);
        const futurePhases = phases.filter(p => new Date(p.starts_at) > now);

        const suggestionPhase = phases.find(p => p.type === 'suggestion');
        const votingPhase = phases.find(p => p.type === 'voting');
        const readingPhase = phases.find(p => p.type === 'reading');

        const isSuggestionOpen = suggestionPhase && PhaseService.isPhaseActive(suggestionPhase);
        const isVotingOpen = votingPhase && PhaseService.isPhaseActive(votingPhase);
        const hasVotingEnded = votingPhase && new Date(votingPhase.ends_at) < now;
        const isReading = readingPhase && PhaseService.isPhaseActive(readingPhase);

        // Get winner book details if set
        let winnerBook = null;
        if (cycleWithPhases.winner_book_id) {
            winnerBook = await BookService.getBookById(cycleWithPhases.winner_book_id);
        }

        return NextResponse.json({
            cycle: cycleWithPhases,
            currentPhase,
            pastPhases,
            futurePhases,
            suggestionPhase,
            votingPhase,
            readingPhase,
            isSuggestionOpen,
            isVotingOpen,
            hasVotingEnded,
            isReading,
            winnerBook,
            // Legacy fields for backward compatibility
            phase: currentPhase
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
