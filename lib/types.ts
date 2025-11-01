// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface User {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: 'admin' | 'member';
    created_at: string;
    updated_at: string;
}

export interface Session {
    id: string;
    user_id: string;
    expires_at: string;
    created_at: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    isbn?: string;
    cover_url?: string;
    description?: string;
    page_count?: number;
    publication_date?: string;

    // Metadata
    is_series: boolean;
    series_name?: string;
    series_position?: number;

    // Tracking
    suggested_by_user_id?: string;
    suggestion_cycle_id?: string;

    // Status
    status: 'suggested' | 'voting' | 'reading' | 'completed';
    completed_at?: string;

    // System
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface Cycle {
    id: string;
    type: 'suggestion' | 'voting';
    theme?: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    winner_book_id?: string;
    created_at: string;
}

export interface Suggestion {
    id: string;
    cycle_id: string;
    user_id: string;
    book_id: string;
    created_at: string;
}

export interface Vote {
    id: string;
    cycle_id: string;
    user_id: string;
    book_id: string;
    created_at: string;
}

export interface ReadingChunk {
    id: string;
    book_id: string;
    chunk_number: number;
    start_chapter?: string;
    end_chapter?: string;
    start_page?: number;
    end_page?: number;
    due_date?: string;
    created_at: string;
}

export interface Meeting {
    id: string;
    reading_chunk_id?: string;
    scheduled_at: string;
    is_tentative: boolean;
    is_skipped: boolean;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface BlockedAuthor {
    id: string;
    author_name: string;
    reason?: string;
    blocked_by_user_id?: string;
    created_at: string;
}

export interface Theme {
    id: string;
    theme_text: string;
    used_count: number;
    last_used_at?: string;
    created_at: string;
}

export interface Ranking {
    id: string;
    book_id: string;
    user_id: string;
    tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
    ranking_session_id?: string;
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: string;
    user_id?: string;
    action: string;
    entity_type?: string;
    entity_id?: string;
    changes?: string; // JSON string
    created_at: string;
}

export interface Event {
    id: string;
    event_type: string;
    event_data?: string; // JSON string
    processed_at?: string;
    created_at: string;
}

// ============================================================================
// EXTENDED TYPES (with relations)
// ============================================================================

export interface BookWithDetails extends Book {
    suggested_by?: User;
    suggestion_cycle?: Cycle;
}

export interface SuggestionWithDetails extends Suggestion {
    book?: Book;
    user?: User;
    cycle?: Cycle;
}

export interface VoteWithDetails extends Vote {
    book?: Book;
    user?: User;
    cycle?: Cycle;
}

export interface ReadingChunkWithDetails extends ReadingChunk {
    book?: Book;
    meeting?: Meeting;
}

export interface MeetingWithDetails extends Meeting {
    reading_chunk?: ReadingChunk;
}

// ============================================================================
// API TYPES
// ============================================================================

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

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateUserRequest {
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'member';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface CreateBookRequest {
    title: string;
    author: string;
    isbn?: string;
    cover_url?: string;
    description?: string;
    page_count?: number;
    publication_date?: string;
    is_series?: boolean;
    series_name?: string;
    series_position?: number;
}

export interface CreateCycleRequest {
    type: 'suggestion' | 'voting';
    theme?: string;
    starts_at: string;
    ends_at: string;
}

export interface CreateSuggestionRequest {
    cycle_id: string;
    book_id: string;
}

export interface CastVoteRequest {
    cycle_id: string;
    book_id: string;
}

export interface CreateReadingChunkRequest {
    book_id: string;
    chunk_number: number;
    start_chapter?: string;
    end_chapter?: string;
    start_page?: number;
    end_page?: number;
    due_date?: string;
}

export interface CreateMeetingRequest {
    reading_chunk_id?: string;
    scheduled_at: string;
    is_tentative?: boolean;
    notes?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type UserRole = User['role'];
export type BookStatus = Book['status'];
export type CycleType = Cycle['type'];
export type RankingTier = Ranking['tier'];
