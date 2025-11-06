'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';

export default function MembersManagement() {
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingUserId, setProcessingUserId] = useState<string | null>(null);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');

            if (!response.ok) {
                throw new Error('Failed to fetch members');
            }

            const data = await response.json();
            setMembers(data.users || []);
        } catch (err) {
            console.error('Error fetching members:', err);
            setError('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleRoleChange = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        const confirmMessage = `Are you sure you want to change this user's role to ${newRole}?`;

        if (!confirm(confirmMessage)) {
            return;
        }

        setProcessingUserId(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update role');
            }

            // Update the user in the list
            setMembers(prev => prev.map(m =>
                m.id === userId ? { ...m, role: newRole as 'admin' | 'member' } : m
            ));
        } catch (err) {
            console.error('Error updating role:', err);
            alert(err instanceof Error ? err.message : 'Failed to update role');
        } finally {
            setProcessingUserId(null);
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            return;
        }

        setProcessingUserId(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}/delete`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete user');
            }

            // Remove user from the list
            setMembers(prev => prev.filter(m => m.id !== userId));
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete user');
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
        });
    };

    const getRoleBadgeColor = (role: string) => {
        return role === 'admin' ? 'bg-[#4F46E5] text-white' : 'bg-[#3F3F46] text-foreground/70';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-serif text-foreground">
                    Members Management
                </h2>
                <button
                    onClick={fetchMembers}
                    disabled={loading}
                    className="px-3 py-1.5 text-sm bg-[#3F3F46] text-foreground rounded-lg hover:bg-[#52525B] disabled:opacity-50"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-foreground/60">
                    Loading members...
                </div>
            ) : error ? (
                <div className="p-6 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] rounded-lg">
                    {error}
                </div>
            ) : members.length === 0 ? (
                <div className="p-8 text-center bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                    <p className="text-foreground/60">
                        No members found
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="p-4 bg-[#18181B]/60 backdrop-blur-lg rounded-xl border border-[#27272A] hover:border-[#3F3F46] transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-medium text-foreground">
                                            {member.name}
                                        </h3>
                                        <span className={`px-2 py-0.5 text-xs rounded font-medium ${getRoleBadgeColor(member.role)}`}>
                                            {member.role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/60">
                                        {member.email}
                                    </p>
                                    <p className="text-xs text-foreground/40 mt-1">
                                        Joined: {formatDate(member.created_at)}
                                        {member.approved_at && ` • Approved: ${formatDate(member.approved_at)}`}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRoleChange(member.id, member.role)}
                                        disabled={processingUserId === member.id}
                                        className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                                    >
                                        {processingUserId === member.id ? 'Processing...' :
                                            member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(member.id, member.name)}
                                        disabled={processingUserId === member.id}
                                        className="px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {members.length > 0 && (
                <div className="pt-2 text-sm text-foreground/50 text-center">
                    {members.length} member{members.length !== 1 ? 's' : ''} total
                </div>
            )}
        </div>
    );
}
