import { NextRequest, NextResponse } from 'next/server';
import { BookService } from '@/lib/services/bookService';
import { GoogleBooksService } from '@/lib/services/googleBooksService';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug/books - Debug endpoint for book search testing
 * Requires ENABLE_DEBUG_FEATURES=true in environment
 */
export async function GET(request: NextRequest) {
    try {
        // Check if debug features are enabled
        if (process.env.ENABLE_DEBUG_FEATURES !== 'true') {
            return NextResponse.json(
                { error: 'Debug features not enabled' },
                { status: 403 }
            );
        }

        await requireAuth();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || 'dune';
        const isbn = searchParams.get('isbn');

        const results: any = {
            timestamp: new Date().toISOString(),
            query,
            googleBooksEnabled: GoogleBooksService.isEnabled(),
            tests: {},
        };

        // Test 1: Open Library search
        try {
            const openLibraryStart = Date.now();
            const openLibraryResults = await BookService.searchBooks(query, 5);
            results.tests.openLibrary = {
                success: true,
                duration: Date.now() - openLibraryStart,
                resultCount: openLibraryResults.length,
                results: openLibraryResults,
            };
        } catch (error: any) {
            results.tests.openLibrary = {
                success: false,
                error: error.message,
            };
        }

        // Test 2: Google Books search (if enabled)
        if (GoogleBooksService.isEnabled()) {
            try {
                const googleStart = Date.now();
                const googleResults = await GoogleBooksService.searchBooks(query, 5);
                results.tests.googleBooks = {
                    success: true,
                    duration: Date.now() - googleStart,
                    resultCount: googleResults.length,
                    results: googleResults,
                };
            } catch (error: any) {
                results.tests.googleBooks = {
                    success: false,
                    error: error.message,
                };
            }

            // Test 3: ISBN search (if provided)
            if (isbn) {
                try {
                    const isbnStart = Date.now();
                    const isbnResult = await GoogleBooksService.searchByISBN(isbn);
                    results.tests.isbnSearch = {
                        success: true,
                        duration: Date.now() - isbnStart,
                        found: !!isbnResult,
                        result: isbnResult,
                    };
                } catch (error: any) {
                    results.tests.isbnSearch = {
                        success: false,
                        error: error.message,
                    };
                }
            }
        } else {
            results.tests.googleBooks = {
                success: false,
                error: 'Google Books API not enabled (GOOGLE_API_KEY not set)',
            };
        }

        // Test 4: Unified search
        try {
            const unifiedStart = Date.now();
            const unifiedResults = await BookService.searchBooksUnified(query, 5);
            results.tests.unifiedSearch = {
                success: true,
                duration: Date.now() - unifiedStart,
                resultCount: unifiedResults.length,
                results: unifiedResults,
            };
        } catch (error: any) {
            results.tests.unifiedSearch = {
                success: false,
                error: error.message,
            };
        }

        return NextResponse.json(results);
    } catch (error: any) {
        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Error in debug endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
