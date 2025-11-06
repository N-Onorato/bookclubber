import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/connection';
import { requireAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import type { ReadingSectionNote, CreateReadingSectionNoteRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

// POST /api/sections/[sectionId]/notes - Create a new note (any authenticated user)
export async function POST(
    request: NextRequest,
    { params }: { params: { sectionId: string } }
) {
    try {
        const user = await requireAuth();
        const { sectionId } = params;
        const body = await request.json() as Omit<CreateReadingSectionNoteRequest, 'section_id'>;

        const db = getDatabase();

        // Verify section exists
        const section = db.prepare('SELECT id FROM reading_sections WHERE id = ?').get(sectionId);
        if (!section) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        // Create the note
        const noteId = uuidv4();
        db.prepare(`
            INSERT INTO reading_section_notes (
                id, section_id, user_id, content
            ) VALUES (?, ?, ?, ?)
        `).run(
            noteId,
            sectionId,
            user.id,
            body.content
        );

        // Fetch the created note with user details
        const note = db.prepare(`
            SELECT
                rsn.*,
                u.id as user_id,
                u.name as user_name,
                u.email as user_email
            FROM reading_section_notes rsn
            LEFT JOIN users u ON rsn.user_id = u.id
            WHERE rsn.id = ?
        `).get(noteId) as any;

        const noteWithUser = {
            id: note.id,
            section_id: note.section_id,
            user_id: note.user_id,
            content: note.content,
            created_at: note.created_at,
            updated_at: note.updated_at,
            user: {
                id: note.user_id,
                name: note.user_name,
                email: note.user_email,
            }
        };

        return NextResponse.json(noteWithUser, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        console.error('Error creating note:', error);
        return NextResponse.json(
            { error: 'Failed to create note' },
            { status: 500 }
        );
    }
}