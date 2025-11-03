'use client';

import { useState, useEffect } from 'react';

interface EditBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookId: string;
    initialData: {
        title: string;
        author: string;
        description?: string;
        pageCount?: number;
    };
    onSaveSuccess: () => void;
}

export default function EditBookModal({
    isOpen,
    onClose,
    bookId,
    initialData,
    onSaveSuccess
}: EditBookModalProps) {
    const [title, setTitle] = useState(initialData.title);
    const [author, setAuthor] = useState(initialData.author);
    const [description, setDescription] = useState(initialData.description || '');
    const [pageCount, setPageCount] = useState(initialData.pageCount?.toString() || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal opens with new data
    useEffect(() => {
        if (isOpen) {
            setTitle(initialData.title);
            setAuthor(initialData.author);
            setDescription(initialData.description || '');
            setPageCount(initialData.pageCount?.toString() || '');
            setError(null);
        }
    }, [isOpen, initialData]);

    const handleSave = async () => {
        if (!title.trim() || !author.trim()) {
            setError('Title and author are required');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title.trim(),
                    author: author.trim(),
                    description: description.trim() || undefined,
                    pageCount: pageCount ? parseInt(pageCount, 10) : undefined
                })
            });

            if (response.ok) {
                onSaveSuccess();
                onClose();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update book');
            }
        } catch (err) {
            console.error('Error updating book:', err);
            setError('Failed to update book');
        } finally {
            setSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#18181B] border border-[#27272A] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <div className="sticky top-0 bg-[#18181B] border-b border-[#27272A] p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-serif font-bold text-foreground">
                        Edit Book Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-foreground/60 hover:text-foreground text-2xl w-8 h-8 flex items-center justify-center"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-[#09090B] border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                            placeholder="Enter book title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Author <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full px-4 py-2 bg-[#09090B] border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                            placeholder="Enter author name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-[#09090B] border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent resize-none"
                            placeholder="Enter book description"
                            rows={5}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Page Count
                        </label>
                        <input
                            type="number"
                            value={pageCount}
                            onChange={(e) => setPageCount(e.target.value)}
                            className="w-full px-4 py-2 bg-[#09090B] border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                            placeholder="Enter page count"
                            min="1"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-[#18181B] border-t border-[#27272A] p-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-6 py-2 border border-[#27272A] rounded-full text-foreground hover:bg-[#27272A] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-accent/20 border border-accent rounded-full text-foreground hover:bg-accent/30 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
