'use client';

import { useState } from 'react';
import type { ReadingSectionWithDetails, User } from '@/lib/types';

interface ReadingSectionProps {
    section: ReadingSectionWithDetails;
    currentUser: User | null;
    isAdmin: boolean;
    onDeleteSection?: (sectionId: string) => void;
    onRefresh?: () => void;
}

export default function ReadingSection({
    section,
    currentUser,
    isAdmin,
    onDeleteSection,
    onRefresh
}: ReadingSectionProps) {
    const [expanded, setExpanded] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editNoteContent, setEditNoteContent] = useState('');

    const handleAddNote = async () => {
        if (!newNote.trim() || !currentUser) return;

        setIsAddingNote(true);
        try {
            const response = await fetch(`/api/sections/${section.id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newNote }),
            });

            if (response.ok) {
                setNewNote('');
                setShowAddNote(false);
                onRefresh?.();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add note');
            }
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Failed to add note');
        } finally {
            setIsAddingNote(false);
        }
    };

    const handleUpdateNote = async (noteId: string) => {
        if (!editNoteContent.trim()) return;

        try {
            const response = await fetch(`/api/sections/${section.id}/notes/${noteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editNoteContent }),
            });

            if (response.ok) {
                setEditingNoteId(null);
                setEditNoteContent('');
                onRefresh?.();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update note');
            }
        } catch (error) {
            console.error('Error updating note:', error);
            alert('Failed to update note');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            const response = await fetch(`/api/sections/${section.id}/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onRefresh?.();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete note');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note');
        }
    };

    const startEditing = (noteId: string, content: string) => {
        setEditingNoteId(noteId);
        setEditNoteContent(content);
    };

    const cancelEditing = () => {
        setEditingNoteId(null);
        setEditNoteContent('');
    };

    const noteCount = section.notes?.length || 0;
    const [showAddNote, setShowAddNote] = useState(false);

    return (
        <div className="border-b border-[#27272A] last:border-b-0">
            {/* Compact Section Row */}
            <div className="flex items-center justify-between py-3 px-4 hover:bg-[#18181B]/30 transition-colors">
                <div
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => setExpanded(!expanded)}
                >
                    <span className="text-foreground font-medium">{section.title}</span>
                    {section.description && (
                        <span className="text-foreground/50 text-sm">— {section.description}</span>
                    )}
                    <span className="text-foreground/40 text-xs">
                        {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {currentUser && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowAddNote(!showAddNote);
                                setExpanded(true);
                            }}
                            className="text-accent hover:text-accent/80 text-sm"
                            title="Add note"
                        >
                            ✚
                        </button>
                    )}
                    {isAdmin && onDeleteSection && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSection(section.id);
                            }}
                            className="text-red-500 hover:text-red-400 text-sm"
                            title="Delete section"
                        >
                            🗑
                        </button>
                    )}
                    <span
                        className="text-foreground/40 text-xs cursor-pointer"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? '▼' : '▶'}
                    </span>
                </div>
            </div>

            {/* Expanded Notes Section */}
            {expanded && (
                <div className="px-4 pb-4 space-y-2">
                    {/* Notes List */}
                    {section.notes && section.notes.length > 0 ? (
                        <div className="space-y-1">
                            {section.notes.map((note) => (
                                <div key={note.id}>
                                    {editingNoteId === note.id ? (
                                        <div className="space-y-2 py-1">
                                            <textarea
                                                value={editNoteContent}
                                                onChange={(e) => setEditNoteContent(e.target.value)}
                                                className="w-full px-3 py-2 bg-[#18181B] border border-[#3F3F46] rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                                                rows={2}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateNote(note.id)}
                                                    className="px-3 py-1 bg-accent text-background rounded-lg text-xs hover:bg-accent/90"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="px-3 py-1 bg-[#3F3F46] text-foreground rounded-lg text-xs hover:bg-[#52525B]"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between group py-1">
                                            <p className="text-foreground/80 text-sm flex-1">
                                                {note.content}{' '}
                                                <span className="text-foreground/40 text-xs">
                                                    - {note.user?.name || 'Unknown'}
                                                </span>
                                            </p>
                                            {currentUser &&
                                                (note.user_id === currentUser.id || isAdmin) && (
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                                        {note.user_id === currentUser.id && (
                                                            <button
                                                                onClick={() =>
                                                                    startEditing(note.id, note.content)
                                                                }
                                                                className="text-accent hover:text-accent/80 text-xs"
                                                                title="Edit note"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            className="text-red-500 hover:text-red-400 text-xs"
                                                            title="Delete note"
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-foreground/40 text-sm italic py-1">No notes yet.</p>
                    )}

                    {/* Add Note Form */}
                    {currentUser && showAddNote && (
                        <div className="space-y-2 pt-2">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note (e.g., 'Page 132 is chapter 3 on Spotify')"
                                className="w-full px-3 py-2 bg-[#18181B] border border-[#3F3F46] rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                                rows={2}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim() || isAddingNote}
                                    className="px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {isAddingNote ? 'Adding...' : 'Add Note'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddNote(false);
                                        setNewNote('');
                                    }}
                                    className="px-4 py-2 bg-[#3F3F46] text-foreground rounded-lg hover:bg-[#52525B] text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}