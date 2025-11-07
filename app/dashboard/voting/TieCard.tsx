import BacklitCard from '@/components/BacklitCard';
import { Book, User } from '@/lib/types';

interface TieCardProps {
    book: Book;
    voteCount: number;
    isAdmin: boolean;
    onSelectWinner: (bookId: string) => void;
    getCoverUrl: (book: Book) => string | undefined;
}

export default function TieCard({ book, voteCount, isAdmin, onSelectWinner, getCoverUrl }: TieCardProps) {
    return (
        <BacklitCard glowColor="amber" intensity="medium">
            <div className="p-4 sm:p-6 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-amber-500/30">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {getCoverUrl(book) && (
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                            <img
                                src={getCoverUrl(book)}
                                alt={`Cover of ${book.title}`}
                                loading="lazy"
                                className="w-40 sm:w-48 h-auto object-cover shadow-lg rounded"
                            />
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-serif font-semibold text-foreground">
                                        {book.title}
                                    </h3>
                                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 text-xs sm:text-sm font-semibold self-center sm:self-auto">
                                        {voteCount} votes
                                    </span>
                                </div>
                                <p className="text-foreground/70 text-base sm:text-lg mb-3">by {book.author}</p>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={() => onSelectWinner(book.id)}
                                    aria-label={`Select ${book.title} as winner`}
                                    className="w-full sm:w-auto sm:ml-4 px-4 sm:px-6 py-2 bg-accent/20 border border-accent rounded-full text-foreground hover:bg-accent/30 transition-colors text-sm font-semibold"
                                >
                                    Select as Winner
                                </button>
                            )}
                        </div>

                        {book.description && (
                            <p className="text-foreground/60 text-sm sm:text-base leading-relaxed text-center sm:text-left">
                                {book.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </BacklitCard>
    );
}
