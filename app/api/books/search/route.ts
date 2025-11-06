import { NextRequest, NextResponse } from 'next/server';
import { BookService } from '@/lib/services/bookService';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/books/search?q=query - Search for books using Open Library
 */
export async function GET(request: NextRequest) {
    try {
        await requireAuth();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        const books = await BookService.searchBooks(query, limit);

        return NextResponse.json({ books });
    } catch (error: any) {
        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Error searching books:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
