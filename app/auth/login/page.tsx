'use client';

import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                // Check if it's a pending approval error
                if (data.error === 'pending_approval') {
                    window.location.href = '/auth/pending-approval';
                } else {
                    setError(data.message || data.error || 'Login failed');
                }
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Decorative book icon */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-20">
                <svg className="w-16 h-16 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <h2 className="text-center text-4xl font-bold text-[#E4E4E7] mb-3 tracking-wide">
                    Be in the Club
                </h2>
                <p className="text-center text-sm text-[#A1A1AA] font-light italic">
                    Welcome back, reader.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div
                    className="bg-[#18181B]/60 backdrop-blur-lg py-10 px-6 shadow-2xl rounded-3xl border border-[#3F3F46]"
                    style={{
                        boxShadow: '0 0 40px rgba(212, 175, 55, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#E4E4E7] mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="your@email.com"
                                className="appearance-none block w-full px-4 py-3 bg-[#27272A] border border-[#3F3F46] rounded-xl text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent transition-all duration-200 shadow-inner"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#E4E4E7] mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="••••••••"
                                className="appearance-none block w-full px-4 py-3 bg-[#27272A] border border-[#3F3F46] rounded-xl text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent transition-all duration-200 shadow-inner"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-6 border border-transparent rounded-full shadow-lg text-base font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A78BFA] focus:ring-offset-[#0F0F10] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                                style={{
                                    boxShadow: loading ? 'none' : '0 0 20px rgba(79, 70, 229, 0.3)'
                                }}
                            >
                                {loading ? 'Opening the door...' : 'Enter'}
                            </button>
                        </div>

                        <div className="text-center pt-4 border-t border-[#3F3F46]/50">
                            <p className="text-sm text-[#A1A1AA]">
                                New to our circle?{' '}
                                <a
                                    href="/auth/register"
                                    className="text-[#A78BFA] hover:text-[#C4B5FD] font-medium transition-colors duration-200"
                                >
                                    Join the club
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Decorative quote */}
            <div className="mt-12 text-center relative z-10">
                <p className="text-xs text-[#71717A] italic font-serif max-w-md mx-auto">
                    "A reader lives a thousand lives before he dies... The man who never reads lives only one."
                </p>
            </div>
        </div>
    );
}