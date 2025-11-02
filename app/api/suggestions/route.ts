import { NextRequest, NextResponse } from 'next/server';
import { SuggestionService } from '@/lib/services/suggestionService';
import { CycleService } from '@/lib/services/cycleService';
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

        const { cycleId, bookId, reason } = await request.json();

        // Validation
        if (!cycleId || !bookId) {
            return NextResponse.json(
                { error: 'Cycle ID and Book ID are required' },
                { status: 400 }
            );
        }

        // Check if cycle exists and is active
        const cycle = await CycleService.getCycleById(cycleId);
        if (!cycle) {
            return NextResponse.json(
                { error: 'Cycle not found' },
                { status: 404 }
            );
        }

        // Check if cycle is a suggestion cycle
        if (cycle.type !== 'suggestion') {
            return NextResponse.json(
                { error: 'This is not a suggestion cycle' },
                { status: 400 }
            );
        }

        // Check if we're within the cycle dates
        if (!CycleService.isCycleActive(cycle)) {
            return NextResponse.json(
                { error: 'This cycle is not currently active (outside date range)' },
                { status: 400 }
            );
        }

        // Check suggestion limit for non-admin users
        if (user.role !== 'admin') {
            const userSuggestionCount = await SuggestionService.getUserSuggestionCount(cycleId, user.id);
            if (userSuggestionCount >= cycle.max_suggestions_per_user) {
                return NextResponse.json(
                    { error: `You have reached the maximum of ${cycle.max_suggestions_per_user} suggestion(s) for this cycle` },
                    { status: 403 }
                );
            }
        }

        // Check if book already suggested in this cycle
        const alreadySuggested = await SuggestionService.isBookSuggestedInCycle(cycleId, bookId);
        if (alreadySuggested) {
            return NextResponse.json(
                { error: 'This book has already been suggested in this cycle' },
                { status: 409 }
            );
        }

        const suggestion = await SuggestionService.createSuggestion(
            cycleId,
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
 * GET /api/suggestions?cycleId=xxx - Get suggestions for a cycle
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
        const cycleId = searchParams.get('cycleId');

        if (!cycleId) {
            return NextResponse.json(
                { error: 'Cycle ID is required' },
                { status: 400 }
            );
        }

        const suggestions = await SuggestionService.getSuggestionsWithDetails(cycleId);

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
