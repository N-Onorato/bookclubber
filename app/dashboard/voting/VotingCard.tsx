import BacklitCard from '@/components/BacklitCard';

interface VotingCardProps {
    book: {
        id: string;
        title: string;
        author: string;
        cover_url?: string;
        local_cover_path?: string;
        cover_image_url?: string;
        description?: string;
        page_count?: number;
    };
    hasVoted: boolean;
    canVote: boolean;
    onVote: (bookId: string) => void;
    onUnvote: (bookId: string) => void;
}

export default function VotingCard({ book, hasVoted, canVote, onVote, onUnvote }: VotingCardProps) {
    const coverUrl = book.local_cover_path
        ? `/api/covers/${book.local_cover_path.split('/').pop()}`
        : book.cover_image_url || book.cover_url;

    return (
        <BacklitCard glowColor={hasVoted ? "emerald" : "blue"} intensity={hasVoted ? "medium" : "subtle"}>
            <div className={`p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border transition-all ${
                hasVoted
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-[#27272A] hover:border-accent'
            }`}>
                <div className="flex gap-6">
                    {/* Book Cover - Left Side */}
                    {coverUrl && (
                        <div className="flex-shrink-0">
                            <img
                                src={coverUrl}
                                alt={book.title}
                                className="w-48 h-auto object-cover shadow-lg"
                            />
                        </div>
                    )}

                    {/* Book Details - Right Side */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
                                    {book.title}
                                </h3>
                                <p className="text-foreground/70 text-lg mb-3">by {book.author}</p>
                            </div>
                            <div className="ml-4 flex flex-col gap-2">
                                {hasVoted ? (
                                    <>
                                        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 text-sm font-semibold flex items-center gap-2">
                                            ✓ Voted
                                        </div>
                                        <button
                                            onClick={() => onUnvote(book.id)}
                                            className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 hover:bg-red-500/20 transition-colors text-sm"
                                        >
                                            Remove Vote
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => onVote(book.id)}
                                        disabled={!canVote}
                                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                                            canVote
                                                ? 'bg-accent/20 border border-accent text-foreground hover:bg-accent/30'
                                                : 'bg-[#18181B]/40 border border-[#27272A] text-foreground/30 cursor-not-allowed'
                                        }`}
                                    >
                                        {canVote ? 'Vote for this Book' : 'Vote Limit Reached'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {book.description && (
                            <p className="text-foreground/60 text-sm mb-4 leading-relaxed">
                                {book.description}
                            </p>
                        )}

                        {book.page_count && (
                            <p className="text-foreground/40 text-xs">
                                {book.page_count} pages
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </BacklitCard>
    );
}
