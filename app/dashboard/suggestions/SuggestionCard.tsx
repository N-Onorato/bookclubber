'use client';

import { useState } from 'react';
import { SuggestionWithDetails } from '@/lib/types';
import BacklitCard from '@/components/BacklitCard';

interface SuggestionCardProps {
    suggestion: SuggestionWithDetails;
    canDelete: boolean;
    onDelete: (id: string) => void;
    canEdit?: boolean;
    onEdit?: (suggestion: SuggestionWithDetails) => void;
}

export default function SuggestionCard({ suggestion, canDelete, onDelete, canEdit, onEdit }: SuggestionCardProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const descriptionCharLimit = 300;
    const shouldTruncateDescription = suggestion.description && suggestion.description.length > descriptionCharLimit;

    return (
        <BacklitCard glowColor="amber" intensity="subtle">
            <div className="p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] hover:border-accent transition-all">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Book Cover - Top on mobile, Left on desktop */}
                {suggestion.cover_image_url && (
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                        <img
                            src={suggestion.cover_image_url}
                            alt={suggestion.title}
                            className="w-48 h-auto object-cover shadow-lg"
                        />
                    </div>
                )}

                {/* Book Details - Bottom on mobile, Right on desktop */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                        <div className="flex-1">
                            <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                                {suggestion.title || 'Untitled'}
                            </h3>
                            <p className="text-foreground/70 text-lg mb-1">by {suggestion.author || 'Unknown Author'}</p>
                            {suggestion.page_count && suggestion.page_count > 0 && (
                                <p className="text-foreground/50 text-sm">
                                    {suggestion.page_count} pages
                                </p>
                            )}
                            {suggestion.categories && typeof suggestion.categories === 'string' && (() => {
                                try {
                                    const cats = JSON.parse(suggestion.categories);
                                    if (cats && cats.length > 0) {
                                        return (
                                            <div className="flex gap-1 mt-2 flex-wrap">
                                                {cats.slice(0, 3).map((category: string, i: number) => (
                                                    <span key={i} className="text-xs px-2 py-1 bg-accent/10 text-accent/70 rounded-full">
                                                        {category}
                                                    </span>
                                                ))}
                                            </div>
                                        );
                                    }
                                } catch {
                                    return null;
                                }
                            })()}
                        </div>
                        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                            {canEdit && onEdit && (
                                <button
                                    onClick={() => onEdit(suggestion)}
                                    className="px-3 py-1 text-sm bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 hover:bg-blue-500/20 transition-colors whitespace-nowrap"
                                    title="Edit book details"
                                >
                                    Edit
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => onDelete(suggestion.id)}
                                    className="px-3 py-1 text-sm bg-red-500/10 border border-red-500/30 rounded-full text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap"
                                    title="Delete suggestion"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>

                    {suggestion.description && (
                        <div className="mb-4">
                            <p className="text-foreground/60 text-sm leading-relaxed">
                                {shouldTruncateDescription && !isDescriptionExpanded
                                    ? `${suggestion.description.slice(0, descriptionCharLimit)}...`
                                    : suggestion.description}
                            </p>
                            {shouldTruncateDescription && (
                                <button
                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    className="mt-2 text-xs text-accent hover:text-accent/80 transition-colors underline"
                                >
                                    {isDescriptionExpanded ? 'Show less' : 'Read more'}
                                </button>
                            )}
                        </div>
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
