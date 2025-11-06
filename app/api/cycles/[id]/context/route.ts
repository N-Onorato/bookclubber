import { NextResponse } from 'next/server';
import { CycleService } from '@/lib/services/cycleServiceNew';
import { PhaseService } from '@/lib/services/phaseService';
import { requireAuth } from '@/lib/auth';
import { getDatabase } from '@/lib/db/connection';
import { CycleContext } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cycles/[id]/context - Get full cycle context with suggestions, votes, and computed states
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireAuth();

        const cycleId = params.id;

        // Get the cycle with all phases
        const cycleWithPhases = await CycleService.getCycleWithPhases(cycleId);

        if (!cycleWithPhases) {
            return NextResponse.json(
                { error: 'Cycle not found' },
                { status: 404 }
            );
        }

        const db = getDatabase();
        const now = new Date();
        const phases = cycleWithPhases.phases || [];

        // Compute phase metadata
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

        const isSuggestionOpen = !!(suggestionPhase && PhaseService.isPhaseActive(suggestionPhase));
        const isVotingOpen = !!(votingPhase && PhaseService.isPhaseActive(votingPhase));
        const hasVotingEnded = !!(votingPhase && new Date(votingPhase.ends_at) < now);
        const isReading = !!(readingPhase && PhaseService.isPhaseActive(readingPhase));

        // Fetch suggestions for this cycle
        let suggestions: any[] = [];
        if (suggestionPhase) {
            suggestions = db.prepare(`
                SELECT
                    s.*,
                    b.title,
                    b.author,
                    b.cover_url,
                    b.local_cover_path,
                    b.description,
                    b.page_count,
                    u.name as suggested_by
                FROM suggestions s
                JOIN books b ON s.book_id = b.id
                JOIN users u ON s.user_id = u.id
                WHERE s.phase_id = ?
                ORDER BY s.created_at ASC
            `).all(suggestionPhase.id);
        }

        // Fetch votes for this cycle
        let votes: any[] = [];
        let votesByBook: Record<string, number> = {};
        if (votingPhase) {
            votes = db.prepare(`
                SELECT
                    v.*,
                    b.title,
                    u.name as voted_by
                FROM votes v
                JOIN books b ON v.book_id = b.id
                JOIN users u ON v.user_id = u.id
                WHERE v.phase_id = ?
            `).all(votingPhase.id);

            // Count votes per book
            votes.forEach((vote: any) => {
                votesByBook[vote.book_id] = (votesByBook[vote.book_id] || 0) + 1;
            });
        }

        // Get winner book details if set
        let winnerBook: any = null;
        if (cycleWithPhases.winner_book_id) {
            winnerBook = db.prepare(`
                SELECT * FROM books WHERE id = ?
            `).get(cycleWithPhases.winner_book_id);
        }

        const context: CycleContext = {
            ...cycleWithPhases,
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
            winnerBook
        };

        return NextResponse.json({
            context,
            suggestions,
            votes,
            votesByBook
        });
    } catch (error: any) {
        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Error fetching cycle context:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
