'use client';

import { useState } from 'react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to pending approval page
                window.location.href = '/auth/pending-approval';
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Decorative quill icon */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-20">
                <svg className="w-16 h-16 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <h2 className="text-center text-4xl font-bold text-[#E4E4E7] mb-3 tracking-wide">
                    Join the Circle
                </h2>
                <p className="text-center text-sm text-[#A1A1AA] font-light italic">
                    Begin your literary adventure with us.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div
                    className="bg-[#18181B]/60 backdrop-blur-lg py-10 px-6 shadow-2xl rounded-3xl border border-[#3F3F46]"
                    style={{
                        boxShadow: '0 0 40px rgba(212, 175, 55, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-[#E4E4E7] mb-2">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                placeholder="Your name"
                                className="appearance-none block w-full px-4 py-3 bg-[#27272A] border border-[#3F3F46] rounded-xl text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent transition-all duration-200 shadow-inner"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

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
                                autoComplete="new-password"
                                required
                                placeholder="••••••••"
                                className="appearance-none block w-full px-4 py-3 bg-[#27272A] border border-[#3F3F46] rounded-xl text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent transition-all duration-200 shadow-inner"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#E4E4E7] mb-2">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="••••••••"
                                className="appearance-none block w-full px-4 py-3 bg-[#27272A] border border-[#3F3F46] rounded-xl text-[#E4E4E7] placeholder-[#71717A] focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:border-transparent transition-all duration-200 shadow-inner"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                {loading ? 'Opening your chapter...' : 'Begin Reading'}
                            </button>
                        </div>

                        <div className="text-center pt-4 border-t border-[#3F3F46]/50">
                            <p className="text-sm text-[#A1A1AA]">
                                Already part of our circle?{' '}
                                <a
                                    href="/auth/login"
                                    className="text-[#A78BFA] hover:text-[#C4B5FD] font-medium transition-colors duration-200"
                                >
                                    Enter the library
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Decorative quote */}
            <div className="mt-12 text-center relative z-10">
                <p className="text-xs text-[#71717A] italic font-serif max-w-md mx-auto">
                    "There is no friend as loyal as a book."
                </p>
            </div>
        </div>
    );
}
