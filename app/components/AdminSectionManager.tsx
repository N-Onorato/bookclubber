'use client';

import { useState } from 'react';

interface AdminSectionManagerProps {
    cycleId: string;
    onSectionCreated?: () => void;
}

export default function AdminSectionManager({
    cycleId,
    onSectionCreated
}: AdminSectionManagerProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateSection = async () => {
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/cycles/${cycleId}/sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: description || undefined,
                }),
            });

            if (response.ok) {
                setTitle('');
                setDescription('');
                setIsCreating(false);
                onSectionCreated?.();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create section');
            }
        } catch (error) {
            console.error('Error creating section:', error);
            alert('Failed to create section');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mb-6">
            {!isCreating ? (
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 font-medium"
                >
                    + Add New Section
                </button>
            ) : (
                <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] space-y-4">
                    <h4 className="text-lg font-serif font-semibold text-foreground">
                        Create New Section
                    </h4>

                    <div>
                        <label className="block text-sm text-foreground/70 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Audiobook References"
                            className="w-full px-3 py-2 bg-[#18181B] border border-[#3F3F46] rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-foreground/70 mb-1">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Share timestamps and chapter markers for audiobook listeners"
                            className="w-full px-3 py-2 bg-[#18181B] border border-[#3F3F46] rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateSection}
                            disabled={!title.trim() || isSubmitting}
                            className="px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Section'}
                        </button>
                        <button
                            onClick={() => {
                                setIsCreating(false);
                                setTitle('');
                                setDescription('');
                            }}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#3F3F46] text-foreground rounded-lg hover:bg-[#52525B] disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}