import BacklitCard from '@/components/BacklitCard';
import { Book } from '@/lib/types';

interface WinnerCardProps {
    book: Book;
    voteCount: number;
    getCoverUrl: (book: Book) => string | undefined;
}

export default function WinnerCard({ book, voteCount, getCoverUrl }: WinnerCardProps) {
    return (
        <BacklitCard glowColor="amber" intensity="strong">
            <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-lg rounded-2xl border border-amber-500/50">
                <div className="text-center mb-4 sm:mb-6">
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 mb-2">
                        🏆 Winner
                    </h2>
                    <p className="text-sm sm:text-base text-foreground/60">
                        {voteCount} vote{voteCount !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
                    {getCoverUrl(book) && (
                        <img
                            src={getCoverUrl(book)}
                            alt={`Cover of ${book.title}`}
                            loading="lazy"
                            className="w-48 sm:w-56 lg:w-64 h-auto object-cover shadow-2xl rounded"
                        />
                    )}
                    <div className="max-w-xl text-center sm:text-left">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-foreground mb-2">
                            {book.title}
                        </h3>
                        <p className="text-foreground/70 text-base sm:text-lg lg:text-xl mb-3 sm:mb-4">
                            by {book.author}
                        </p>
                        {book.description && (
                            <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
                                {book.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </BacklitCard>
    );
}
