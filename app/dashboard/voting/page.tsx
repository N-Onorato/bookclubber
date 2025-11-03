'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import VotingCard from './VotingCard';
import VotingResults from './VotingResults';
import { Vote } from '@/lib/types';

interface BookWithVotes {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
    local_cover_path?: string;
    description?: string;
    page_count?: number;
}

export default function VotingPage() {
    const [cycleContext, setCycleContext] = useState<any>(null);
    const [books, setBooks] = useState<BookWithVotes[]>([]);
    const [userVotes, setUserVotes] = useState<Vote[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    useEffect(() => {
        loadData();
    }, []);

    // Timer countdown
    useEffect(() => {
        if (!cycleContext?.votingPhase) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const endsAt = new Date(cycleContext.votingPhase.ends_at).getTime();
            const remaining = Math.max(0, endsAt - now);
            setTimeRemaining(remaining);

            // If voting just ended (within the last second), reload the page data
            if (remaining === 0 && !cycleContext.hasVotingEnded) {
                loadActiveCycle();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [cycleContext]);

    const loadData = async () => {
        try {
            await Promise.all([
                loadCurrentUser(),
                loadActiveCycle(),
            ]);
        } finally {
            setLoading(false);
        }
    };

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

                if (data.votingPhase) {
                    await loadBooksAndVotes(data.votingPhase.id);
                }
            }
        } catch (error) {
            console.error('Error loading active cycle:', error);
        }
    };

    const loadBooksAndVotes = async (phaseId: string) => {
        try {
            // For a voting phase, we need to load suggestions from the suggestion phase
            // The API will handle finding the related suggestion phase
            const suggestionsResponse = await fetch(`/api/suggestions?phaseId=${phaseId}`);
            if (suggestionsResponse.ok) {
                const suggestionsData = await suggestionsResponse.json();
                // Extract unique books from suggestions
                const uniqueBooks = Array.from(
                    new Map(
                        suggestionsData.suggestions.map((s: any) => [
                            s.book_id,
                            {
                                id: s.book_id,
                                title: s.title,
                                author: s.author,
                                cover_url: s.cover_url,
                                local_cover_path: s.local_cover_path,
                                description: s.description,
                                cover_image_url: s.cover_image_url,
                            }
                        ])
                    ).values()
                ) as BookWithVotes[];
                setBooks(uniqueBooks);
            }

            // Load user's votes for this voting phase
            const votesResponse = await fetch(`/api/votes?phaseId=${phaseId}`);
            if (votesResponse.ok) {
                const votesData = await votesResponse.json();
                setUserVotes(votesData.votes);
            }
        } catch (error) {
            console.error('Error loading books and votes:', error);
        }
    };

    const handleVote = async (bookId: string) => {
        if (!cycleContext?.votingPhase || cycleContext.hasVotingEnded) return;

        try {
            const response = await fetch('/api/votes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phaseId: cycleContext.votingPhase.id,
                    bookId
                })
            });

            if (response.ok) {
                await loadBooksAndVotes(cycleContext.votingPhase.id);
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error casting vote:', error);
            alert('Failed to cast vote');
        }
    };

    const handleUnvote = async (bookId: string) => {
        if (!cycleContext?.votingPhase || cycleContext.hasVotingEnded) return;

        try {
            const response = await fetch('/api/votes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phaseId: cycleContext.votingPhase.id,
                    bookId
                })
            });

            if (response.ok) {
                await loadBooksAndVotes(cycleContext.votingPhase.id);
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error removing vote:', error);
            alert('Failed to remove vote');
        }
    };

    const formatTimeRemaining = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const getUserVoteCount = () => {
        return userVotes.length;
    };

    const hasVotedForBook = (bookId: string) => {
        return userVotes.some(v => v.book_id === bookId);
    };

    const canVote = () => {
        if (!cycleContext?.votingPhase || !currentUser || cycleContext.hasVotingEnded) return false;
        return getUserVoteCount() < cycleContext.votingPhase.max_votes_per_user;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-foreground">Loading...</div>
            </div>
        );
    }

    if (!cycleContext?.votingPhase) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <Link href="/dashboard" className="text-accent hover:underline text-sm mb-4 block">
                        ← Back to Dashboard
                    </Link>
                    <div className="p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                        <h2 className="text-2xl font-serif text-foreground mb-2">No Active Voting Phase</h2>
                        <p className="text-foreground/60">There is no active voting phase at the moment.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show results if voting has ended
    if (cycleContext.hasVotingEnded) {
        return <VotingResults phaseId={cycleContext.votingPhase.id} currentUser={currentUser} />;
    }

    // Show countdown if voting hasn't started yet
    if (!cycleContext.isVotingOpen) {
        const startsAt = new Date(cycleContext.votingPhase.starts_at);
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <Link href="/dashboard" className="text-accent hover:underline text-sm mb-4 block">
                        ← Back to Dashboard
                    </Link>
                    <div className="p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                        <h2 className="text-2xl font-serif text-foreground mb-4">Voting Opens Soon</h2>
                        <p className="text-foreground/60 mb-2">Voting begins on:</p>
                        <p className="text-xl font-semibold text-accent">{startsAt.toLocaleString()}</p>
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
                            Vote for Next Book
                        </h1>
                        <p className="text-foreground/60">
                            🗳️ Voting Phase
                            {cycleContext.cycle?.theme && ` - ${cycleContext.cycle.theme}`}
                        </p>
                        <div className="flex gap-4 items-center mt-3">
                            <p className="text-sm text-foreground/50">
                                Your votes: <span className="text-accent font-semibold">{getUserVoteCount()} / {cycleContext.votingPhase.max_votes_per_user}</span>
                            </p>
                            <div className="h-4 w-px bg-foreground/20"></div>
                            <p className="text-sm text-foreground/50">
                                Time remaining: <span className="text-accent font-mono">{formatTimeRemaining(timeRemaining)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Voting Instructions */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl">
                    <p className="text-foreground/70 text-sm">
                        Cast up to {cycleContext.votingPhase.max_votes_per_user} vote(s) for your favorite book(s).
                        You can change your votes until the timer runs out.
                        Other members cannot see your votes until voting ends.
                    </p>
                </div>
            </div>

            {/* Books List */}
            <div className="max-w-6xl mx-auto">
                {books.length === 0 ? (
                    <div className="p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                        <p className="text-foreground/60">No books available for voting.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {books.map((book) => (
                            <VotingCard
                                key={book.id}
                                book={book}
                                hasVoted={hasVotedForBook(book.id)}
                                canVote={canVote() || hasVotedForBook(book.id)}
                                onVote={handleVote}
                                onUnvote={handleUnvote}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
