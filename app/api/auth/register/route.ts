import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/authService';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Create user
        const user = await AuthService.createUser(email, password, name);

        if (!user) {
            return NextResponse.json(
                { error: 'User already exists with this email' },
                { status: 409 }
            );
        }

        // Return success (no password hash in response)
        return NextResponse.json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}