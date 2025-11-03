import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ImageService } from '@/lib/services/imageService';
import { randomUUID } from 'crypto';

/**
 * POST /api/upload/cover - Upload a book cover image
 *
 * Accepts multipart/form-data with an 'image' file
 * Returns the saved image path
 */
export async function POST(request: NextRequest) {
    try {
        await requireAuth();

        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate temporary book ID for the image
        const tempBookId = randomUUID();

        // Save image using ImageService
        const imagePath = await ImageService.saveImageFromBuffer(buffer, tempBookId, file.name);

        if (!imagePath) {
            return NextResponse.json(
                { error: 'Failed to save image' },
                { status: 500 }
            );
        }

        // Return the image path
        return NextResponse.json({
            success: true,
            imagePath,
            imageUrl: `/api/covers/${imagePath.split('/').pop()}`
        });
    } catch (error: any) {
        if (error.message === 'Authentication required') {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Error uploading cover image:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
