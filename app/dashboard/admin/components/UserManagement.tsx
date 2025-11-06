'use client';

import { useState, useEffect } from 'react';

interface PendingUser {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
}

export default function UserManagement() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingUserId, setProcessingUserId] = useState<string | null>(null);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users/pending');

            if (!response.ok) {
                throw new Error('Failed to fetch pending users');
            }

            const data = await response.json();
            setPendingUsers(data.users || []);
        } catch (err) {
            console.error('Error fetching pending users:', err);
            setError('Failed to load pending users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const handleApprove = async (userId: string) => {
        if (!confirm('Are you sure you want to approve this user?')) {
            return;
        }

        setProcessingUserId(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}/approve`, {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to approve user');
            }

            // Remove user from pending list
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Error approving user:', err);
            alert(err instanceof Error ? err.message : 'Failed to approve user');
        } finally {
            setProcessingUserId(null);
        }
    };

    const handleReject = async (userId: string) => {
        if (!confirm('Are you sure you want to reject this user? This will delete their account.')) {
            return;
        }

        setProcessingUserId(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}/reject`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to reject user');
            }

            // Remove user from pending list
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Error rejecting user:', err);
            alert(err instanceof Error ? err.message : 'Failed to reject user');
        } finally {
            setProcessingUserId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-serif text-foreground">
                    User Management
                </h2>
                <button
                    onClick={fetchPendingUsers}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm bg-[#3F3F46] text-foreground rounded-lg hover:bg-[#52525B] disabled:opacity-50"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-foreground/60">
                    Loading pending users...
                </div>
            ) : error ? (
                <div className="p-6 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] rounded-lg">
                    {error}
                </div>
            ) : pendingUsers.length === 0 ? (
                <div className="p-8 text-center bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                    <div className="flex justify-center mb-3">
                        <svg className="w-12 h-12 text-[#52525B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-foreground/60">
                        No pending user approvals
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pendingUsers.map((user) => (
                        <div
                            key={user.id}
                            className="p-4 bg-[#18181B]/60 backdrop-blur-lg rounded-xl border border-[#27272A] hover:border-[#3F3F46] transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-medium text-foreground">
                                            {user.name}
                                        </h3>
                                        <span className="px-2 py-0.5 text-xs bg-[#3F3F46] text-foreground/70 rounded">
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/60">
                                        {user.email}
                                    </p>
                                    <p className="text-xs text-foreground/40 mt-1">
                                        Registered: {formatDate(user.created_at)}
                                    </p>
                                </div>

                                <div className="flex gap-2 justify-center sm:justify-end">
                                    <button
                                        onClick={() => handleApprove(user.id)}
                                        disabled={processingUserId === user.id}
                                        className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm whitespace-nowrap"
                                    >
                                        {processingUserId === user.id ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleReject(user.id)}
                                        disabled={processingUserId === user.id}
                                        className="px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm whitespace-nowrap"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pendingUsers.length > 0 && (
                <div className="pt-2 text-sm text-foreground/50 text-center">
                    {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} pending approval
                </div>
            )}
        </div>
    );
}