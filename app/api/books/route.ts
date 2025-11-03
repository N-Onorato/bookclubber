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
 * POST /api/books - Create a book from external source OR manually
 *
 * Supports two modes:
 * 1. From Open Library: { openLibraryId, coverImageUrl? }
 * 2. Manual entry: { title, author, isbn?, description?, pageCount?, publishYear?, coverImageUrl? }
 */
export async function POST(request: NextRequest) {
    try {
        await requireAuth();

        const body = await request.json();
        const { openLibraryId, title, author, isbn, description, pageCount, publishYear, coverImageUrl, coverImagePath } = body;

        // Mode 1: Create from Open Library
        if (openLibraryId) {
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
            // Use cover URL from search results if available, otherwise use the one from work data
            const book = await BookService.createOrUpdateBook({
                source: 'openlibrary',
                sourceId: bookData.openLibraryId,
                title: bookData.title,
                author: bookData.author,
                coverImageUrl: coverImageUrl || bookData.coverImageUrl,
                description: bookData.description,
                publishYear: bookData.publishYear
            });

            return NextResponse.json({
                success: true,
                book
            }, { status: 201 });
        }

        // Mode 2: Manual entry
        if (!title || !author) {
            return NextResponse.json(
                { error: 'Title and author are required for manual entry' },
                { status: 400 }
            );
        }

        // Check if book with same title/author already exists
        const existingBook = await BookService.getBookByTitleAuthor(title, author);
        if (existingBook) {
            return NextResponse.json({
                success: true,
                book: existingBook,
                message: 'Book with same title and author already exists'
            });
        }

        // Create manually entered book
        // Use timestamp as sourceId for manual entries to ensure uniqueness
        const book = await BookService.createOrUpdateBookManual({
            source: 'manual',
            sourceId: `manual-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            title,
            author,
            isbn,
            description,
            pageCount,
            publishYear,
            coverImageUrl,
            coverImagePath
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
