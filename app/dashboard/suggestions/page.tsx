'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SuggestionCard from './SuggestionCard';
import BookSearchModal from './BookSearchModal';
import EditBookModal from './EditBookModal';
import { SuggestionWithDetails } from '@/lib/types';

export default function SuggestionsPage() {
    const [cycleContext, setCycleContext] = useState<any>(null);
    const [suggestions, setSuggestions] = useState<SuggestionWithDetails[]>([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSuggestion, setEditingSuggestion] = useState<SuggestionWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        loadActiveCycle();
        loadCurrentUser();
    }, []);

    useEffect(() => {
        if (cycleContext?.suggestionPhase) {
            loadSuggestions();
        }
    }, [cycleContext]);

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
                setCycleContext(data);
            }
        } catch (error) {
            console.error('Error loading active cycle:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSuggestions = async () => {
        if (!cycleContext?.suggestionPhase) return;

        try {
            const response = await fetch(`/api/suggestions?phaseId=${cycleContext.suggestionPhase.id}`);
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    };

    const getUserSuggestionCount = () => {
        if (!currentUser) return 0;
        return suggestions.filter(s => s.user_id === currentUser.id).length;
    };

    const canSuggest = () => {
        if (!cycleContext?.suggestionPhase || !currentUser) return false;
        // Can suggest only if suggestion phase is open
        if (!cycleContext.isSuggestionOpen) return false;

        // Members are limited, admins can always suggest (with warning)
        if (currentUser.role === 'admin') return true;

        // Check if member has reached the limit
        return getUserSuggestionCount() < cycleContext.suggestionPhase.max_suggestions_per_user;
    };

    const hasExceededLimit = () => {
        if (!cycleContext?.suggestionPhase || !currentUser) return false;
        return getUserSuggestionCount() > cycleContext.suggestionPhase.max_suggestions_per_user;
    };

    const isAtLimit = () => {
        if (!cycleContext?.suggestionPhase || !currentUser) return false;
        return getUserSuggestionCount() >= cycleContext.suggestionPhase.max_suggestions_per_user;
    };

    const canDelete = (suggestion: SuggestionWithDetails) => {
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

    const handleEditSuggestion = (suggestion: SuggestionWithDetails) => {
        setEditingSuggestion(suggestion);
        setShowEditModal(true);
    };

    const handleEditSuccess = () => {
        loadSuggestions();
        setShowEditModal(false);
        setEditingSuggestion(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-foreground">Loading...</div>
            </div>
        );
    }

    if (!cycleContext) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <Link href="/dashboard" className="text-accent hover:underline text-sm mb-4 block">
                        ← Back to Dashboard
                    </Link>
                    <div className="p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                        <h2 className="text-2xl font-serif text-foreground mb-2">No Active Cycle</h2>
                        <p className="text-foreground/60">There is no active cycle at the moment.</p>
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
                            {cycleContext.isSuggestionOpen && '📚 Suggestion Phase Open'}
                            {!cycleContext.isSuggestionOpen && cycleContext.suggestionPhase && (() => {
                                const now = new Date();
                                const starts = new Date(cycleContext.suggestionPhase.starts_at);
                                if (starts > now) {
                                    // Future phase
                                    const days = Math.floor((starts.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                    const hours = Math.floor((starts.getTime() - now.getTime()) / (1000 * 60 * 60));
                                    if (days > 0) {
                                        return `📚 Suggestions open in ${days} day${days !== 1 ? 's' : ''}`;
                                    } else if (hours > 0) {
                                        return `📚 Suggestions open in ${hours} hour${hours !== 1 ? 's' : ''}`;
                                    } else {
                                        const minutes = Math.floor((starts.getTime() - now.getTime()) / (1000 * 60));
                                        return `📚 Suggestions open in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
                                    }
                                } else {
                                    // Past phase
                                    return '📚 Suggestions Closed';
                                }
                            })()}
                            {cycleContext.cycle?.theme && ` - ${cycleContext.cycle.theme}`}
                        </p>
                        {cycleContext.suggestionPhase && (
                            <p className="text-sm text-foreground/50 mt-1">
                                Your suggestions: {getUserSuggestionCount()} / {cycleContext.suggestionPhase.max_suggestions_per_user}
                            </p>
                        )}
                        {cycleContext.isVotingOpen && (
                            <p className="text-sm text-blue-400 mt-2">
                                🗳️ Voting is now open! Visit the voting page to cast your votes.
                            </p>
                        )}
                        {cycleContext.hasVotingEnded && (
                            <p className="text-sm text-green-400 mt-2">
                                ✅ Voting complete! Check the results on the voting page.
                            </p>
                        )}
                        {currentUser?.role === 'admin' && hasExceededLimit() && cycleContext.suggestionPhase && (
                            <p className="text-sm text-yellow-400 mt-2">
                                ⚠️ You have exceeded the suggestion limit ({cycleContext.suggestionPhase.max_suggestions_per_user}). Consider removing some suggestions.
                            </p>
                        )}
                        {currentUser?.role === 'member' && isAtLimit() && cycleContext.isSuggestionOpen && cycleContext.suggestionPhase && (
                            <p className="text-sm text-foreground/60 mt-2">
                                You have reached the maximum of {cycleContext.suggestionPhase.max_suggestions_per_user} suggestion(s) for this phase.
                            </p>
                        )}
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
                            <SuggestionCard
                                key={suggestion.id}
                                suggestion={suggestion}
                                canDelete={canDelete(suggestion)}
                                onDelete={handleDeleteSuggestion}
                                canEdit={currentUser?.role === 'admin'}
                                onEdit={handleEditSuggestion}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Search Modal */}
            {cycleContext?.suggestionPhase && (
                <BookSearchModal
                    isOpen={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                    activePhase={cycleContext.suggestionPhase}
                    currentUser={currentUser}
                    onSubmitSuccess={loadSuggestions}
                />
            )}

            {/* Edit Modal */}
            {editingSuggestion && (
                <EditBookModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingSuggestion(null);
                    }}
                    bookId={editingSuggestion.book_id}
                    initialData={{
                        title: editingSuggestion.title || '',
                        author: editingSuggestion.author || '',
                        description: editingSuggestion.description,
                        pageCount: editingSuggestion.page_count,
                        coverImageUrl: editingSuggestion.cover_image_url
                    }}
                    onSaveSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
}
