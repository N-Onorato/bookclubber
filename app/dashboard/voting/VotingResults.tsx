'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BacklitCard from '@/components/BacklitCard';

interface VoteCount {
    bookId: string;
    count: number;
    book: {
        id: string;
        title: string;
        author: string;
        cover_url?: string;
        local_cover_path?: string;
        description?: string;
        page_count?: number;
    };
}

interface VotingResultsProps {
    phaseId: string;
    currentUser: any;
}

export default function VotingResults({ phaseId, currentUser }: VotingResultsProps) {
    const [voteCounts, setVoteCounts] = useState<VoteCount[]>([]);
    const [winningBooks, setWinningBooks] = useState<any[]>([]);
    const [winningVoteCount, setWinningVoteCount] = useState(0);
    const [isTie, setIsTie] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
    const [phase, setPhase] = useState<any>(null);

    useEffect(() => {
        loadResults();
    }, [phaseId]);

    const loadResults = async () => {
        try {
            const response = await fetch(`/api/votes/results?phaseId=${phaseId}`);
            if (response.ok) {
                const data = await response.json();
                setVoteCounts(data.voteCounts);
                setWinningBooks(data.winningBooks);
                setWinningVoteCount(data.winningVoteCount);
                setIsTie(data.isTie);
                setPhase(data.phase);

                // Note: winner is now stored on the cycle, not phase
                // We would need to fetch the parent cycle to check winner_book_id
                // For now, selectedWinner will be set after admin selects it
            }
        } catch (error) {
            console.error('Error loading results:', error);
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

            if (response.ok) {
                setSelectedWinner(bookId);
                // Reload results to get updated data
                await loadResults();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error selecting winner:', error);
            alert('Failed to select winner');
        }
    };

    const getCoverUrl = (book: any) => {
        return book.local_cover_path
            ? `/api/covers/${book.local_cover_path.split('/').pop()}`
            : book.cover_url;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-foreground">Loading results...</div>
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
                <div>
                    <h1 className="text-4xl font-bold font-serif text-foreground mb-2">
                        Voting Results
                    </h1>
                    <p className="text-foreground/60">
                        🏆 The votes are in!
                        {phase?.theme && ` - ${phase.theme}`}
                    </p>
                </div>
            </header>

            {/* Winner Section */}
            {selectedWinner ? (
                // Single winner selected
                <div className="max-w-6xl mx-auto mb-8">
                    <BacklitCard glowColor="amber" intensity="strong">
                        <div className="p-8 bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-lg rounded-2xl border border-amber-500/50">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-serif font-bold text-amber-400 mb-2">
                                    🏆 Winner
                                </h2>
                                <p className="text-foreground/60">
                                    {winningVoteCount} vote{winningVoteCount !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {winningBooks.filter(b => b.id === selectedWinner).map((book) => (
                                <div key={book.id} className="flex gap-6 items-center justify-center">
                                    {getCoverUrl(book) && (
                                        <img
                                            src={getCoverUrl(book)}
                                            alt={book.title}
                                            className="w-64 h-auto object-cover rounded-lg shadow-2xl"
                                        />
                                    )}
                                    <div className="max-w-xl">
                                        <h3 className="text-3xl font-serif font-semibold text-foreground mb-2">
                                            {book.title}
                                        </h3>
                                        <p className="text-foreground/70 text-xl mb-4">by {book.author}</p>
                                        {book.description && (
                                            <p className="text-foreground/60 leading-relaxed">
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
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6">
                        <h2 className="text-2xl font-serif font-bold text-amber-400 mb-2 text-center">
                            🤝 It&apos;s a Tie!
                        </h2>
                        <p className="text-foreground/70 text-center">
                            {winningBooks.length} books are tied with {winningVoteCount} vote{winningVoteCount !== 1 ? 's' : ''} each.
                            {currentUser?.role === 'admin' && ' Select the winner below.'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {winningBooks.map((book) => (
                            <BacklitCard key={book.id} glowColor="amber" intensity="medium">
                                <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-amber-500/30">
                                    <div className="flex gap-6">
                                        {getCoverUrl(book) && (
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={getCoverUrl(book)}
                                                    alt={book.title}
                                                    className="w-48 h-auto object-cover rounded-lg shadow-lg"
                                                />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-2xl font-serif font-semibold text-foreground">
                                                            {book.title}
                                                        </h3>
                                                        <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 text-sm font-semibold">
                                                            {winningVoteCount} votes
                                                        </span>
                                                    </div>
                                                    <p className="text-foreground/70 text-lg mb-3">by {book.author}</p>
                                                </div>
                                                {currentUser?.role === 'admin' && (
                                                    <button
                                                        onClick={() => handleSelectWinner(book.id)}
                                                        className="ml-4 px-6 py-2 bg-accent/20 border border-accent rounded-full text-foreground hover:bg-accent/30 transition-colors text-sm font-semibold"
                                                    >
                                                        Select as Winner
                                                    </button>
                                                )}
                                            </div>

                                            {book.description && (
                                                <p className="text-foreground/60 text-sm leading-relaxed">
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
                <div className="max-w-6xl mx-auto mb-8">
                    <BacklitCard glowColor="amber" intensity="strong">
                        <div className="p-8 bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-lg rounded-2xl border border-amber-500/50">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-serif font-bold text-amber-400 mb-2">
                                    🏆 Winner
                                </h2>
                                <p className="text-foreground/60">
                                    {winningVoteCount} vote{winningVoteCount !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {winningBooks.map((book) => (
                                <div key={book.id} className="flex gap-6 items-center justify-center">
                                    {getCoverUrl(book) && (
                                        <img
                                            src={getCoverUrl(book)}
                                            alt={book.title}
                                            className="w-64 h-auto object-cover rounded-lg shadow-2xl"
                                        />
                                    )}
                                    <div className="max-w-xl">
                                        <h3 className="text-3xl font-serif font-semibold text-foreground mb-2">
                                            {book.title}
                                        </h3>
                                        <p className="text-foreground/70 text-xl mb-4">by {book.author}</p>
                                        {book.description && (
                                            <p className="text-foreground/60 leading-relaxed">
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
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">All Results</h2>
                {voteCounts.length === 0 ? (
                    <div className="p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                        <p className="text-foreground/60">No votes were cast in this phase.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {voteCounts.map((voteCount, index) => {
                            const isWinner = selectedWinner
                                ? voteCount.bookId === selectedWinner
                                : winningBooks.some(w => w.id === voteCount.bookId);

                            return (
                                <div
                                    key={voteCount.bookId}
                                    className={`p-4 rounded-xl border backdrop-blur-lg transition-all ${
                                        isWinner
                                            ? 'bg-amber-500/10 border-amber-500/30'
                                            : 'bg-[#18181B]/60 border-[#27272A]'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl font-bold text-foreground/40 w-8">
                                                #{index + 1}
                                            </span>
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    {voteCount.book.title}
                                                </h3>
                                                <p className="text-foreground/60 text-sm">by {voteCount.book.author}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {isWinner && (
                                                <span className="text-amber-400 text-xl">🏆</span>
                                            )}
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
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
