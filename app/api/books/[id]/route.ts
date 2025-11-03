import { NextRequest, NextResponse } from 'next/server';
import { BookService } from '@/lib/services/bookService';
import { requireAdmin } from '@/lib/auth';

/**
 * PATCH /api/books/[id] - Update book details (admin only)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireAdmin();

        const body = await request.json();
        const { title, author, description, pageCount, publishYear } = body;

        // Validate that at least one field is provided
        if (!title && !author && !description && pageCount === undefined && publishYear === undefined) {
            return NextResponse.json(
                { error: 'At least one field must be provided to update' },
                { status: 400 }
            );
        }

        const updatedBook = await BookService.updateBook(params.id, {
            title,
            author,
            description,
            pageCount,
            publishYear
        });

        if (!updatedBook) {
            return NextResponse.json(
                { error: 'Book not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            book: updatedBook
        });
    } catch (error: any) {
        if (error.message === 'Admin access required') {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            );
        }

        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Error updating book:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}