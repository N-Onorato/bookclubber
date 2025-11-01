'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'member';
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                router.push('/auth/login');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/auth/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-foreground">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold font-serif text-foreground mb-2">
                            The Book Circle
                        </h1>
                        <p className="text-foreground/60">
                            Welcome back, {user.name}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-[#18181B]/60 backdrop-blur-lg rounded-full border border-[#27272A] text-foreground hover:border-accent transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Cycle Card */}
                    <Link
                        href="/dashboard/suggestions"
                        className="block p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] hover:border-accent transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-3xl">📚</div>
                            <h2 className="text-2xl font-serif font-semibold text-foreground">
                                Book Suggestions
                            </h2>
                        </div>
                        <p className="text-foreground/70">
                            Suggest books for the current cycle and view what others have recommended.
                        </p>
                        <div className="mt-4 text-accent group-hover:translate-x-1 transition-transform inline-block">
                            View Suggestions →
                        </div>
                    </Link>

                    {/* Voting Card */}
                    <Link
                        href="/dashboard/voting"
                        className="block p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] hover:border-accent transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-3xl">🗳️</div>
                            <h2 className="text-2xl font-serif font-semibold text-foreground">
                                Vote on Books
                            </h2>
                        </div>
                        <p className="text-foreground/70">
                            Cast your vote for the next book the club will read together.
                        </p>
                        <div className="mt-4 text-accent group-hover:translate-x-1 transition-transform inline-block">
                            Go to Voting →
                        </div>
                    </Link>

                    {/* Admin Panel */}
                    {user.role === 'admin' && (
                        <Link
                            href="/dashboard/admin"
                            className="block p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] hover:border-accent transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-3xl">⚙️</div>
                                <h2 className="text-2xl font-serif font-semibold text-foreground">
                                    Admin Panel
                                </h2>
                            </div>
                            <p className="text-foreground/70">
                                Manage cycles, books, and club settings.
                            </p>
                            <div className="mt-4 text-accent group-hover:translate-x-1 transition-transform inline-block">
                                Manage Club →
                            </div>
                        </Link>
                    )}

                    {/* Reading Progress */}
                    <Link
                        href="/dashboard/reading"
                        className="block p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] hover:border-accent transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-3xl">📖</div>
                            <h2 className="text-2xl font-serif font-semibold text-foreground">
                                Current Reading
                            </h2>
                        </div>
                        <p className="text-foreground/70">
                            Track your progress and view the reading schedule.
                        </p>
                        <div className="mt-4 text-accent group-hover:translate-x-1 transition-transform inline-block">
                            View Progress →
                        </div>
                    </Link>
                </div>
            </div>

            {/* Quote */}
            <div className="max-w-6xl mx-auto mt-12 text-center">
                <p className="text-foreground/50 italic font-serif">
                    "A reader lives a thousand lives before he dies... The man who never reads lives only one."
                </p>
                <p className="text-foreground/40 text-sm mt-2">— George R.R. Martin</p>
            </div>
        </div>
    );
}