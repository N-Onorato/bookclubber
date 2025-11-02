'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CycleWithPhases, Phase } from '@/lib/types';

export default function AdminPage() {
    const [cycles, setCycles] = useState<CycleWithPhases[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        suggestionStart: '',
        votingStart: '',
        votingEnd: '',
        theme: '',
        maxSuggestionsPerUser: 3,
        maxVotesPerUser: 3
    });

    useEffect(() => {
        loadCycles();
    }, []);

    // Function to get datetime string with 12PM in local timezone
    const getDefaultDateTime = (daysFromNow: number = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        // Format as YYYY-MM-DDTHH:MM in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T12:00`;
    };

    useEffect(() => {
        // Set default times when form opens
        if (showCreateForm && !formData.suggestionStart) {
            setFormData({
                suggestionStart: getDefaultDateTime(0),
                votingStart: getDefaultDateTime(7),
                votingEnd: getDefaultDateTime(14),
                theme: '',
                maxSuggestionsPerUser: 3,
                maxVotesPerUser: 3
            });
        }
    }, [showCreateForm, formData.suggestionStart]);

    const loadCycles = async () => {
        try {
            const response = await fetch('/api/cycles');
            if (response.ok) {
                const data = await response.json();
                setCycles(data.cycles);
            }
        } catch (error) {
            console.error('Error loading cycles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCycle = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Step 1: Create the top-level cycle
            const cycleResponse = await fetch('/api/cycles/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.theme ? `${formData.theme} Cycle` : undefined,
                    theme: formData.theme || undefined
                })
            });

            if (!cycleResponse.ok) {
                const data = await cycleResponse.json();
                alert(`Error creating cycle: ${data.error}`);
                return;
            }

            const cycleData = await cycleResponse.json();
            const cycleId = cycleData.cycle.id;

            // Step 2: Create suggestion phase
            const suggestionResponse = await fetch('/api/cycles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cycleId,
                    type: 'suggestion',
                    startsAt: formData.suggestionStart,
                    endsAt: formData.votingStart,
                    theme: formData.theme || undefined,
                    maxSuggestionsPerUser: formData.maxSuggestionsPerUser,
                    maxVotesPerUser: formData.maxVotesPerUser
                })
            });

            if (!suggestionResponse.ok) {
                const data = await suggestionResponse.json();
                alert(`Error creating suggestion phase: ${data.error}`);
                return;
            }

            // Step 3: Create voting phase
            const votingResponse = await fetch('/api/cycles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cycleId,
                    type: 'voting',
                    startsAt: formData.votingStart,
                    endsAt: formData.votingEnd,
                    theme: formData.theme || undefined,
                    maxSuggestionsPerUser: formData.maxSuggestionsPerUser,
                    maxVotesPerUser: formData.maxVotesPerUser
                })
            });

            if (!votingResponse.ok) {
                const data = await votingResponse.json();
                alert(`Error creating voting phase: ${data.error}`);
                return;
            }

            // Success - reset form and reload
            setShowCreateForm(false);
            setFormData({
                suggestionStart: '',
                votingStart: '',
                votingEnd: '',
                theme: '',
                maxSuggestionsPerUser: 3,
                maxVotesPerUser: 3
            });
            loadCycles();
        } catch (error) {
            console.error('Error creating cycle:', error);
            alert('Failed to create cycle');
        }
    };

    const handleDeleteCycle = async (cycleId: string) => {
        if (!confirm('Are you sure you want to delete this cycle? This will also delete all phases and associated suggestions and votes.')) {
            return;
        }

        try {
            const response = await fetch(`/api/cycles/${cycleId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadCycles();
            } else {
                const data = await response.json();
                alert(`Error deleting cycle: ${data.error}`);
            }
        } catch (error) {
            console.error('Error deleting cycle:', error);
            alert('Failed to delete cycle');
        }
    };

    // Check if a phase is currently active based on dates
    const isPhaseCurrentlyActive = (phase: Phase) => {
        const now = new Date();
        const start = new Date(phase.starts_at);
        const end = new Date(phase.ends_at);
        return now >= start && now <= end;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <Link href="/dashboard" className="text-accent hover:underline text-sm mb-2 block">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold font-serif text-foreground mb-2">
                            Admin Panel
                        </h1>
                        <p className="text-foreground/60">
                            Manage cycles and club settings
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="px-4 py-2 bg-accent/20 backdrop-blur-lg rounded-full border border-accent text-foreground hover:bg-accent/30 transition-colors"
                    >
                        {showCreateForm ? 'Cancel' : '+ New Cycle'}
                    </button>
                </div>
            </header>

            {/* Create Cycle Form */}
            {showCreateForm && (
                <div className="max-w-6xl mx-auto mb-8">
                    <form
                        onSubmit={handleCreateCycle}
                        className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]"
                    >
                        <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">
                            Create New Cycle
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-foreground/70 text-sm mb-2">
                                    Theme (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.theme}
                                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                                    placeholder="e.g., Science Fiction, Mystery, Classics"
                                    className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-foreground/70 text-sm mb-2">
                                        Suggestions Start
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.suggestionStart}
                                        onChange={(e) => setFormData({ ...formData, suggestionStart: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-foreground/70 text-sm mb-2">
                                        Voting Starts
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.votingStart}
                                        onChange={(e) => setFormData({ ...formData, votingStart: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-foreground/70 text-sm mb-2">
                                        Voting Ends
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.votingEnd}
                                        onChange={(e) => setFormData({ ...formData, votingEnd: e.target.value })}
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-foreground/70 text-sm mb-2">
                                        Max Suggestions Per User
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.maxSuggestionsPerUser}
                                        onChange={(e) => setFormData({ ...formData, maxSuggestionsPerUser: parseInt(e.target.value) || 3 })}
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-foreground/70 text-sm mb-2">
                                        Max Votes Per User
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.maxVotesPerUser}
                                        onChange={(e) => setFormData({ ...formData, maxVotesPerUser: parseInt(e.target.value) || 3 })}
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                        required
                                    />
                                </div>
                            </div>

                            <p className="text-sm text-foreground/50 italic">
                                This will create a cycle with two phases: a suggestion phase followed by a voting phase.
                                Phases automatically become active based on the dates you set.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="mt-4 w-full px-6 py-3 bg-accent/20 border border-accent rounded-full text-foreground hover:bg-accent/30 transition-colors"
                        >
                            Create Cycle
                        </button>
                    </form>
                </div>
            )}

            {/* Cycles List */}
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">
                    All Cycles
                </h2>

                {cycles.length === 0 ? (
                    <div className="p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                        <p className="text-foreground/60">No cycles created yet</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {cycles.map((cycle) => {
                            const suggestionPhase = cycle.phases?.find((p: Phase) => p.type === 'suggestion');
                            const votingPhase = cycle.phases?.find((p: Phase) => p.type === 'voting');
                            const hasActivePhase = cycle.phases?.some((p: Phase) => isPhaseCurrentlyActive(p));

                            return (
                                <div
                                    key={cycle.id}
                                    className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-serif font-semibold text-foreground">
                                                    {cycle.name || (cycle.theme ? `${cycle.theme} Cycle` : 'Unnamed Cycle')}
                                                </h3>
                                                {hasActivePhase && (
                                                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            {cycle.theme && (
                                                <p className="text-foreground/60 text-sm">Theme: {cycle.theme}</p>
                                            )}
                                            <p className="text-foreground/40 text-xs mt-1">
                                                Created {new Date(cycle.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCycle(cycle.id)}
                                            className="ml-4 px-3 py-1 text-sm bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                                        >
                                            Delete Cycle
                                        </button>
                                    </div>

                                    {/* Phases */}
                                    <div className="space-y-3 mt-4">
                                        {suggestionPhase && (
                                            <div className="p-4 bg-[#27272A]/40 rounded-lg border border-[#27272A]">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-sm font-semibold text-foreground">📚 Suggestion Phase</h4>
                                                    {isPhaseCurrentlyActive(suggestionPhase) && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                                                            Active Now
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-foreground/60">
                                                    <div>
                                                        <div className="font-medium">Starts</div>
                                                        <div>{new Date(suggestionPhase.starts_at).toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Ends</div>
                                                        <div>{new Date(suggestionPhase.ends_at).toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Max Per User</div>
                                                        <div>{suggestionPhase.max_suggestions_per_user}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {votingPhase && (
                                            <div className="p-4 bg-[#27272A]/40 rounded-lg border border-[#27272A]">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-sm font-semibold text-foreground">🗳️ Voting Phase</h4>
                                                    {isPhaseCurrentlyActive(votingPhase) && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">
                                                            Active Now
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-foreground/60">
                                                    <div>
                                                        <div className="font-medium">Starts</div>
                                                        <div>{new Date(votingPhase.starts_at).toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Ends</div>
                                                        <div>{new Date(votingPhase.ends_at).toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Max Per User</div>
                                                        <div>{votingPhase.max_votes_per_user}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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