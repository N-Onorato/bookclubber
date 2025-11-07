export default function LoadingSkeleton() {
    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header Skeleton */}
            <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
                <div className="h-4 bg-[#27272A] rounded w-32 mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                </div>
                <div className="h-10 bg-[#27272A] rounded w-64 mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                </div>
                <div className="h-5 bg-[#27272A] rounded w-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                </div>
            </div>

            {/* Winner Card Skeleton */}
            <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
                <div className="p-4 sm:p-6 lg:p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                    <div className="text-center mb-4 sm:mb-6">
                        <div className="h-8 bg-[#27272A] rounded w-32 mx-auto mb-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                        </div>
                        <div className="h-4 bg-[#27272A] rounded w-24 mx-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
                        {/* Image skeleton */}
                        <div className="w-48 sm:w-56 lg:w-64 h-64 sm:h-72 lg:h-80 bg-[#27272A] rounded relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                        </div>
                        {/* Text skeleton */}
                        <div className="max-w-xl w-full space-y-3">
                            <div className="h-8 bg-[#27272A] rounded w-3/4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                            </div>
                            <div className="h-6 bg-[#27272A] rounded w-1/2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                            </div>
                            <div className="h-4 bg-[#27272A] rounded w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                            </div>
                            <div className="h-4 bg-[#27272A] rounded w-5/6 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* All Results Skeleton */}
            <div className="max-w-6xl mx-auto">
                <div className="h-7 bg-[#27272A] rounded w-32 mb-3 sm:mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-3 sm:p-4 rounded-xl border bg-[#18181B]/60 border-[#27272A]">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-6 bg-[#27272A] rounded w-8 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-[#27272A] rounded w-3/4 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                                    </div>
                                    <div className="h-4 bg-[#27272A] rounded w-1/2 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                                <div className="h-8 bg-[#27272A] rounded w-20 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3F3F46] to-transparent animate-[swipe_1.5s_ease-in-out_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
