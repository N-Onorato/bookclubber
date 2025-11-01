import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/services/authService';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get('session_id')?.value;

        // Delete session from database if it exists
        if (sessionId) {
            await AuthService.deleteSession(sessionId);
        }

        // Delete session cookie
        cookieStore.delete('session_id');

        return NextResponse.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}