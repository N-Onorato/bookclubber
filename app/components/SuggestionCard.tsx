import Image from 'next/image';

interface SuggestionCardProps {
    title: string;
    author: string;
    suggestedBy: string;
    coverImageUrl?: string;
    description?: string;
    pageCount?: number;
    voteCount?: number;
    isWinner?: boolean;
    className?: string;
}

export function SuggestionCard({
    title,
    author,
    suggestedBy,
    coverImageUrl,
    description,
    pageCount,
    voteCount,
    isWinner = false,
    className = ''
}: SuggestionCardProps) {
    return (
        <div
            className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
                isWinner ? 'ring-2 ring-green-500 ring-offset-2' : ''
            } ${className}`}
        >
            {isWinner && (
                <div className="mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Winner
                    </span>
                </div>
            )}

            <div className="flex gap-4">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                    {coverImageUrl ? (
                        <div className="relative w-24 h-36 overflow-hidden bg-gray-100">
                            <Image
                                src={coverImageUrl}
                                alt={`${title} cover`}
                                fill
                                className="object-cover"
                                sizes="96px"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-36 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs text-center px-2">No cover</span>
                        </div>
                    )}
                </div>

                {/* Book Details */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate" title={title}>
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">by {author}</p>

                    {description && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-3" title={description}>
                            {description}
                        </p>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span>Suggested by {suggestedBy}</span>
                        {pageCount && <span>{pageCount} pages</span>}
                        {voteCount !== undefined && (
                            <span className="font-medium text-gray-700">
                                {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
