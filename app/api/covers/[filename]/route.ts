import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = process.env.DATA_DIR || './data';
const COVERS_DIR = join(DATA_DIR, 'covers');

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
};

/**
 * GET /api/covers/[filename] - Serve book cover images
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { filename: string } }
) {
    try {
        const filename = params.filename;

        // Security: Prevent directory traversal attacks
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return NextResponse.json(
                { error: 'Invalid filename' },
                { status: 400 }
            );
        }

        // Construct file path
        const filepath = join(COVERS_DIR, filename);

        // Check if file exists
        if (!existsSync(filepath)) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = readFileSync(filepath);

        // Determine MIME type from file extension
        const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

        // Return image with proper headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
                'Content-Disposition': `inline; filename="${filename}"`
            }
        });
    } catch (error) {
        console.error('Error serving cover image:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
