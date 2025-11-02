import { NextRequest, NextResponse } from 'next/server';
import { SuggestionService } from '@/lib/services/suggestionService';
import { PhaseService } from '@/lib/services/phaseService';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/suggestions - Create a new suggestion
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

        const { phaseId, bookId, reason } = await request.json();

        // Validation
        if (!phaseId || !bookId) {
            return NextResponse.json(
                { error: 'Phase ID and Book ID are required' },
                { status: 400 }
            );
        }

        // Check if phase exists and is active
        const phase = await PhaseService.getPhaseById(phaseId);
        if (!phase) {
            return NextResponse.json(
                { error: 'Phase not found' },
                { status: 404 }
            );
        }

        // Check if phase is a suggestion phase
        if (phase.type !== 'suggestion') {
            return NextResponse.json(
                { error: 'This is not a suggestion phase' },
                { status: 400 }
            );
        }

        // Check if we're within the phase dates
        if (!PhaseService.isPhaseActive(phase)) {
            return NextResponse.json(
                { error: 'This phase is not currently active (outside date range)' },
                { status: 400 }
            );
        }

        // Check suggestion limit for non-admin users
        if (user.role !== 'admin') {
            const userSuggestionCount = await SuggestionService.getUserSuggestionCount(phaseId, user.id);
            if (userSuggestionCount >= phase.max_suggestions_per_user) {
                return NextResponse.json(
                    { error: `You have reached the maximum of ${phase.max_suggestions_per_user} suggestion(s) for this phase` },
                    { status: 403 }
                );
            }
        }

        // Check if book already suggested in this phase
        const alreadySuggested = await SuggestionService.isBookSuggestedInPhase(phaseId, bookId);
        if (alreadySuggested) {
            return NextResponse.json(
                { error: 'This book has already been suggested in this phase' },
                { status: 409 }
            );
        }

        const suggestion = await SuggestionService.createSuggestion(
            phaseId,
            user.id,
            bookId,
            reason
        );

        if (!suggestion) {
            return NextResponse.json(
                { error: 'Failed to create suggestion' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            suggestion
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating suggestion:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/suggestions?phaseId=xxx - Get suggestions for a phase
 * If phaseId is a voting phase, automatically finds and returns suggestions from the related suggestion phase
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
        let phaseId = searchParams.get('phaseId');

        if (!phaseId) {
            return NextResponse.json(
                { error: 'Phase ID is required' },
                { status: 400 }
            );
        }

        // Check if this is a voting phase - if so, get the related suggestion phase
        const phase = await PhaseService.getPhaseById(phaseId);
        if (phase && phase.type === 'voting') {
            // Find the suggestion phase for this voting phase
            const suggestionPhase = await PhaseService.getSuggestionPhaseForVoting(phaseId);
            if (suggestionPhase) {
                phaseId = suggestionPhase.id;
            }
        }

        const suggestions = await SuggestionService.getSuggestionsWithDetails(phaseId);

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
