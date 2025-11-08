'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReadingSection from '@/app/components/ReadingSection';
import AdminSectionManager from '@/app/components/AdminSectionManager';
import type { ReadingSectionWithDetails, User, CycleContext } from '@/lib/types';

export default function ReadingPage() {
    const [cycleContext, setCycleContext] = useState<CycleContext | null>(null);
    const [sections, setSections] = useState<ReadingSectionWithDetails[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadActiveCycle();
        loadCurrentUser();
    }, []);

    const loadActiveCycle = async () => {
        try {
            setError(null);
            const response = await fetch('/api/cycles/active');
            if (response.ok) {
                const data = await response.json();
                setCycleContext(data);
                if (data.cycle?.id) {
                    loadSections(data.cycle.id);
                }
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to load active cycle');
            }
        } catch (err) {
            console.error('Error loading active cycle:', err);
            setError(err instanceof Error ? err.message : 'Failed to load active cycle');
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
            console.error('Error loading current user:', error);
        }
    };

    const loadSections = async (cycleId: string) => {
        try {
            const response = await fetch(`/api/cycles/${cycleId}/sections`);
            if (response.ok) {
                const data = await response.json();
                setSections(data);
            } else {
                const data = await response.json();
                console.error('Error loading sections:', data.error);
            }
        } catch (err) {
            console.error('Error loading sections:', err);
        }
    };

    const handleRefreshSections = () => {
        if (cycleContext?.cycle?.id) {
            loadSections(cycleContext.cycle.id);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm('Are you sure you want to delete this section? All notes will be deleted.')) {
            return;
        }

        try {
            const response = await fetch(
                `/api/cycles/${cycleContext.cycle.id}/sections/${sectionId}`,
                { method: 'DELETE' }
            );

            if (response.ok) {
                handleRefreshSections();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete section');
            }
        } catch (error) {
            console.error('Error deleting section:', error);
            alert('Failed to delete section');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-foreground">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-6xl mx-auto">
                    <Link href="/dashboard" className="text-accent hover:underline text-sm mb-4 block">
                        ← Back to Dashboard
                    </Link>
                    <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Page</h2>
                        <p className="text-foreground/70 mb-4">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                                loadActiveCycle();
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

    if (!cycleContext?.cycle) {
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

    // TODO: Fetch book details and reading schedule when winner is available
    const winnerBookId = cycleContext.cycle.winner_book_id;

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-8">
                <Link href="/dashboard" className="text-accent hover:underline text-sm mb-2 block">
                    ← Back to Dashboard
                </Link>
                <div>
                    <h1 className="text-4xl font-bold font-serif text-foreground mb-2">
                        Current Reading
                    </h1>
                    <p className="text-foreground/60">
                        📚 Reading Phase
                        {cycleContext.cycle?.theme && ` - ${cycleContext.cycle.theme}`}
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
                {!winnerBookId ? (
                    <div className="p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                        <h2 className="text-xl font-serif text-foreground mb-2">Book Selection In Progress</h2>
                        <p className="text-foreground/60">
                            {cycleContext.isSuggestionOpen && "Suggestion phase is currently open."}
                            {cycleContext.isVotingOpen && "Voting is currently in progress."}
                            {!cycleContext.isSuggestionOpen && !cycleContext.isVotingOpen && !cycleContext.hasVotingEnded && "Waiting for voting to begin."}
                            {cycleContext.hasVotingEnded && "Voting has ended. The winner will be announced soon!"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Current Book Display */}
                        <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                            <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">
                                Currently Reading
                            </h2>
                            <div className="flex gap-6">
                                <div className="flex-shrink-0">
                                    {cycleContext.winnerBook?.local_cover_path ? (
                                        <Image
                                            src={`/api/covers/${cycleContext.winnerBook.local_cover_path.split('/').pop()}`}
                                            alt={cycleContext.winnerBook.title || 'Book cover'}
                                            width={192}
                                            height={288}
                                            className="rounded-lg object-cover"
                                        />
                                    ) : cycleContext.winnerBook?.cover_url ? (
                                        <Image
                                            src={cycleContext.winnerBook.cover_url}
                                            alt={cycleContext.winnerBook.title || 'Book cover'}
                                            width={192}
                                            height={288}
                                            className="rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-48 h-72 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-500 text-sm">Book Cover</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    {cycleContext.winnerBook ? (
                                        <>
                                            <h3 className="text-2xl font-serif text-foreground mb-2">
                                                {cycleContext.winnerBook.title}
                                            </h3>
                                            <p className="text-foreground/70 text-lg mb-4">
                                                by {cycleContext.winnerBook.author}
                                            </p>
                                            {cycleContext.winnerBook.description && (
                                                <p className="text-foreground/60 mb-4 line-clamp-4">
                                                    {cycleContext.winnerBook.description}
                                                </p>
                                            )}
                                            {cycleContext.winnerBook.page_count && (
                                                <p className="text-foreground/50 text-sm">
                                                    {cycleContext.winnerBook.page_count} pages
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-foreground/60 text-sm">
                                            Winner ID: {winnerBookId}
                                        </p>
                                    )}
                                    <p className="text-foreground/70 mt-4">
                                        Reading schedule and chapter details will be displayed here once configured by the admin.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reading Schedule & Sections */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-serif font-semibold text-foreground">
                                    Reading Schedule
                                </h3>
                            </div>

                            {/* Admin Section Manager */}
                            {currentUser?.role === 'admin' && cycleContext?.cycle?.id && (
                                <AdminSectionManager
                                    cycleId={cycleContext.cycle.id}
                                    onSectionCreated={handleRefreshSections}
                                />
                            )}

                            {/* Sections List */}
                            {sections.length > 0 ? (
                                <div className="bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] overflow-hidden">
                                    {sections.map((section) => (
                                        <ReadingSection
                                            key={section.id}
                                            section={section}
                                            currentUser={currentUser}
                                            isAdmin={currentUser?.role === 'admin'}
                                            onDeleteSection={handleDeleteSection}
                                            onRefresh={handleRefreshSections}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                                    <p className="text-foreground/60 text-sm">
                                        {currentUser?.role === 'admin'
                                            ? 'No sections yet. Add sections to organize discussions and notes.'
                                            : 'The reading schedule will be available once the admin has configured it.'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Next Meeting Placeholder */}
                        <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                            <h3 className="text-xl font-serif font-semibold text-foreground mb-4">
                                Next Meeting
                            </h3>
                            <p className="text-foreground/60 text-sm">
                                Meeting information will be displayed here once scheduled.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
