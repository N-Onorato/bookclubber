import { randomUUID } from 'crypto';
import { getDatabase } from '../db/connection';
import { Book } from '../types';
import { ImageService } from './imageService';
import { GoogleBooksService } from './googleBooksService';

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
     * Search for books using both Open Library and Google Books (with fallback)
     * Tries Open Library first, then falls back to Google Books if needed
     * Enriches Open Library results with Google Books data when available
     */
    static async searchBooksUnified(query: string, limit: number = 10): Promise<any[]> {
        // Try Open Library first
        const openLibraryResults = await this.searchBooks(query, limit);

        // If we have good results from Open Library and Google Books is disabled, return them
        if (openLibraryResults.length >= 3 && !GoogleBooksService.isEnabled()) {
            return openLibraryResults;
        }

        // If Google Books is enabled, try it (either to enrich or as fallback)
        if (GoogleBooksService.isEnabled()) {
            console.log('Fetching Google Books data to enrich/supplement results...');
            const googleResults = await GoogleBooksService.searchBooks(query, limit);

            // Merge and enrich results
            const mergedResults: any[] = [];
            const processedGoogleIds = new Set<string>();

            // First pass: enrich Open Library results with Google Books data
            for (const olBook of openLibraryResults) {
                let enrichedBook = { ...olBook };

                // Try to find matching Google Books result
                const matchingGoogle = googleResults.find((gBook) => {
                    // Match by title (case-insensitive, fuzzy)
                    const titleMatch = this.fuzzyTitleMatch(olBook.title, gBook.title);
                    // Also check author if available
                    const authorMatch = olBook.author && gBook.author
                        ? this.fuzzyAuthorMatch(olBook.author, gBook.author)
                        : true; // If no author data, rely on title match

                    return titleMatch && authorMatch;
                });

                if (matchingGoogle) {
                    // Enrich Open Library data with Google Books data
                    enrichedBook = {
                        ...enrichedBook,
                        // Fill in missing fields from Google Books
                        description: enrichedBook.description || matchingGoogle.description,
                        pageCount: enrichedBook.pageCount || matchingGoogle.pageCount,
                        coverImageUrl: enrichedBook.coverImageUrl || matchingGoogle.coverImageUrl,
                        publisher: matchingGoogle.publisher,
                        language: matchingGoogle.language,
                        categories: matchingGoogle.categories,
                        isbn: enrichedBook.isbn || matchingGoogle.isbn,
                        isbn10: matchingGoogle.isbn10,
                        isbn13: matchingGoogle.isbn13,
                        googleBooksId: matchingGoogle.googleBooksId,
                    };
                    processedGoogleIds.add(matchingGoogle.googleBooksId);
                }

                mergedResults.push(enrichedBook);
            }

            // Second pass: add Google Books results that didn't match any Open Library results
            for (const gBook of googleResults) {
                if (!processedGoogleIds.has(gBook.googleBooksId)) {
                    mergedResults.push(gBook);
                }
            }

            return mergedResults.slice(0, limit);
        }

        return openLibraryResults;
    }

    /**
     * Fuzzy title matching - handles minor variations
     */
    private static fuzzyTitleMatch(title1: string, title2: string): boolean {
        if (!title1 || !title2) return false;

        // Normalize: lowercase, remove punctuation, trim whitespace
        const normalize = (str: string) =>
            str.toLowerCase()
               .replace(/[^\w\s]/g, '')
               .replace(/\s+/g, ' ')
               .trim();

        const t1 = normalize(title1);
        const t2 = normalize(title2);

        // Check if one title contains the other (handles subtitle variations)
        return t1.includes(t2) || t2.includes(t1) || t1 === t2;
    }

    /**
     * Fuzzy author matching - handles name variations
     */
    private static fuzzyAuthorMatch(author1: string, author2: string): boolean {
        if (!author1 || !author2) return false;

        const normalize = (str: string) =>
            str.toLowerCase()
               .replace(/[^\w\s]/g, '')
               .trim();

        const a1 = normalize(author1);
        const a2 = normalize(author2);

        // Check if authors match (handles "Frank Herbert" vs "Herbert, Frank")
        return a1.includes(a2) || a2.includes(a1) || a1 === a2;
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
        source: string;  // e.g., 'openlibrary', 'google', 'manual'
        sourceId: string;  // The ID from that source
        title: string;
        author: string;
        isbn?: string;
        publishYear?: number;
        pageCount?: number;
        coverImageUrl?: string;
        description?: string;
        // New Google Books fields
        publisher?: string;
        language?: string;
        categories?: string[];
        isbn10?: string;
        isbn13?: string;
        googleBooksId?: string;
    }): Promise<Book> {
        const db = getDatabase();

        // Check if book already exists
        const existingBook = db.prepare('SELECT * FROM books WHERE source = ? AND source_id = ?')
            .get(bookData.source, bookData.sourceId) as Book | undefined;

        const now = new Date().toISOString();

        // Download cover image locally if URL provided
        let localCoverPath: string | null = null;
        if (bookData.coverImageUrl) {
            const bookId = existingBook?.id || randomUUID();
            localCoverPath = await ImageService.downloadAndSaveImage(bookData.coverImageUrl, bookId);
        }

        // Serialize categories if provided
        const categoriesJson = bookData.categories ? JSON.stringify(bookData.categories) : null;

        if (existingBook) {
            // Update existing book
            db.prepare(`
                UPDATE books
                SET title = ?, author = ?, isbn = ?, publication_date = ?,
                    page_count = ?, cover_url = ?, description = ?, updated_at = ?,
                    local_cover_path = ?, original_cover_url = ?,
                    publisher = ?, language = ?, categories = ?,
                    isbn_10 = ?, isbn_13 = ?, google_books_id = ?
                WHERE id = ?
            `).run(
                bookData.title,
                bookData.author,
                bookData.isbn || bookData.isbn13 || bookData.isbn10 || null,
                bookData.publishYear ? `${bookData.publishYear}-01-01` : null,
                bookData.pageCount || null,
                bookData.coverImageUrl || null,
                bookData.description || null,
                now,
                localCoverPath,
                bookData.coverImageUrl || null,
                bookData.publisher || null,
                bookData.language || null,
                categoriesJson,
                bookData.isbn10 || null,
                bookData.isbn13 || null,
                bookData.googleBooksId || null,
                existingBook.id
            );

            return db.prepare('SELECT * FROM books WHERE id = ?').get(existingBook.id) as Book;
        } else {
            // Create new book
            const bookId = randomUUID();

            db.prepare(`
                INSERT INTO books (
                    id, source, source_id, title, author, isbn, publication_date,
                    page_count, cover_url, description, status, created_at, updated_at,
                    local_cover_path, original_cover_url,
                    publisher, language, categories, isbn_10, isbn_13, google_books_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'suggested', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                bookId,
                bookData.source,
                bookData.sourceId,
                bookData.title,
                bookData.author,
                bookData.isbn || bookData.isbn13 || bookData.isbn10 || null,
                bookData.publishYear ? `${bookData.publishYear}-01-01` : null,
                bookData.pageCount || null,
                bookData.coverImageUrl || null,
                bookData.description || null,
                now,
                now,
                localCoverPath,
                bookData.coverImageUrl || null,
                bookData.publisher || null,
                bookData.language || null,
                categoriesJson,
                bookData.isbn10 || null,
                bookData.isbn13 || null,
                bookData.googleBooksId || null
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
     * Get book by title and author (case-insensitive)
     */
    static async getBookByTitleAuthor(title: string, author: string): Promise<Book | null> {
        const db = getDatabase();
        const book = db.prepare('SELECT * FROM books WHERE LOWER(title) = LOWER(?) AND LOWER(author) = LOWER(?) AND deleted_at IS NULL')
            .get(title, author) as Book | undefined;
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
     * Create or update a manually entered book
     * Similar to createOrUpdateBook but handles uploaded images differently
     */
    static async createOrUpdateBookManual(bookData: {
        source: string;
        sourceId: string;
        title: string;
        author: string;
        isbn?: string;
        publishYear?: number;
        pageCount?: number;
        coverImageUrl?: string;
        coverImagePath?: string; // Path from uploaded image
        description?: string;
    }): Promise<Book> {
        const db = getDatabase();

        // Check if book already exists
        const existingBook = db.prepare('SELECT * FROM books WHERE source = ? AND source_id = ?')
            .get(bookData.source, bookData.sourceId) as Book | undefined;

        const now = new Date().toISOString();

        // Handle cover image
        let localCoverPath: string | null = null;
        let coverUrl: string | null = null;

        if (bookData.coverImagePath) {
            // Use uploaded image path directly
            localCoverPath = bookData.coverImagePath;
            coverUrl = null; // No external URL
        } else if (bookData.coverImageUrl) {
            // Download from URL
            const bookId = existingBook?.id || randomUUID();
            localCoverPath = await ImageService.downloadAndSaveImage(bookData.coverImageUrl, bookId);
            coverUrl = bookData.coverImageUrl;
        }

        if (existingBook) {
            // Update existing book
            db.prepare(`
                UPDATE books
                SET title = ?, author = ?, isbn = ?, publication_date = ?,
                    page_count = ?, cover_url = ?, description = ?, updated_at = ?,
                    local_cover_path = ?, original_cover_url = ?
                WHERE id = ?
            `).run(
                bookData.title,
                bookData.author,
                bookData.isbn || null,
                bookData.publishYear ? `${bookData.publishYear}-01-01` : null,
                bookData.pageCount || null,
                coverUrl,
                bookData.description || null,
                now,
                localCoverPath,
                coverUrl,
                existingBook.id
            );

            return db.prepare('SELECT * FROM books WHERE id = ?').get(existingBook.id) as Book;
        } else {
            // Create new book
            const bookId = randomUUID();

            db.prepare(`
                INSERT INTO books (
                    id, source, source_id, title, author, isbn, publication_date,
                    page_count, cover_url, description, status, created_at, updated_at,
                    local_cover_path, original_cover_url
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'suggested', ?, ?, ?, ?)
            `).run(
                bookId,
                bookData.source,
                bookData.sourceId,
                bookData.title,
                bookData.author,
                bookData.isbn || null,
                bookData.publishYear ? `${bookData.publishYear}-01-01` : null,
                bookData.pageCount || null,
                coverUrl,
                bookData.description || null,
                now,
                now,
                localCoverPath,
                coverUrl
            );

            return db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as Book;
        }
    }

    /**
     * Update book details
     */
    static async updateBook(
        bookId: string,
        updates: {
            source?: string;
            sourceId?: string;
            title?: string;
            author?: string;
            isbn?: string;
            publishYear?: number;
            pageCount?: number;
            coverImageUrl?: string;
            coverImagePath?: string;
            description?: string;
        }
    ): Promise<Book> {
        const db = getDatabase();
        const now = new Date().toISOString();

        // Get existing book
        const existingBook = await this.getBookById(bookId);
        if (!existingBook) {
            throw new Error('Book not found');
        }

        // Handle cover image updates
        let localCoverPath = existingBook.local_cover_path || undefined;
        let coverUrl = existingBook.cover_url || undefined;

        // Priority: uploaded path > URL download
        if (updates.coverImagePath) {
            // Use uploaded image path directly
            localCoverPath = updates.coverImagePath;
            // Don't change coverUrl if we're using uploaded image
        } else if (updates.coverImageUrl && updates.coverImageUrl !== existingBook.cover_url) {
            // Download cover image locally if URL provided
            const downloadedPath = await ImageService.downloadAndSaveImage(updates.coverImageUrl, bookId);
            localCoverPath = downloadedPath || undefined;
            coverUrl = updates.coverImageUrl;
        }

        // Build update query dynamically based on provided fields
        const updateFields: string[] = ['updated_at = ?'];
        const updateValues: any[] = [now];

        if (updates.source !== undefined) {
            updateFields.push('source = ?');
            updateValues.push(updates.source);
        }
        if (updates.sourceId !== undefined) {
            updateFields.push('source_id = ?');
            updateValues.push(updates.sourceId);
        }
        if (updates.title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(updates.title);
        }
        if (updates.author !== undefined) {
            updateFields.push('author = ?');
            updateValues.push(updates.author);
        }
        if (updates.isbn !== undefined) {
            updateFields.push('isbn = ?');
            updateValues.push(updates.isbn);
        }
        if (updates.publishYear !== undefined) {
            updateFields.push('publication_date = ?');
            updateValues.push(updates.publishYear ? `${updates.publishYear}-01-01` : null);
        }
        if (updates.pageCount !== undefined) {
            updateFields.push('page_count = ?');
            updateValues.push(updates.pageCount);
        }
        if (updates.coverImageUrl !== undefined) {
            updateFields.push('cover_url = ?');
            updateValues.push(updates.coverImageUrl);
            updateFields.push('original_cover_url = ?');
            updateValues.push(updates.coverImageUrl);
        }
        if (updates.description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(updates.description);
        }
        if (localCoverPath !== existingBook.local_cover_path) {
            updateFields.push('local_cover_path = ?');
            updateValues.push(localCoverPath);
        }

        updateValues.push(bookId);

        const query = `
            UPDATE books
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;

        db.prepare(query).run(...updateValues);

        return db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as Book;
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

    /**
     * Enrich a book with data from Google Books
     * Fetches additional metadata and updates the book record
     */
    static async enrichBookFromGoogle(bookId: string): Promise<Book | null> {
        const book = await this.getBookById(bookId);
        if (!book) {
            return null;
        }

        if (!GoogleBooksService.isEnabled()) {
            console.warn('Google Books API not enabled');
            return book;
        }

        // Fetch Google Books data
        const googleData = await GoogleBooksService.enrichBookData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
        });

        if (!googleData) {
            console.log('No Google Books data found for book:', book.title);
            return book;
        }

        // Update book with Google Books data (only fill in missing fields)
        const db = getDatabase();
        const now = new Date().toISOString();

        const categoriesJson = googleData.categories ? JSON.stringify(googleData.categories) : null;

        db.prepare(`
            UPDATE books
            SET publisher = COALESCE(publisher, ?),
                language = COALESCE(language, ?),
                categories = COALESCE(categories, ?),
                isbn_10 = COALESCE(isbn_10, ?),
                isbn_13 = COALESCE(isbn_13, ?),
                google_books_id = COALESCE(google_books_id, ?),
                page_count = COALESCE(page_count, ?),
                description = COALESCE(description, ?),
                updated_at = ?
            WHERE id = ?
        `).run(
            googleData.publisher || null,
            googleData.language || null,
            categoriesJson,
            googleData.isbn10 || null,
            googleData.isbn13 || null,
            googleData.googleBooksId || null,
            googleData.pageCount || null,
            googleData.description || null,
            now,
            bookId
        );

        return db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as Book;
    }

    /**
     * Validate a book's metadata against Google Books
     */
    static async validateBook(bookId: string): Promise<{
        valid: boolean;
        warnings: string[];
    }> {
        const book = await this.getBookById(bookId);
        if (!book) {
            return { valid: false, warnings: ['Book not found'] };
        }

        if (!GoogleBooksService.isEnabled()) {
            return { valid: true, warnings: ['Google Books API not enabled - skipping validation'] };
        }

        const validation = await GoogleBooksService.validateBook({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            publishYear: book.publication_date ? new Date(book.publication_date).getFullYear() : undefined,
            pageCount: book.page_count || undefined,
        });

        return {
            valid: validation.valid,
            warnings: validation.warnings,
        };
    }
}
