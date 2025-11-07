'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import WinnerCard from './WinnerCard';
import TieCard from './TieCard';
import ResultsList from './ResultsList';
import LoadingSkeleton from './LoadingSkeleton';

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
        return <LoadingSkeleton />;
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
                    {winningBooks.filter(b => b.id === selectedWinner).map((book) => (
                        <WinnerCard
                            key={book.id}
                            book={book}
                            voteCount={winningVoteCount}
                            getCoverUrl={getCoverUrl}
                        />
                    ))}
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
                            <TieCard
                                key={book.id}
                                book={book}
                                voteCount={winningVoteCount}
                                isAdmin={currentUser?.role === 'admin'}
                                onSelectWinner={handleSelectWinner}
                                getCoverUrl={getCoverUrl}
                            />
                        ))}
                    </div>
                </div>
            ) : winningBooks.length === 1 ? (
                // Single winner (no tie)
                <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
                    {winningBooks.map((book) => (
                        <WinnerCard
                            key={book.id}
                            book={book}
                            voteCount={winningVoteCount}
                            getCoverUrl={getCoverUrl}
                        />
                    ))}
                </div>
            ) : null}

            {/* All Results */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3 sm:mb-4">All Results</h2>
                <ResultsList
                    voteCounts={voteCounts}
                    selectedWinner={selectedWinner}
                    winningBooks={winningBooks}
                />
            </div>
        </div>
    );
}
