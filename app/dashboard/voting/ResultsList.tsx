import { Book } from '@/lib/types';

interface VoteCount {
    bookId: string;
    count: number;
    book: Book;
}

interface ResultsListProps {
    voteCounts: VoteCount[];
    selectedWinner: string | null;
    winningBooks: Book[];
}

export default function ResultsList({ voteCounts, selectedWinner, winningBooks }: ResultsListProps) {
    if (voteCounts.length === 0) {
        return (
            <div className="p-6 sm:p-8 bg-[#18181B]/60 backdrop-blur-lg rounded-2xl border border-[#27272A] text-center">
                <p className="text-sm sm:text-base text-foreground/60">No votes were cast in this phase.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            {voteCounts.map((voteCount, index) => {
                const isWinner = selectedWinner
                    ? voteCount.bookId === selectedWinner
                    : winningBooks.some(w => w.id === voteCount.bookId);

                return (
                    <div
                        key={voteCount.bookId}
                        className={`p-3 sm:p-4 rounded-xl border backdrop-blur-lg transition-all ${
                            isWinner
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-[#18181B]/60 border-[#27272A]'
                        }`}
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <span className="text-lg sm:text-2xl font-bold text-foreground/40 w-6 sm:w-8 flex-shrink-0">
                                    #{index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
                                        {voteCount.book.title}
                                    </h3>
                                    <p className="text-foreground/60 text-xs sm:text-sm truncate">
                                        by {voteCount.book.author}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                                {isWinner && (
                                    <span className="text-amber-400 text-lg sm:text-xl" aria-label="Winner">🏆</span>
                                )}
                                <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
                                    isWinner
                                        ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                                        : 'bg-[#18181B]/40 border border-[#27272A] text-foreground/70'
                                }`}>
                                    {voteCount.count} vote{voteCount.count !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
