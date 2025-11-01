'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Cycle {
    id: string;
    type: 'suggestion' | 'voting';
    theme?: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
}

interface Suggestion {
    id: string;
    book_id: string;
    title: string;
    author: string;
    cover_image_url?: string;
    description?: string;
    reason?: string;
    suggested_by: string;
    user_id: string;
}

interface SearchResult {
    openLibraryId: string;
    title: string;
    author: string;
    coverImageUrl?: string;
    description?: string;
    publishYear?: number;
    pageCount?: number;
}

export default function SuggestionsPage() {
    const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
    const [phase, setPhase] = useState<string>('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState<SearchResult | null>(null);
    const [suggestionReason, setSuggestionReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        loadActiveCycle();
        loadCurrentUser();
    }, []);

    useEffect(() => {
        if (activeCycle) {
            loadSuggestions();
        }
    }, [activeCycle]);

    const loadCurrentUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data.user);
            }
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    const loadActiveCycle = async () => {
        try {
            const response = await fetch('/api/cycles/active');
            if (response.ok) {
                const data = await response.json();
                setActiveCycle(data.cycle);
                setPhase(data.phase);
            }
        } catch (error) {
            console.error('Error loading active cycle:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSuggestions = async () => {
        if (!activeCycle) return;

        try {
            const response = await fetch(`/api/suggestions?cycleId=${activeCycle.id}`);
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.books);
            }
        } catch (error) {
            console.error('Error searching books:', error);
        }
    };

    const handleSelectBook = (book: SearchResult) => {
        setSelectedBook(book);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleSubmitSuggestion = async () => {
        if (!selectedBook || !activeCycle) return;

        try {
            // First, create the book in our database
            const bookResponse = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    openLibraryId: selectedBook.openLibraryId
                })
            });

            if (!bookResponse.ok) {
                const data = await bookResponse.json();
                alert(`Error: ${data.error}`);
                return;
            }

            const bookData = await bookResponse.json();

            // Then create the suggestion
            const suggestionResponse = await fetch('/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cycleId: activeCycle.id,
                    bookId: bookData.book.id,
                    reason: suggestionReason
                })
            });

            if (suggestionResponse.ok) {
                setShowSearchModal(false);
                setSelectedBook(null);
                setSuggestionReason('');
                loadSuggestions();
            } else {
                const data = await suggestionResponse.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error submitting suggestion:', error);
            alert('Failed to submit suggestion');
        }
    };

    const getUserSuggestionCount = () => {
        if (!currentUser) return 0;
        return suggestions.filter(s => s.user_id === currentUser.id).length;
    };

    const canSuggest = () => {
        if (!activeCycle) return false;
        // Can suggest if it's a suggestion cycle and we're in the suggestion phase
        return activeCycle.type === 'suggestion' && phase === 'suggestion';
    };

    const canDelete = (suggestion: Suggestion) => {
        if (!currentUser) return false;
        // User can delete their own suggestions, or admins can delete any
        return suggestion.user_id === currentUser.id || currentUser.role === 'admin';
    };

    const handleDeleteSuggestion = async (suggestionId: string) => {
        if (!confirm('Are you sure you want to delete this suggestion?')) {
            return;
        }

        try {
            const response = await fetch(`/api/suggestions/${suggestionId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadSuggestions();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error deleting suggestion:', error);
            alert('Failed to delete suggestion');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-foreground">Loading...</div>
            </div>
        );
    }

    if (!activeCycle) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <Link href="/dashboard" className="text-accent hover:underline text-sm mb-4 block">
                        ← Back to Dashboard
                    </Link>
                    <div className="p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                        <h2 className="text-2xl font-serif text-foreground mb-2">No Active Cycle</h2>
                        <p className="text-foreground/60">There is no active suggestion cycle at the moment.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-8">
                <Link href="/dashboard" className="text-accent hover:underline text-sm mb-2 block">
                    ← Back to Dashboard
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold font-serif text-foreground mb-2">
                            Book Suggestions
                        </h1>
                        <p className="text-foreground/60">
                            {activeCycle.type === 'suggestion' ? '📚 Suggestion Cycle' : '🗳️ Voting Cycle'}
                            {activeCycle.theme && ` - ${activeCycle.theme}`}
                        </p>
                        <p className="text-sm text-foreground/50 mt-1">
                            Phase: <span className="text-accent">{phase}</span> |
                            Your suggestions: {getUserSuggestionCount()}
                        </p>
                    </div>
                    {canSuggest() && (
                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="px-4 py-2 bg-accent/20 backdrop-blur-lg rounded-full border border-accent text-foreground hover:bg-accent/30 transition-colors"
                        >
                            + Suggest a Book
                        </button>
                    )}
                </div>
            </header>

            {/* Suggestions List */}
            <div className="max-w-6xl mx-auto">
                {suggestions.length === 0 ? (
                    <div className="p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                        <p className="text-foreground/60">No books suggested yet. Be the first!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {suggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] hover:border-accent transition-all"
                            >
                                <div className="flex gap-6">
                                    {/* Book Cover - Left Side */}
                                    {suggestion.cover_image_url && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={suggestion.cover_image_url}
                                                alt={suggestion.title}
                                                className="w-48 h-auto object-cover rounded-lg shadow-lg"
                                            />
                                        </div>
                                    )}

                                    {/* Book Details - Right Side */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                                                    {suggestion.title}
                                                </h3>
                                                <p className="text-foreground/70 text-lg mb-3">by {suggestion.author}</p>
                                            </div>
                                            {canDelete(suggestion) && (
                                                <button
                                                    onClick={() => handleDeleteSuggestion(suggestion.id)}
                                                    className="ml-4 px-3 py-1 text-sm bg-red-500/10 border border-red-500/30 rounded-full text-red-400 hover:bg-red-500/20 transition-colors"
                                                    title="Delete suggestion"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>

                                        {suggestion.description && (
                                            <p className="text-foreground/60 text-sm mb-4 leading-relaxed">
                                                {suggestion.description}
                                            </p>
                                        )}

                                        {suggestion.reason && (
                                            <div className="mt-4 p-4 bg-[#18181B]/40 border border-[#27272A] rounded-lg">
                                                <p className="text-foreground/50 text-xs mb-2 uppercase tracking-wider">Why this book?</p>
                                                <p className="text-foreground/70 text-sm italic">"{suggestion.reason}"</p>
                                            </div>
                                        )}

                                        <p className="text-foreground/40 text-xs mt-4">
                                            Suggested by {suggestion.suggested_by}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="max-w-2xl w-full bg-[#18181B] rounded-2xl border border-[#27272A] p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-serif font-semibold text-foreground">
                                {selectedBook ? 'Confirm Suggestion' : 'Search for a Book'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowSearchModal(false);
                                    setSelectedBook(null);
                                    setSearchResults([]);
                                }}
                                className="text-foreground/60 hover:text-foreground"
                            >
                                ✕
                            </button>
                        </div>

                        {!selectedBook ? (
                            <>
                                <form onSubmit={handleSearch} className="mb-4">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by title, author, or ISBN..."
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full mt-2 px-6 py-2 bg-accent/20 border border-accent rounded-full text-foreground hover:bg-accent/30 transition-colors"
                                    >
                                        Search
                                    </button>
                                </form>

                                <div className="space-y-3">
                                    {searchResults.map((book, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleSelectBook(book)}
                                            className="flex gap-4 p-3 bg-[#18181B]/40 border border-[#27272A] rounded-lg hover:border-accent cursor-pointer transition-all"
                                        >
                                            {book.coverImageUrl && (
                                                <img
                                                    src={book.coverImageUrl}
                                                    alt={book.title}
                                                    className="w-16 h-24 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <h3 className="text-foreground font-medium">{book.title}</h3>
                                                <p className="text-foreground/60 text-sm">{book.author}</p>
                                                {book.publishYear && (
                                                    <p className="text-foreground/40 text-xs mt-1">{book.publishYear}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div>
                                <div className="flex gap-4 mb-4">
                                    {selectedBook.coverImageUrl && (
                                        <img
                                            src={selectedBook.coverImageUrl}
                                            alt={selectedBook.title}
                                            className="w-32 h-48 object-cover rounded-lg"
                                        />
                                    )}
                                    <div>
                                        <h3 className="text-xl font-serif font-semibold text-foreground mb-1">
                                            {selectedBook.title}
                                        </h3>
                                        <p className="text-foreground/70">by {selectedBook.author}</p>
                                        {selectedBook.publishYear && (
                                            <p className="text-foreground/50 text-sm mt-1">{selectedBook.publishYear}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-foreground/70 text-sm mb-2">
                                        Why do you recommend this book? (optional)
                                    </label>
                                    <textarea
                                        value={suggestionReason}
                                        onChange={(e) => setSuggestionReason(e.target.value)}
                                        placeholder="Share why you think the club should read this..."
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent min-h-[100px]"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedBook(null)}
                                        className="flex-1 px-6 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-full text-foreground hover:border-foreground/40 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmitSuggestion}
                                        className="flex-1 px-6 py-2 bg-accent/20 border border-accent rounded-full text-foreground hover:bg-accent/30 transition-colors"
                                    >
                                        Submit Suggestion
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
