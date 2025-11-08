'use client';

import { useState } from 'react';
import { Phase, SearchResult } from '@/lib/types';

interface BookSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    activePhase: Phase;
    currentUser: any;
    onSubmitSuccess: () => void;
}

interface ManualBookEntry {
    title: string;
    author: string;
    isbn?: string;
    description?: string;
    pageCount?: number;
    publishYear?: number;
    coverImagePath?: string;
    coverImagePreview?: string;
}

export default function BookSearchModal({
    isOpen,
    onClose,
    activePhase,
    currentUser,
    onSubmitSuccess
}: BookSearchModalProps) {
    const [mode, setMode] = useState<'search' | 'manual'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedBook, setSelectedBook] = useState<SearchResult | null>(null);
    const [suggestionReason, setSuggestionReason] = useState('');
    const [manualBook, setManualBook] = useState<ManualBookEntry>({
        title: '',
        author: '',
        isbn: '',
        description: '',
        pageCount: undefined,
        publishYear: undefined,
        coverImagePath: undefined,
        coverImagePreview: undefined
    });
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.books);
            }
        } catch (error) {
            console.error('Error searching books:', error);
        }
    };

    const handleSelectBook = (book: SearchResult) => {
        setSelectedBook(book);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleSubmitSuggestion = async () => {
        if (!selectedBook || !activePhase) return;

        try {
            // First, create the book in our database
            const bookResponse = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    openLibraryId: selectedBook.openLibraryId,
                    coverImageUrl: selectedBook.coverImageUrl
                })
            });

            if (!bookResponse.ok) {
                const data = await bookResponse.json();
                alert(`Error: ${data.error}`);
                return;
            }

            const bookData = await bookResponse.json();

            // Then create the suggestion
            const suggestionResponse = await fetch('/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phaseId: activePhase.id,
                    bookId: bookData.book.id,
                    reason: suggestionReason
                })
            });

            if (suggestionResponse.ok) {
                handleClose();
                onSubmitSuccess();
            } else {
                const data = await suggestionResponse.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error submitting suggestion:', error);
            alert('Failed to submit suggestion');
        }
    };

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        setUploadingImage(true);
        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setManualBook({
                    ...manualBook,
                    coverImagePreview: e.target?.result as string
                });
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
                setManualBook({
                    ...manualBook,
                    coverImagePath: data.imagePath,
                    coverImagePreview: data.imageUrl
                });
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
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

    const handleSubmitManualBook = async () => {
        if (!manualBook.title || !manualBook.author || !activePhase) {
            alert('Title and author are required');
            return;
        }

        try {
            // Create the book manually
            const bookResponse = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: manualBook.title,
                    author: manualBook.author,
                    isbn: manualBook.isbn,
                    description: manualBook.description,
                    pageCount: manualBook.pageCount,
                    publishYear: manualBook.publishYear,
                    coverImagePath: manualBook.coverImagePath
                })
            });

            if (!bookResponse.ok) {
                const data = await bookResponse.json();
                alert(`Error: ${data.error}`);
                return;
            }

            const bookData = await bookResponse.json();

            // Create the suggestion
            const suggestionResponse = await fetch('/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phaseId: activePhase.id,
                    bookId: bookData.book.id,
                    reason: suggestionReason
                })
            });

            if (suggestionResponse.ok) {
                handleClose();
                onSubmitSuccess();
            } else {
                const data = await suggestionResponse.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error submitting manual book:', error);
            alert('Failed to submit manual book');
        }
    };

    const handleClose = () => {
        setSelectedBook(null);
        setSearchResults([]);
        setSearchQuery('');
        setSuggestionReason('');
        onClose();
    };

    const getUserSuggestionCount = () => {
        // This would need to be passed in as a prop if we want to show the warning
        // For now, we'll skip this in the modal
        return 0;
    };

    const hasExceededLimit = () => {
        if (!activePhase || !currentUser) return false;
        return getUserSuggestionCount() > activePhase.max_suggestions_per_user;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full bg-[#18181B] rounded-m border border-[#27272A] p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-serif font-semibold text-foreground">
                        {selectedBook ? 'Confirm Suggestion' : mode === 'search' ? 'Search for a Book' : 'Add Book Manually'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-foreground/60 hover:text-foreground"
                    >
                        ✕
                    </button>
                </div>

                {!selectedBook ? (
                    <>
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setMode('search')}
                                className={`flex-1 px-4 py-2 rounded-full transition-colors ${
                                    mode === 'search'
                                        ? 'bg-accent/20 border border-accent text-foreground'
                                        : 'bg-[#18181B]/40 border border-[#27272A] text-foreground/60 hover:text-foreground'
                                }`}
                            >
                                Search Open Library
                            </button>
                            <button
                                onClick={() => setMode('manual')}
                                className={`flex-1 px-4 py-2 rounded-full transition-colors ${
                                    mode === 'manual'
                                        ? 'bg-accent/20 border border-accent text-foreground'
                                        : 'bg-[#18181B]/40 border border-[#27272A] text-foreground/60 hover:text-foreground'
                                }`}
                            >
                                Add Manually
                            </button>
                        </div>

                        {mode === 'search' ? (
                            <>
                                <form onSubmit={handleSearch} className="mb-4">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by title, author, or ISBN..."
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full mt-2 px-6 py-2 bg-accent/20 border border-accent rounded-full text-foreground hover:bg-accent/30 transition-colors"
                                    >
                                        Search
                                    </button>
                                </form>

                                <div className="space-y-3">
                                    {searchResults.map((book, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleSelectBook(book)}
                                            className="flex gap-4 p-3 bg-[#18181B]/40 border border-[#27272A] rounded-lg hover:border-accent cursor-pointer transition-all"
                                        >
                                            {book.coverImageUrl && (
                                                <img
                                                    src={book.coverImageUrl}
                                                    alt={book.title}
                                                    className="w-16 h-24 object-cover"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-foreground font-medium">{book.title}</h3>
                                                <p className="text-foreground/60 text-sm">{book.author}</p>
                                                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                                    {book.publishYear && (
                                                        <span className="text-foreground/40">{book.publishYear}</span>
                                                    )}
                                                    {book.pageCount && (
                                                        <span className="text-foreground/40">• {book.pageCount} pages</span>
                                                    )}
                                                    {book.publisher && (
                                                        <span className="text-foreground/40">• {book.publisher}</span>
                                                    )}
                                                </div>
                                                {book.categories && book.categories.length > 0 && (
                                                    <div className="flex gap-1 mt-2 flex-wrap">
                                                        {book.categories.slice(0, 3).map((category: string, i: number) => (
                                                            <span key={i} className="text-xs px-2 py-0.5 bg-accent/10 text-accent/80 rounded-full">
                                                                {category}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4" onPaste={handleImagePaste}>
                                {/* Cover Image Upload */}
                                <div>
                                    <label className="block text-foreground/70 text-sm mb-2">
                                        Cover Image (optional)
                                    </label>
                                    <div className="flex gap-4 items-start">
                                        {manualBook.coverImagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={manualBook.coverImagePreview}
                                                    alt="Cover preview"
                                                    className="w-24 h-36 object-cover border border-[#27272A]"
                                                />
                                                <button
                                                    onClick={() => setManualBook({
                                                        ...manualBook,
                                                        coverImagePath: undefined,
                                                        coverImagePreview: undefined
                                                    })}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-24 h-36 bg-[#27272A] rounded-lg flex items-center justify-center text-foreground/40 text-xs">
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
                                                id="cover-upload"
                                            />
                                            <label
                                                htmlFor="cover-upload"
                                                className="block w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground/70 text-sm cursor-pointer hover:border-accent transition-colors text-center"
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
                                    <label className="block text-foreground/70 text-sm mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={manualBook.title}
                                        onChange={(e) => setManualBook({ ...manualBook, title: e.target.value })}
                                        placeholder="Enter book title"
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-foreground/70 text-sm mb-2">Author *</label>
                                    <input
                                        type="text"
                                        value={manualBook.author}
                                        onChange={(e) => setManualBook({ ...manualBook, author: e.target.value })}
                                        placeholder="Enter author name"
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-foreground/70 text-sm mb-2">ISBN (optional)</label>
                                    <input
                                        type="text"
                                        value={manualBook.isbn}
                                        onChange={(e) => setManualBook({ ...manualBook, isbn: e.target.value })}
                                        placeholder="Enter ISBN"
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-foreground/70 text-sm mb-2">Page Count (optional)</label>
                                        <input
                                            type="number"
                                            value={manualBook.pageCount || ''}
                                            onChange={(e) => setManualBook({ ...manualBook, pageCount: e.target.value ? parseInt(e.target.value) : undefined })}
                                            placeholder="Pages"
                                            className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-foreground/70 text-sm mb-2">Publish Year (optional)</label>
                                        <input
                                            type="number"
                                            value={manualBook.publishYear || ''}
                                            onChange={(e) => setManualBook({ ...manualBook, publishYear: e.target.value ? parseInt(e.target.value) : undefined })}
                                            placeholder="Year"
                                            className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-foreground/70 text-sm mb-2">Description (optional)</label>
                                    <textarea
                                        value={manualBook.description}
                                        onChange={(e) => setManualBook({ ...manualBook, description: e.target.value })}
                                        placeholder="Book description or summary"
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-foreground/70 text-sm mb-2">Why do you recommend this book? (optional)</label>
                                    <textarea
                                        value={suggestionReason}
                                        onChange={(e) => setSuggestionReason(e.target.value)}
                                        placeholder="Share why you think the club should read this..."
                                        className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent min-h-[80px]"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmitManualBook}
                                    disabled={!manualBook.title || !manualBook.author}
                                    className="w-full px-6 py-2 bg-accent/20 border border-accent rounded-full text-foreground hover:bg-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Suggestion
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <div className="flex gap-4 mb-4">
                            {selectedBook.coverImageUrl && (
                                <img
                                    src={selectedBook.coverImageUrl}
                                    alt={selectedBook.title}
                                    className="w-32 h-48 object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="text-xl font-serif font-semibold text-foreground mb-1">
                                    {selectedBook.title}
                                </h3>
                                <p className="text-foreground/70 mb-2">by {selectedBook.author}</p>

                                <div className="space-y-1 text-sm text-foreground/60">
                                    {selectedBook.publishYear && (
                                        <p>Published: {selectedBook.publishYear}</p>
                                    )}
                                    {selectedBook.pageCount && (
                                        <p>Pages: {selectedBook.pageCount}</p>
                                    )}
                                    {selectedBook.publisher && (
                                        <p>Publisher: {selectedBook.publisher}</p>
                                    )}
                                </div>

                                {selectedBook.categories && selectedBook.categories.length > 0 && (
                                    <div className="flex gap-1 mt-3 flex-wrap">
                                        {selectedBook.categories.slice(0, 4).map((category: string, i: number) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-accent/10 text-accent/80 rounded-full">
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {currentUser?.role === 'admin' && hasExceededLimit() && (
                            <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                                <p className="text-yellow-400 text-sm">
                                    ⚠️ You are about to exceed the suggestion limit of {activePhase?.max_suggestions_per_user}.
                                    As an admin, you can still add this suggestion.
                                </p>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-foreground/70 text-sm mb-2">
                                Why do you recommend this book? (optional)
                            </label>
                            <textarea
                                value={suggestionReason}
                                onChange={(e) => setSuggestionReason(e.target.value)}
                                placeholder="Share why you think the club should read this..."
                                className="w-full px-4 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-lg text-foreground focus:outline-none focus:border-accent min-h-[100px]"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedBook(null)}
                                className="flex-1 px-6 py-2 bg-[#18181B]/40 border border-[#27272A] rounded-full text-foreground hover:border-foreground/40 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmitSuggestion}
                                className="flex-1 px-6 py-2 bg-accent/20 border border-accent rounded-full text-foreground hover:bg-accent/30 transition-colors"
                            >
                                Submit Suggestion
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}