import { randomUUID } from 'crypto';
import { getDatabase } from '../db/connection';
import { Book } from '../types';

// Open Library API configuration
const OPEN_LIBRARY_API = 'https://openlibrary.org';
const USER_AGENT = 'dataDumperBookClub/1.0 (n_onorato@outlook.com)';

export class BookService {
    /**
     * Search for books using Open Library API
     */
    static async searchBooks(query: string, limit: number = 10): Promise<any[]> {
        try {
            const url = `${OPEN_LIBRARY_API}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': USER_AGENT
                }
            });

            if (!response.ok) {
                throw new Error(`Open Library API error: ${response.status}`);
            }

            const data = await response.json();

            // Transform Open Library response to our format
            return data.docs.map((doc: any) => ({
                openLibraryId: doc.key,
                title: doc.title,
                author: doc.author_name?.[0] || 'Unknown',
                isbn: doc.isbn?.[0],
                publishYear: doc.first_publish_year,
                pageCount: doc.number_of_pages_median,
                coverImageUrl: doc.cover_i
                    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                    : null,
                description: doc.first_sentence?.[0] || null
            }));
        } catch (error) {
            console.error('Error searching books:', error);
            return [];
        }
    }

    /**
     * Get book details from Open Library by ID
     */
    static async getBookFromOpenLibrary(openLibraryId: string): Promise<any | null> {
        try {
            // Get work details
            const workUrl = `${OPEN_LIBRARY_API}${openLibraryId}.json`;
            const workResponse = await fetch(workUrl, {
                headers: {
                    'User-Agent': USER_AGENT
                }
            });

            if (!workResponse.ok) {
                throw new Error(`Open Library API error: ${workResponse.status}`);
            }

            const workData = await workResponse.json();

            // Get author information
            let authorName = 'Unknown';
            if (workData.authors && workData.authors.length > 0) {
                const authorId = workData.authors[0].author.key;
                const authorUrl = `${OPEN_LIBRARY_API}${authorId}.json`;
                const authorResponse = await fetch(authorUrl, {
                    headers: {
                        'User-Agent': USER_AGENT
                    }
                });

                if (authorResponse.ok) {
                    const authorData = await authorResponse.json();
                    authorName = authorData.name;
                }
            }

            // Get cover image
            let coverImageUrl = null;
            if (workData.covers && workData.covers.length > 0) {
                coverImageUrl = `https://covers.openlibrary.org/b/id/${workData.covers[0]}-L.jpg`;
            }

            // Get description
            let description = null;
            if (typeof workData.description === 'string') {
                description = workData.description;
            } else if (workData.description && workData.description.value) {
                description = workData.description.value;
            }

            return {
                openLibraryId: openLibraryId,
                title: workData.title,
                author: authorName,
                coverImageUrl,
                description,
                publishYear: workData.first_publish_date
            };
        } catch (error) {
            console.error('Error fetching book from Open Library:', error);
            return null;
        }
    }

    /**
     * Create or update a book in the database
     */
    static async createOrUpdateBook(bookData: {
        source: string;  // e.g., 'openlibrary', 'goodreads', 'manual'
        sourceId: string;  // The ID from that source
        title: string;
        author: string;
        isbn?: string;
        publishYear?: number;
        pageCount?: number;
        coverImageUrl?: string;
        description?: string;
    }): Promise<Book> {
        const db = getDatabase();

        // Check if book already exists
        const existingBook = db.prepare('SELECT * FROM books WHERE source = ? AND source_id = ?')
            .get(bookData.source, bookData.sourceId) as Book | undefined;

        const now = new Date().toISOString();

        if (existingBook) {
            // Update existing book
            db.prepare(`
                UPDATE books
                SET title = ?, author = ?, isbn = ?, publication_date = ?,
                    page_count = ?, cover_url = ?, description = ?, updated_at = ?
                WHERE id = ?
            `).run(
                bookData.title,
                bookData.author,
                bookData.isbn || null,
                bookData.publishYear ? `${bookData.publishYear}-01-01` : null,
                bookData.pageCount || null,
                bookData.coverImageUrl || null,
                bookData.description || null,
                now,
                existingBook.id
            );

            return db.prepare('SELECT * FROM books WHERE id = ?').get(existingBook.id) as Book;
        } else {
            // Create new book
            const bookId = randomUUID();

            db.prepare(`
                INSERT INTO books (
                    id, source, source_id, title, author, isbn, publication_date,
                    page_count, cover_url, description, status, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'suggested', ?, ?)
            `).run(
                bookId,
                bookData.source,
                bookData.sourceId,
                bookData.title,
                bookData.author,
                bookData.isbn || null,
                bookData.publishYear ? `${bookData.publishYear}-01-01` : null,
                bookData.pageCount || null,
                bookData.coverImageUrl || null,
                bookData.description || null,
                now,
                now
            );

            return db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as Book;
        }
    }

    /**
     * Get book by ID
     */
    static async getBookById(bookId: string): Promise<Book | null> {
        const db = getDatabase();
        const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as Book | undefined;
        return book || null;
    }

    /**
     * Get book by source and source ID
     */
    static async getBookBySource(source: string, sourceId: string): Promise<Book | null> {
        const db = getDatabase();
        const book = db.prepare('SELECT * FROM books WHERE source = ? AND source_id = ?')
            .get(source, sourceId) as Book | undefined;
        return book || null;
    }

    /**
     * Get all books
     */
    static async getAllBooks(): Promise<Book[]> {
        const db = getDatabase();
        return db.prepare('SELECT * FROM books WHERE deleted_at IS NULL ORDER BY title').all() as Book[];
    }

    /**
     * Update book status
     */
    static async updateBookStatus(
        bookId: string,
        status: 'suggested' | 'selected' | 'reading' | 'completed'
    ): Promise<void> {
        const db = getDatabase();
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE books
            SET status = ?, updated_at = ?
            WHERE id = ?
        `).run(status, now, bookId);
    }

    /**
     * Soft delete a book
     */
    static async deleteBook(bookId: string): Promise<void> {
        const db = getDatabase();
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE books
            SET deleted_at = ?, updated_at = ?
            WHERE id = ?
        `).run(now, now, bookId);
    }
}
