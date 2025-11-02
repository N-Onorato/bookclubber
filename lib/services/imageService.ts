import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

/**
 * Service for managing book cover images
 * Handles downloading from external sources and storing locally
 */
export class ImageService {
    private static readonly DATA_DIR = process.env.DATA_DIR || './data';
    private static readonly COVERS_DIR = join(ImageService.DATA_DIR, 'covers');

    /**
     * Ensure the covers directory exists
     */
    private static ensureCoversDirectory(): void {
        if (!existsSync(ImageService.COVERS_DIR)) {
            mkdirSync(ImageService.COVERS_DIR, { recursive: true });
        }
    }

    /**
     * Download an image from a URL and save it locally
     * @param url - External image URL
     * @param bookId - Book ID for naming the file
     * @returns Relative path to the saved image (e.g., "covers/abc123.jpg")
     */
    static async downloadAndSaveImage(url: string, bookId: string): Promise<string | null> {
        try {
            this.ensureCoversDirectory();

            // Fetch the image
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'dataDumperBookClub/1.0 (n_onorato@outlook.com)'
                }
            });

            if (!response.ok) {
                console.error(`Failed to download image: ${response.status} ${response.statusText}`);
                return null;
            }

            // Get the image buffer
            const buffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);

            // Determine file extension from content-type or URL
            const contentType = response.headers.get('content-type');
            let extension = 'jpg';
            if (contentType) {
                if (contentType.includes('png')) extension = 'png';
                else if (contentType.includes('webp')) extension = 'webp';
                else if (contentType.includes('gif')) extension = 'gif';
            } else if (url.includes('.png')) {
                extension = 'png';
            }

            // Generate filename: bookId-timestamp.ext
            const timestamp = Date.now();
            const filename = `${bookId}-${timestamp}.${extension}`;
            const filepath = join(ImageService.COVERS_DIR, filename);

            // Save the file
            writeFileSync(filepath, uint8Array);

            // Return relative path for database storage
            return `covers/${filename}`;
        } catch (error) {
            console.error('Error downloading and saving image:', error);
            return null;
        }
    }

    /**
     * Get the full filesystem path for a local cover image
     * @param relativePath - Relative path from database (e.g., "covers/abc123.jpg")
     * @returns Full filesystem path
     */
    static getFullPath(relativePath: string): string {
        return join(ImageService.DATA_DIR, relativePath);
    }

    /**
     * Check if a local image file exists
     * @param relativePath - Relative path from database
     * @returns True if file exists
     */
    static imageExists(relativePath: string): boolean {
        if (!relativePath) return false;
        const fullPath = this.getFullPath(relativePath);
        return existsSync(fullPath);
    }

    /**
     * Delete a local image file
     * @param relativePath - Relative path from database
     * @returns True if successfully deleted
     */
    static deleteImage(relativePath: string): boolean {
        try {
            if (!relativePath) return false;
            const fullPath = this.getFullPath(relativePath);

            if (existsSync(fullPath)) {
                unlinkSync(fullPath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }

    /**
     * Get the URL path for serving an image
     * @param relativePath - Relative path from database (e.g., "covers/abc123.jpg")
     * @returns URL path (e.g., "/api/covers/abc123.jpg")
     */
    static getImageUrl(relativePath: string): string | null {
        if (!relativePath) return null;
        const filename = relativePath.replace('covers/', '');
        return `/api/covers/${filename}`;
    }
}
