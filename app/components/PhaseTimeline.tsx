import { Phase } from '@/lib/types';

interface PhaseTimelineProps {
    phases: Phase[];
    className?: string;
}

export function PhaseTimeline({ phases, className = '' }: PhaseTimelineProps) {
    const now = new Date();

    const getPhaseStatus = (phase: Phase): 'completed' | 'active' | 'upcoming' => {
        const start = new Date(phase.starts_at);
        const end = new Date(phase.ends_at);

        if (now > end) return 'completed';
        if (now >= start && now <= end) return 'active';
        return 'upcoming';
    };

    const getPhaseLabel = (type: string): string => {
        switch (type) {
            case 'suggestion':
                return 'Suggestions';
            case 'voting':
                return 'Voting';
            case 'reading':
                return 'Reading';
            default:
                return type;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-blue-500 border-blue-600';
            case 'active':
                return 'bg-green-500 border-green-600 ring-4 ring-green-200';
            case 'upcoming':
                return 'bg-gray-300 border-gray-400';
            default:
                return 'bg-gray-300 border-gray-400';
        }
    };

    const sortedPhases = [...phases].sort(
        (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    );

    return (
        <div className={`flex items-center space-x-4 ${className}`}>
            {sortedPhases.map((phase, index) => {
                const status = getPhaseStatus(phase);
                const isLast = index === sortedPhases.length - 1;

                return (
                    <div key={phase.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                            {/* Phase dot */}
                            <div
                                className={`w-4 h-4 rounded-full border-2 ${getStatusStyles(status)}`}
                                title={`${getPhaseLabel(phase.type)}: ${new Date(phase.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(phase.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            />
                            {/* Phase label */}
                            <div className="mt-2 text-xs text-center">
                                <div className={`font-medium ${status === 'active' ? 'text-green-700' : 'text-gray-600'}`}>
                                    {getPhaseLabel(phase.type)}
                                </div>
                                <div className="text-gray-500 whitespace-nowrap">
                                    {new Date(phase.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        {/* Connecting line */}
                        {!isLast && (
                            <div className="w-12 h-0.5 bg-gray-300 mb-8" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
