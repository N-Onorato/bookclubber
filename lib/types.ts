export interface User {
    id: number;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'member';
    created_at: string;
    is_active: boolean;
}

export interface Book {
    id: number;
    open_library_id?: string;
    isbn?: string;
    title: string;
    authors?: string; // JSON string
    publish_year?: number;
    page_count?: number;
    cover_url?: string;
    description?: string;
    created_at: string;
}

export interface BookSuggestion {
    id: number;
    book_id: number;
    suggested_by: number;
    reason?: string;
    status: 'pending' | 'selected' | 'rejected';
    created_at: string;
    book?: Book;
    vote_count?: { up?: number; down?: number };
}

export interface BookSelection {
    id: number;
    book_id: number;
    selected_by: number;
    start_date: string;
    end_date: string;
    status: 'upcoming' | 'current' | 'completed';
    notes?: string;
    created_at: string;
    book?: Book;
}

export interface ReadingSession {
    id: number;
    book_selection_id: number;
    session_number: number;
    title: string;
    description?: string;
    start_page?: number;
    end_page?: number;
    start_chapter?: string;
    end_chapter?: string;
    session_date: string;
    notes?: string;
    created_at: string;
}

export interface Vote {
    id: number;
    suggestion_id: number;
    user_id: number;
    vote_type: 'up' | 'down';
    created_at: string;
}

// Open Library API types
export interface OpenLibraryBook {
    key: string;
    title: string;
    author_name?: string[];
    isbn?: string[];
    first_publish_year?: number;
    number_of_pages_median?: number;
    subtitle?: string;
}

export interface BookSearchResult {
    openLibraryId: string;
    title: string;
    authors: string[];
    isbn?: string;
    publishYear?: number;
    coverUrl?: string;
    pageCount?: number;
    subtitle?: string;
}