'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BacklitCard from '@/components/BacklitCard';

interface Book {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
    local_cover_path?: string;
    description?: string;
    page_count?: number;
}

interface VoteCount {
    bookId: string;
    count: number;
    book: Book;
}

interface Phase {
    id: string;
    theme?: string;
    cycle_id: string;
}

interface User {
    id: string;
    role: 'admin' | 'member';
    name: string;
    email: string;
}

interface VotingResultsProps {
    phaseId: string;
    currentUser: User;
}

export default function VotingResults({ phaseId, currentUser }: VotingResultsProps) {
    const [voteCounts, setVoteCounts] = useState<VoteCount[]>([]);
    const [winningBooks, setWinningBooks] = useState<Book[]>([]);
    const [winningVoteCount, setWinningVoteCount] = useState(0);
    const [isTie, setIsTie] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
    const [phase, setPhase] = useState<Phase | null>(null);

    useEffect(() => {
        loadResults();
    }, [phaseId]);

    const loadResults = async () => {
        try {
            setError(null);
            const response = await fetch(`/api/votes/results?phaseId=${phaseId}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to load results');
            }

            const data = await response.json();
            setVoteCounts(data.voteCounts);
            setWinningBooks(data.winningBooks);
            setWinningVoteCount(data.winningVoteCount);
            setIsTie(data.isTie);
            setPhase(data.phase);

            // Check if a winner has been selected (either automatically or by admin)
            if (data.winnerBookId) {
                setSelectedWinner(data.winnerBookId);
            }
        } catch (error) {
            console.error('Error loading results:', error);
            setError(error instanceof Error ? error.message : 'Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectWinner = async (bookId: string) => {
        if (currentUser.role !== 'admin') return;

        try {
            const response = await fetch('/api/votes/select-winner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phaseId,
                    bookId
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to select winner');
            }

            setSelectedWinner(bookId);
            // Reload results to get updated data
            await loadResults();
        } catch (error) {
            console.error('Error selecting winner:', error);
            setError(error instanceof Error ? error.message : 'Failed to select winner');
        }
    };

    const getCoverUrl = (book: Book): string | undefined => {
        return book.local_cover_path
            ? `/api/covers/${book.local_cover_path.split('/').pop()}`
            : book.cover_url;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                    <div className="text-foreground">Loading results...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <Link href="/dashboard" className="text-accent hover:underline text-sm mb-4 block">
                        ← Back to Dashboard
                    </Link>
                    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Results</h2>
                        <p className="text-foreground/70 mb-4">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                loadResults();
                            }}
                            className="px-4 py-2 bg-accent/20 border border-accent rounded-lg text-foreground hover:bg-accent/30 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-6 sm:mb-8">
                <Link href="/dashboard" className="text-accent hover:underline text-sm mb-2 block">
                    ← Back to Dashboard
                </Link>
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-foreground mb-2">
                        Voting Results
                    </h1>
                    <p className="text-sm sm:text-base text-foreground/60">
                        🏆 The votes are in!
                        {phase?.theme && ` - ${phase.theme}`}
                    </p>
                </div>
            </header>

            {/* Winner Section */}
            {selectedWinner ? (
                // Single winner selected
                <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
                    <BacklitCard glowColor="amber" intensity="strong">
                        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-lg rounded-2xl border border-amber-500/50">
                            <div className="text-center mb-4 sm:mb-6">
                                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 mb-2">
                                    🏆 Winner
                                </h2>
                                <p className="text-sm sm:text-base text-foreground/60">
                                    {winningVoteCount} vote{winningVoteCount !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {winningBooks.filter(b => b.id === selectedWinner).map((book) => (
                                <div key={book.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
                                    {getCoverUrl(book) && (
                                        <img
                                            src={getCoverUrl(book)}
                                            alt={`Cover of ${book.title}`}
                                            className="w-48 sm:w-56 lg:w-64 h-auto object-cover shadow-2xl rounded"
                                        />
                                    )}
                                    <div className="max-w-xl text-center sm:text-left">
                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-foreground mb-2">
                                            {book.title}
                                        </h3>
                                        <p className="text-foreground/70 text-base sm:text-lg lg:text-xl mb-3 sm:mb-4">
                                            by {book.author}
                                        </p>
                                        {book.description && (
                                            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
                                                {book.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </BacklitCard>
                </div>
            ) : isTie && winningBooks.length > 1 ? (
                // Tie - show all tied books
                <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
                    <div className="p-4 sm:p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-400 mb-2 text-center">
                            🤝 It&apos;s a Tie!
                        </h2>
                        <p className="text-sm sm:text-base text-foreground/70 text-center">
                            {winningBooks.length} books are tied with {winningVoteCount} vote{winningVoteCount !== 1 ? 's' : ''} each.
                            {currentUser?.role === 'admin' && ' Select the winner below.'}
                        </p>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        {winningBooks.map((book) => (
                            <BacklitCard key={book.id} glowColor="amber" intensity="medium">
                                <div className="p-4 sm:p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-amber-500/30">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        {getCoverUrl(book) && (
                                            <div className="flex-shrink-0 mx-auto sm:mx-0">
                                                <img
                                                    src={getCoverUrl(book)}
                                                    alt={`Cover of ${book.title}`}
                                                    className="w-40 sm:w-48 h-auto object-cover shadow-lg rounded"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                                                <div className="flex-1 text-center sm:text-left">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-semibold text-foreground">
                                                            {book.title}
                                                        </h3>
                                                        <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 text-xs sm:text-sm font-semibold self-center sm:self-auto">
                                                            {winningVoteCount} votes
                                                        </span>
                                                    </div>
                                                    <p className="text-foreground/70 text-base sm:text-lg mb-3">by {book.author}</p>
                                                </div>
                                                {currentUser?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleSelectWinner(book.id)}
                                                        aria-label={`Select ${book.title} as winner`}
                                                        className="w-full sm:w-auto sm:ml-4 px-4 sm:px-6 py-2 bg-accent/20 border border-accent rounded-full text-foreground hover:bg-accent/30 transition-colors text-sm font-semibold"
                                                    >
                                                        Select as Winner
                                                    </button>
                                                )}
                                            </div>

                                            {book.description && (
                                                <p className="text-foreground/60 text-sm sm:text-base leading-relaxed text-center sm:text-left">
                                                    {book.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </BacklitCard>
                        ))}
                    </div>
                </div>
            ) : winningBooks.length === 1 ? (
                // Single winner (no tie)
                <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
                    <BacklitCard glowColor="amber" intensity="strong">
                        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-lg rounded-2xl border border-amber-500/50">
                            <div className="text-center mb-4 sm:mb-6">
                                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 mb-2">
                                    🏆 Winner
                                </h2>
                                <p className="text-sm sm:text-base text-foreground/60">
                                    {winningVoteCount} vote{winningVoteCount !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {winningBooks.map((book) => (
                                <div key={book.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
                                    {getCoverUrl(book) && (
                                        <img
                                            src={getCoverUrl(book)}
                                            alt={`Cover of ${book.title}`}
                                            className="w-48 sm:w-56 lg:w-64 h-auto object-cover shadow-2xl rounded"
                                        />
                                    )}
                                    <div className="max-w-xl text-center sm:text-left">
                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-foreground mb-2">
                                            {book.title}
                                        </h3>
                                        <p className="text-foreground/70 text-base sm:text-lg lg:text-xl mb-3 sm:mb-4">
                                            by {book.author}
                                        </p>
                                        {book.description && (
                                            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
                                                {book.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </BacklitCard>
                </div>
            ) : null}

            {/* All Results */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3 sm:mb-4">All Results</h2>
                {voteCounts.length === 0 ? (
                    <div className="p-6 sm:p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                        <p className="text-sm sm:text-base text-foreground/60">No votes were cast in this phase.</p>
                    </div>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {voteCounts.map((voteCount, index) => {
                            const isWinner = selectedWinner
                                ? voteCount.bookId === selectedWinner
                                : winningBooks.some(w => w.id === voteCount.bookId);

                            return (
                                <div
                                    key={voteCount.bookId}
                                    className={`p-3 sm:p-4 rounded-xl border backdrop-blur-lg transition-all ${
                                        isWinner
                                            ? 'bg-amber-500/10 border-amber-500/30'
                                            : 'bg-[#18181B]/60 border-[#27272A]'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                            <span className="text-lg sm:text-2xl font-bold text-foreground/40 w-6 sm:w-8 flex-shrink-0">
                                                #{index + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                                                    {voteCount.book.title}
                                                </h3>
                                                <p className="text-foreground/60 text-xs sm:text-sm truncate">
                                                    by {voteCount.book.author}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                                            {isWinner && (
                                                <span className="text-amber-400 text-lg sm:text-xl" aria-label="Winner">🏆</span>
                                            )}
                                            <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
                                                isWinner
                                                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                                                    : 'bg-[#18181B]/40 border border-[#27272A] text-foreground/70'
                                            }`}>
                                                {voteCount.count} vote{voteCount.count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
