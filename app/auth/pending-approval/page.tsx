export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            {/* Decorative hourglass icon */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 opacity-20">
                <svg className="w-16 h-16 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <h2 className="text-center text-4xl font-bold text-[#E4E4E7] mb-3 tracking-wide">
                    Awaiting Approval
                </h2>
                <p className="text-center text-sm text-[#A1A1AA] font-light italic">
                    Your journey begins soon...
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div
                    className="bg-[#18181B]/60 backdrop-blur-lg py-10 px-6 shadow-2xl rounded-3xl border border-[#3F3F46]"
                    style={{
                        boxShadow: '0 0 40px rgba(212, 175, 55, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div className="text-center space-y-6">
                        {/* Success icon */}
                        <div className="flex justify-center">
                            <div className="rounded-full bg-[#A78BFA]/10 p-4">
                                <svg className="w-12 h-12 text-[#A78BFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-[#E4E4E7] mb-2">
                                Registration Successful!
                            </h3>
                            <p className="text-[#A1A1AA] text-sm leading-relaxed">
                                Your account has been created and is pending approval from a club administrator.
                            </p>
                        </div>

                        <div className="bg-[#4F46E5]/10 border border-[#4F46E5]/30 rounded-lg p-4">
                            <p className="text-[#C4B5FD] text-sm">
                                You'll receive access to the book club once an admin reviews and approves your account.
                                This typically happens within 24 hours.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-[#3F3F46]/50">
                            <p className="text-sm text-[#A1A1AA]">
                                Questions?{' '}
                                <span className="text-[#A78BFA]">
                                    Contact your club administrator
                                </span>
                            </p>
                        </div>

                        <div>
                            <a
                                href="/auth/login"
                                className="inline-flex items-center text-sm text-[#A78BFA] hover:text-[#C4B5FD] transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Login
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative quote */}
            <div className="mt-12 text-center relative z-10">
                <p className="text-xs text-[#71717A] italic font-serif max-w-md mx-auto">
                    "Patience is not simply the ability to wait - it's how we behave while we're waiting."
                </p>
            </div>
        </div>
    );
}