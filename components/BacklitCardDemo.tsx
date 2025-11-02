'use client';

import BacklitCard from './BacklitCard';

export default function BacklitCardDemo() {
    return (
        <div className="min-h-screen bg-[#0e0e0e] p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                <h1 className="text-4xl font-bold text-foreground mb-8">Backlit Card Examples</h1>

                {/* Intensity Levels */}
                <section>
                    <h2 className="text-2xl font-semibold text-foreground/90 mb-4">Intensity Levels (Amber)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <BacklitCard glowColor="amber" intensity="subtle">
                            <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                                <h3 className="text-xl font-semibold text-foreground mb-2">Subtle</h3>
                                <p className="text-foreground/70">Gentle glow on hover. Perfect for most cards.</p>
                            </div>
                        </BacklitCard>

                        <BacklitCard glowColor="amber" intensity="medium">
                            <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                                <h3 className="text-xl font-semibold text-foreground mb-2">Medium</h3>
                                <p className="text-foreground/70">Noticeable backlight for emphasis.</p>
                            </div>
                        </BacklitCard>

                        <BacklitCard glowColor="amber" intensity="strong">
                            <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                                <h3 className="text-xl font-semibold text-foreground mb-2">Strong</h3>
                                <p className="text-foreground/70">Bold glow for special cards.</p>
                            </div>
                        </BacklitCard>
                    </div>
                </section>

                {/* Color Options */}
                <section>
                    <h2 className="text-2xl font-semibold text-foreground/90 mb-4">Color Options (Subtle)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <BacklitCard glowColor="amber">
                            <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-full mb-3" />
                                <h3 className="text-lg font-semibold text-foreground">Amber</h3>
                            </div>
                        </BacklitCard>

                        <BacklitCard glowColor="blue">
                            <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-full mb-3" />
                                <h3 className="text-lg font-semibold text-foreground">Blue</h3>
                            </div>
                        </BacklitCard>

                        <BacklitCard glowColor="purple">
                            <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-full mb-3" />
                                <h3 className="text-lg font-semibold text-foreground">Purple</h3>
                            </div>
                        </BacklitCard>

                        <BacklitCard glowColor="emerald">
                            <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-full mb-3" />
                                <h3 className="text-lg font-semibold text-foreground">Emerald</h3>
                            </div>
                        </BacklitCard>

                        <BacklitCard glowColor="rose">
                            <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                                <div className="w-12 h-12 bg-rose-500/20 rounded-full mb-3" />
                                <h3 className="text-lg font-semibold text-foreground">Rose</h3>
                            </div>
                        </BacklitCard>
                    </div>
                </section>

                {/* Real Example */}
                <section>
                    <h2 className="text-2xl font-semibold text-foreground/90 mb-4">Book Card Example</h2>
                    <BacklitCard glowColor="amber" intensity="subtle">
                        <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A]">
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-32 h-48 bg-gradient-to-br from-amber-900/40 to-amber-700/20 rounded-lg" />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                                        The Great Gatsby
                                    </h3>
                                    <p className="text-foreground/70 text-lg mb-3">by F. Scott Fitzgerald</p>
                                    <p className="text-foreground/60 text-sm leading-relaxed">
                                        A classic American novel set in the Jazz Age that explores themes of decadence,
                                        idealism, and social upheaval.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </BacklitCard>
                </section>

                {/* Usage Instructions */}
                <section className="border-t border-[#27272A] pt-8">
                    <h2 className="text-2xl font-semibold text-foreground/90 mb-4">Usage</h2>
                    <div className="p-6 bg-[#18181B]/40 rounded-lg border border-[#27272A]">
                        <pre className="text-sm text-foreground/80 overflow-x-auto">
                            <code>{`import BacklitCard from '@/components/BacklitCard';

<BacklitCard glowColor="amber" intensity="subtle">
  <div className="your-card-classes">
    {/* Your card content */}
  </div>
</BacklitCard>`}</code>
                        </pre>
                    </div>
                </section>
            </div>
        </div>
    );
}
