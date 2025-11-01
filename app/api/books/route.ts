import { NextRequest, NextResponse } from 'next/server';
import { BookService } from '@/lib/services/bookService';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/books - Get all books
 */
export async function GET() {
    try {
        await requireAuth();

        const books = await BookService.getAllBooks();

        return NextResponse.json({ books });
    } catch (error: any) {
        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Error fetching books:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/books - Create a book from external source (e.g., Open Library)
 */
export async function POST(request: NextRequest) {
    try {
        await requireAuth();

        const { openLibraryId } = await request.json();

        if (!openLibraryId) {
            return NextResponse.json(
                { error: 'Open Library ID is required' },
                { status: 400 }
            );
        }

        // Check if book already exists
        const existingBook = await BookService.getBookBySource('openlibrary', openLibraryId);
        if (existingBook) {
            return NextResponse.json({
                success: true,
                book: existingBook,
                message: 'Book already exists'
            });
        }

        // Fetch book details from Open Library
        const bookData = await BookService.getBookFromOpenLibrary(openLibraryId);

        if (!bookData) {
            return NextResponse.json(
                { error: 'Failed to fetch book from Open Library' },
                { status: 404 }
            );
        }

        // Create book in database with source tracking
        const book = await BookService.createOrUpdateBook({
            source: 'openlibrary',
            sourceId: bookData.openLibraryId,
            title: bookData.title,
            author: bookData.author,
            coverImageUrl: bookData.coverImageUrl,
            description: bookData.description,
            publishYear: bookData.publishYear
        });

        return NextResponse.json({
            success: true,
            book
        }, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Error creating book:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
