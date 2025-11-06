import { NextRequest, NextResponse } from 'next/server';
import { SuggestionService } from '@/lib/services/suggestionService';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/suggestions/[id] - Update a suggestion
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { reason } = await request.json();

        if (!reason) {
            return NextResponse.json(
                { error: 'Reason is required' },
                { status: 400 }
            );
        }

        // Verify the suggestion belongs to the user
        const suggestion = await SuggestionService.getSuggestionById(params.id);
        if (!suggestion) {
            return NextResponse.json(
                { error: 'Suggestion not found' },
                { status: 404 }
            );
        }

        if (suggestion.user_id !== user.id) {
            return NextResponse.json(
                { error: 'You can only update your own suggestions' },
                { status: 403 }
            );
        }

        const success = await SuggestionService.updateSuggestionReason(params.id, reason);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to update suggestion' },
                { status: 500 }
            );
        }

        const updatedSuggestion = await SuggestionService.getSuggestionById(params.id);

        return NextResponse.json({
            success: true,
            suggestion: updatedSuggestion
        });
    } catch (error) {
        console.error('Error updating suggestion:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/suggestions/[id] - Delete a suggestion
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const success = await SuggestionService.deleteSuggestion(params.id, user.id, user.role === 'admin');

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete suggestion or suggestion not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Suggestion deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting suggestion:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
