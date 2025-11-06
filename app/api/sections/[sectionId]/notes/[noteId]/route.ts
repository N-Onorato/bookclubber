import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/connection';
import { requireAuth } from '@/lib/auth';
import type { UpdateReadingSectionNoteRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

// PATCH /api/sections/[sectionId]/notes/[noteId] - Update a note (owner or admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { sectionId: string; noteId: string } }
) {
    try {
        const user = await requireAuth();
        const { noteId } = params;
        const body = await request.json() as UpdateReadingSectionNoteRequest;

        const db = getDatabase();

        // Fetch the note
        const note = db.prepare(
            'SELECT * FROM reading_section_notes WHERE id = ?'
        ).get(noteId) as any;

        if (!note) {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }

        // Only the note owner or admin can update
        if (note.user_id !== user.id && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'You can only edit your own notes' },
                { status: 403 }
            );
        }

        // Update the note
        db.prepare(`
            UPDATE reading_section_notes
            SET content = ?
            WHERE id = ?
        `).run(body.content, noteId);

        // Fetch the updated note
        const updatedNote = db.prepare(
            'SELECT * FROM reading_section_notes WHERE id = ?'
        ).get(noteId);

        return NextResponse.json(updatedNote);
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        console.error('Error updating note:', error);
        return NextResponse.json(
            { error: 'Failed to update note' },
            { status: 500 }
        );
    }
}

// DELETE /api/sections/[sectionId]/notes/[noteId] - Delete a note (owner or admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { sectionId: string; noteId: string } }
) {
    try {
        const user = await requireAuth();
        const { noteId } = params;

        const db = getDatabase();

        // Fetch the note
        const note = db.prepare(
            'SELECT * FROM reading_section_notes WHERE id = ?'
        ).get(noteId) as any;

        if (!note) {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }

        // Only the note owner or admin can delete
        if (note.user_id !== user.id && user.role !== 'admin') {
            return NextResponse.json(
                { error: 'You can only delete your own notes' },
                { status: 403 }
            );
        }

        // Delete the note
        db.prepare('DELETE FROM reading_section_notes WHERE id = ?').run(noteId);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        console.error('Error deleting note:', error);
        return NextResponse.json(
            { error: 'Failed to delete note' },
            { status: 500 }
        );
    }
}