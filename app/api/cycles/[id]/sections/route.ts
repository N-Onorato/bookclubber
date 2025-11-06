import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/connection';
import { requireAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import type { ReadingSection, ReadingSectionWithDetails, CreateReadingSectionRequest, User } from '@/lib/types';

export const dynamic = 'force-dynamic';

// GET /api/cycles/[id]/sections - Get all sections for a cycle
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const db = getDatabase();
        const cycleId = params.id;

        // Fetch all sections for the cycle with creator details
        const sections = db.prepare(`
            SELECT
                rs.*,
                u.id as creator_id,
                u.name as creator_name,
                u.email as creator_email
            FROM reading_sections rs
            LEFT JOIN users u ON rs.created_by_user_id = u.id
            WHERE rs.cycle_id = ?
            ORDER BY rs.display_order ASC, rs.created_at ASC
        `).all(cycleId) as any[];

        // Format the response with notes for each section
        const sectionsWithDetails: ReadingSectionWithDetails[] = sections.map(row => {
            const section: ReadingSectionWithDetails = {
                id: row.id,
                cycle_id: row.cycle_id,
                title: row.title,
                description: row.description,
                display_order: row.display_order,
                created_by_user_id: row.created_by_user_id,
                created_at: row.created_at,
                updated_at: row.updated_at,
                created_by: row.creator_id ? {
                    id: row.creator_id,
                    name: row.creator_name,
                    email: row.creator_email,
                } as User : undefined,
                notes: []
            };

            // Fetch notes for this section
            const notes = db.prepare(`
                SELECT
                    rsn.*,
                    u.id as user_id,
                    u.name as user_name,
                    u.email as user_email
                FROM reading_section_notes rsn
                LEFT JOIN users u ON rsn.user_id = u.id
                WHERE rsn.section_id = ?
                ORDER BY rsn.created_at ASC
            `).all(row.id) as any[];

            section.notes = notes.map(noteRow => ({
                id: noteRow.id,
                section_id: noteRow.section_id,
                user_id: noteRow.user_id,
                content: noteRow.content,
                created_at: noteRow.created_at,
                updated_at: noteRow.updated_at,
                user: noteRow.user_id ? {
                    id: noteRow.user_id,
                    name: noteRow.user_name,
                    email: noteRow.user_email,
                } as User : undefined
            }));

            return section;
        });

        return NextResponse.json(sectionsWithDetails);
    } catch (error) {
        console.error('Error fetching sections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sections' },
            { status: 500 }
        );
    }
}

// POST /api/cycles/[id]/sections - Create a new section (admin only)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireAuth();

        // Only admins can create sections
        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Only admins can create sections' },
                { status: 403 }
            );
        }

        const cycleId = params.id;
        const body = await request.json() as Omit<CreateReadingSectionRequest, 'cycle_id'>;

        const db = getDatabase();

        // Verify cycle exists
        const cycle = db.prepare('SELECT id FROM cycles WHERE id = ?').get(cycleId);
        if (!cycle) {
            return NextResponse.json(
                { error: 'Cycle not found' },
                { status: 404 }
            );
        }

        // Get the next display order if not provided
        let displayOrder = body.display_order ?? 0;
        if (body.display_order === undefined) {
            const maxOrder = db.prepare(
                'SELECT MAX(display_order) as max_order FROM reading_sections WHERE cycle_id = ?'
            ).get(cycleId) as { max_order: number | null };
            displayOrder = (maxOrder.max_order ?? -1) + 1;
        }

        // Create the section
        const sectionId = uuidv4();
        db.prepare(`
            INSERT INTO reading_sections (
                id, cycle_id, title, description, display_order, created_by_user_id
            ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            sectionId,
            cycleId,
            body.title,
            body.description || null,
            displayOrder,
            user.id
        );

        // Fetch the created section
        const section = db.prepare(`
            SELECT * FROM reading_sections WHERE id = ?
        `).get(sectionId) as ReadingSection;

        return NextResponse.json(section, { status: 201 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        console.error('Error creating section:', error);
        return NextResponse.json(
            { error: 'Failed to create section' },
            { status: 500 }
        );
    }
}