// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface User {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: 'admin' | 'member';
    approved: boolean;
    approved_at?: string;
    approved_by_user_id?: string;
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
    suggestion_phase_id?: string; // Renamed from suggestion_cycle_id in v4 migration

    // Status
    status: 'suggested' | 'voting' | 'reading' | 'completed';
    completed_at?: string;

    // External source tracking
    source?: string;
    source_id?: string;
    local_cover_path?: string;
    original_cover_url?: string;

    // System
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export type CycleStatus = 'active' | 'completed' | 'archived';

export interface Cycle {
    id: string;
    name?: string;
    theme?: string;
    winner_book_id?: string;
    status: CycleStatus;
    created_at: string;
    updated_at: string;
}

export type PhaseType = 'suggestion' | 'voting' | 'reading';

export interface Phase {
    id: string;
    cycle_id: string;
    type: PhaseType;
    theme?: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    winner_book_id?: string; // Deprecated: use cycle.winner_book_id instead
    max_suggestions_per_user: number;
    max_votes_per_user: number;
    created_at: string;
}

export interface Suggestion {
    id: string;
    phase_id: string;
    user_id: string;
    book_id: string;
    created_at: string;
}

export interface Vote {
    id: string;
    phase_id: string;
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

export interface ReadingSection {
    id: string;
    cycle_id: string;
    title: string;
    description?: string;
    display_order: number;
    created_by_user_id: string;
    created_at: string;
    updated_at: string;
}

export interface ReadingSectionNote {
    id: string;
    section_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// EXTENDED TYPES (with relations)
// ============================================================================

export interface BookWithDetails extends Book {
    suggested_by?: User;
    suggestion_phase?: Phase;
}

export interface CycleWithPhases extends Cycle {
    phases?: Phase[];
}

export interface PhaseWithCycle extends Phase {
    cycle?: Cycle;
}

export interface SuggestionWithDetails extends Suggestion {
    book?: Book;
    user?: User;
    phase?: Phase;
    // Denormalized fields for UI display
    title?: string;
    author?: string;
    cover_image_url?: string;
    description?: string;
    page_count?: number;
    reason?: string;
    suggested_by?: string;
}

export interface VoteWithDetails extends Vote {
    book?: Book;
    user?: User;
    phase?: Phase;
}

export interface ReadingChunkWithDetails extends ReadingChunk {
    book?: Book;
    meeting?: Meeting;
}

export interface MeetingWithDetails extends Meeting {
    reading_chunk?: ReadingChunk;
}

export interface ReadingSectionWithDetails extends ReadingSection {
    notes?: ReadingSectionNoteWithUser[];
    created_by?: User;
}

export interface ReadingSectionNoteWithUser extends ReadingSectionNote {
    user?: User;
}

// Cycle context with computed states for UI
export interface CycleContext {
    cycle: CycleWithPhases;
    currentPhase?: Phase;
    pastPhases: Phase[];
    futurePhases: Phase[];
    suggestionPhase?: Phase;
    votingPhase?: Phase;
    readingPhase?: Phase;
    isSuggestionOpen: boolean;
    isVotingOpen: boolean;
    hasVotingEnded: boolean;
    isReading: boolean;
    winnerBook?: Book;
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

// UI-specific search result type for book search modals
export interface SearchResult {
    openLibraryId: string;
    title: string;
    author: string;
    coverImageUrl?: string;
    description?: string;
    publishYear?: number;
    pageCount?: number;
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
    name?: string;
    theme?: string;
}

export interface CreatePhaseRequest {
    cycle_id: string;
    type: PhaseType;
    theme?: string;
    starts_at: string;
    ends_at: string;
    max_suggestions_per_user?: number;
    max_votes_per_user?: number;
}

export interface CreateSuggestionRequest {
    phase_id: string;
    book_id: string;
}

export interface CastVoteRequest {
    phase_id: string;
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

export interface CreateReadingSectionRequest {
    cycle_id: string;
    title: string;
    description?: string;
    display_order?: number;
}

export interface UpdateReadingSectionRequest {
    title?: string;
    description?: string;
    display_order?: number;
}

export interface CreateReadingSectionNoteRequest {
    section_id: string;
    content: string;
}

export interface UpdateReadingSectionNoteRequest {
    content: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type UserRole = User['role'];
export type BookStatus = Book['status'];
export type RankingTier = Ranking['tier'];
