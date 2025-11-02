import { SuggestionWithDetails } from '@/lib/types';
import BacklitCard from '@/components/BacklitCard';

interface SuggestionCardProps {
    suggestion: SuggestionWithDetails;
    canDelete: boolean;
    onDelete: (id: string) => void;
}

export default function SuggestionCard({ suggestion, canDelete, onDelete }: SuggestionCardProps) {
    return (
        <BacklitCard glowColor="amber" intensity="subtle">
            <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] hover:border-accent transition-all">
            <div className="flex gap-6">
                {/* Book Cover - Left Side */}
                {suggestion.cover_image_url && (
                    <div className="flex-shrink-0">
                        <img
                            src={suggestion.cover_image_url}
                            alt={suggestion.title}
                            className="w-48 h-auto object-cover rounded-lg shadow-lg"
                        />
                    </div>
                )}

                {/* Book Details - Right Side */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                                {suggestion.title || 'Untitled'}
                            </h3>
                            <p className="text-foreground/70 text-lg mb-3">by {suggestion.author || 'Unknown Author'}</p>
                        </div>
                        {canDelete && (
                            <button
                                onClick={() => onDelete(suggestion.id)}
                                className="ml-4 px-3 py-1 text-sm bg-red-500/10 border border-red-500/30 rounded-full text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Delete suggestion"
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    {suggestion.description && (
                        <p className="text-foreground/60 text-sm mb-4 leading-relaxed">
                            {suggestion.description}
                        </p>
                    )}

                    {suggestion.reason && (
                        <div className="mt-4 p-4 bg-[#18181B]/40 border border-[#27272A] rounded-lg">
                            <p className="text-foreground/50 text-xs mb-2 uppercase tracking-wider">Why this book?</p>
                            <p className="text-foreground/70 text-sm italic">&quot;{suggestion.reason}&quot;</p>
                        </div>
                    )}

                    <p className="text-foreground/40 text-xs mt-4">
                        Suggested by {suggestion.suggested_by}
                    </p>
                </div>
            </div>
        </div>
        </BacklitCard>
    );
}
