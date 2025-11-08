import { GoogleBooksVolume, GoogleBooksSearchResponse } from '../types';

// Google Books API configuration
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1';
const API_KEY = process.env.GOOGLE_API_KEY || '';
const REQUEST_TIMEOUT = 5000; // 5 seconds

export class GoogleBooksService {
    /**
     * Check if Google Books API is enabled
     */
    static isEnabled(): boolean {
        return !!API_KEY;
    }

    /**
     * Search for books using Google Books API
     */
    static async searchBooks(query: string, maxResults: number = 10): Promise<any[]> {
        if (!this.isEnabled()) {
            console.warn('Google Books API key not configured');
            return [];
        }

        try {
            const url = `${GOOGLE_BOOKS_API}/volumes?q=${encodeURIComponent(query)}&key=${API_KEY}&maxResults=${maxResults}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const response = await fetch(url, {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Google Books API error: ${response.status}`);
            }

            const data: GoogleBooksSearchResponse = await response.json();

            if (!data.items || data.items.length === 0) {
                return [];
            }

            // Transform Google Books response to our format
            return data.items.map((item) => this.transformVolumeToBook(item));
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.error('Google Books API request timed out');
            } else {
                console.error('Error searching books from Google Books:', error);
            }
            return [];
        }
    }

    /**
     * Search for a book by ISBN
     */
    static async searchByISBN(isbn: string): Promise<any | null> {
        if (!this.isEnabled()) {
            console.warn('Google Books API key not configured');
            return null;
        }

        try {
            const url = `${GOOGLE_BOOKS_API}/volumes?q=isbn:${encodeURIComponent(isbn)}&key=${API_KEY}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const response = await fetch(url, {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Google Books API error: ${response.status}`);
            }

            const data: GoogleBooksSearchResponse = await response.json();

            if (!data.items || data.items.length === 0) {
                return null;
            }

            // Return the first (most relevant) result
            return this.transformVolumeToBook(data.items[0]);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.error('Google Books API request timed out');
            } else {
                console.error('Error searching by ISBN from Google Books:', error);
            }
            return null;
        }
    }

    /**
     * Get book details by Google Books volume ID
     */
    static async getBookById(googleBooksId: string): Promise<any | null> {
        if (!this.isEnabled()) {
            console.warn('Google Books API key not configured');
            return null;
        }

        try {
            const url = `${GOOGLE_BOOKS_API}/volumes/${encodeURIComponent(googleBooksId)}?key=${API_KEY}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const response = await fetch(url, {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Google Books API error: ${response.status}`);
            }

            const volume: GoogleBooksVolume = await response.json();
            return this.transformVolumeToBook(volume);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.error('Google Books API request timed out');
            } else {
                console.error('Error fetching book from Google Books:', error);
            }
            return null;
        }
    }

    /**
     * Transform a Google Books volume to our book format
     */
    private static transformVolumeToBook(volume: GoogleBooksVolume): any {
        const { volumeInfo } = volume;

        // Extract ISBNs
        let isbn10: string | undefined;
        let isbn13: string | undefined;
        if (volumeInfo.industryIdentifiers) {
            const isbn10Obj = volumeInfo.industryIdentifiers.find(
                (id) => id.type === 'ISBN_10'
            );
            const isbn13Obj = volumeInfo.industryIdentifiers.find(
                (id) => id.type === 'ISBN_13'
            );
            isbn10 = isbn10Obj?.identifier;
            isbn13 = isbn13Obj?.identifier;
        }

        // Get the best available cover image
        let coverImageUrl: string | undefined;
        if (volumeInfo.imageLinks) {
            // Prefer thumbnail over smallThumbnail
            coverImageUrl = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail;
            // Google returns http URLs, upgrade to https
            if (coverImageUrl) {
                coverImageUrl = coverImageUrl.replace('http://', 'https://');
            }
        }

        // Parse publication year from publishedDate (can be YYYY, YYYY-MM, or YYYY-MM-DD)
        let publishYear: number | undefined;
        if (volumeInfo.publishedDate) {
            const yearMatch = volumeInfo.publishedDate.match(/^(\d{4})/);
            if (yearMatch) {
                publishYear = parseInt(yearMatch[1], 10);
            }
        }

        return {
            googleBooksId: volume.id,
            title: volumeInfo.title,
            subtitle: volumeInfo.subtitle,
            author: volumeInfo.authors?.[0] || 'Unknown',
            authors: volumeInfo.authors || ['Unknown'],
            publisher: volumeInfo.publisher,
            publishYear,
            publicationDate: volumeInfo.publishedDate,
            description: volumeInfo.description,
            pageCount: volumeInfo.pageCount,
            categories: volumeInfo.categories,
            language: volumeInfo.language,
            isbn: isbn13 || isbn10, // Prefer ISBN-13
            isbn10,
            isbn13,
            coverImageUrl,
        };
    }

    /**
     * Enrich existing book data with Google Books data
     * Returns merged data, preferring existing data over Google data
     */
    static async enrichBookData(bookData: {
        title: string;
        author: string;
        isbn?: string;
    }): Promise<any | null> {
        if (!this.isEnabled()) {
            return null;
        }

        // Try ISBN search first if available (most accurate)
        if (bookData.isbn) {
            const result = await this.searchByISBN(bookData.isbn);
            if (result) {
                return result;
            }
        }

        // Fall back to title + author search
        const query = `${bookData.title} ${bookData.author}`;
        const results = await this.searchBooks(query, 3);

        if (results.length === 0) {
            return null;
        }

        // Return the first result as the most likely match
        // In a more sophisticated implementation, we could do fuzzy matching
        return results[0];
    }

    /**
     * Validate book metadata by cross-referencing with Google Books
     * Returns validation info with any discrepancies found
     */
    static async validateBook(bookData: {
        title: string;
        author: string;
        isbn?: string;
        publishYear?: number;
        pageCount?: number;
    }): Promise<{
        valid: boolean;
        googleData: any | null;
        warnings: string[];
    }> {
        const googleData = await this.enrichBookData(bookData);

        if (!googleData) {
            return {
                valid: false,
                googleData: null,
                warnings: ['Could not find book in Google Books'],
            };
        }

        const warnings: string[] = [];

        // Check for discrepancies (simple best-effort validation)
        if (bookData.publishYear && googleData.publishYear) {
            const yearDiff = Math.abs(bookData.publishYear - googleData.publishYear);
            if (yearDiff > 1) {
                warnings.push(
                    `Publication year mismatch: ${bookData.publishYear} vs ${googleData.publishYear} (Google)`
                );
            }
        }

        if (bookData.pageCount && googleData.pageCount) {
            const percentDiff = Math.abs(bookData.pageCount - googleData.pageCount) / bookData.pageCount;
            if (percentDiff > 0.05) {
                // More than 5% difference
                warnings.push(
                    `Page count differs: ${bookData.pageCount} vs ${googleData.pageCount} (Google)`
                );
            }
        }

        return {
            valid: warnings.length === 0,
            googleData,
            warnings,
        };
    }
}
