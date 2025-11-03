import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/connection';
import { requireAuth } from '@/lib/auth';
import type { UpdateReadingSectionRequest } from '@/lib/types';

// PATCH /api/cycles/[id]/sections/[sectionId] - Update a section (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string; sectionId: string } }
) {
    try {
        const user = await requireAuth();

        // Only admins can update sections
        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only admins can update sections' },
                { status: 403 }
            );
        }

        const { sectionId } = params;
        const body = await request.json() as UpdateReadingSectionRequest;

        const db = getDatabase();

        // Verify section exists
        const section = db.prepare('SELECT id FROM reading_sections WHERE id = ?').get(sectionId);
        if (!section) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];

        if (body.title !== undefined) {
            updates.push('title = ?');
            values.push(body.title);
        }
        if (body.description !== undefined) {
            updates.push('description = ?');
            values.push(body.description);
        }
        if (body.display_order !== undefined) {
            updates.push('display_order = ?');
            values.push(body.display_order);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        values.push(sectionId);

        // Update the section
        db.prepare(`
            UPDATE reading_sections
            SET ${updates.join(', ')}
            WHERE id = ?
        `).run(...values);

        // Fetch the updated section
        const updatedSection = db.prepare(
            'SELECT * FROM reading_sections WHERE id = ?'
        ).get(sectionId);

        return NextResponse.json(updatedSection);
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        console.error('Error updating section:', error);
        return NextResponse.json(
            { error: 'Failed to update section' },
            { status: 500 }
        );
    }
}

// DELETE /api/cycles/[id]/sections/[sectionId] - Delete a section (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; sectionId: string } }
) {
    try {
        const user = await requireAuth();

        // Only admins can delete sections
        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only admins can delete sections' },
                { status: 403 }
            );
        }

        const { sectionId } = params;
        const db = getDatabase();

        // Verify section exists
        const section = db.prepare('SELECT id FROM reading_sections WHERE id = ?').get(sectionId);
        if (!section) {
            return NextResponse.json(
                { error: 'Section not found' },
                { status: 404 }
            );
        }

        // Delete the section (cascade will delete notes)
        db.prepare('DELETE FROM reading_sections WHERE id = ?').run(sectionId);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        console.error('Error deleting section:', error);
        return NextResponse.json(
            { error: 'Failed to delete section' },
            { status: 500 }
        );
    }
}