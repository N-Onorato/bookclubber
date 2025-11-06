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
        coverImageUrl?: string;
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
    const [coverImagePath, setCoverImagePath] = useState<string | undefined>(undefined);
    const [coverImagePreview, setCoverImagePreview] = useState<string | undefined>(initialData.coverImageUrl);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal opens with new data
    useEffect(() => {
        if (isOpen) {
            setTitle(initialData.title);
            setAuthor(initialData.author);
            setDescription(initialData.description || '');
            setPageCount(initialData.pageCount?.toString() || '');
            setCoverImagePath(undefined);
            setCoverImagePreview(initialData.coverImageUrl);
            setError(null);
        }
    }, [isOpen, initialData]);

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        setUploadingImage(true);
        setError(null);
        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setCoverImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload image
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload/cover', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setCoverImagePath(data.imagePath);
                setCoverImagePreview(data.imageUrl);
            } else {
                setError('Failed to upload image');
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleImagePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) {
                    await handleImageUpload(file);
                }
                break;
            }
        }
    };

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
                    pageCount: pageCount ? parseInt(pageCount, 10) : undefined,
                    coverImagePath: coverImagePath || undefined
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
                <div className="p-6 space-y-4" onPaste={handleImagePaste}>
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Cover Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-foreground/80 mb-2">
                            Cover Image
                        </label>
                        <div className="flex gap-4 items-start">
                            {coverImagePreview ? (
                                <div className="relative">
                                    <img
                                        src={coverImagePreview}
                                        alt="Cover preview"
                                        className="w-24 h-36 object-cover border border-[#27272A] rounded"
                                    />
                                    <button
                                        onClick={() => {
                                            setCoverImagePath(undefined);
                                            setCoverImagePreview(undefined);
                                        }}
                                        type="button"
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-36 bg-[#27272A] rounded flex items-center justify-center text-foreground/40 text-xs">
                                    No Cover
                                </div>
                            )}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(file);
                                    }}
                                    className="hidden"
                                    id="cover-upload-edit"
                                    disabled={uploadingImage || saving}
                                />
                                <label
                                    htmlFor="cover-upload-edit"
                                    className={`block w-full px-4 py-2 bg-[#09090B] border border-[#27272A] rounded-lg text-foreground/70 text-sm cursor-pointer hover:border-accent transition-colors text-center ${
                                        uploadingImage || saving ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {uploadingImage ? 'Uploading...' : 'Click to upload or paste (Ctrl+V)'}
                                </label>
                                <p className="text-foreground/40 text-xs mt-2">
                                    Supports JPG, PNG, WebP, GIF
                                </p>
                            </div>
                        </div>
                    </div>

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
