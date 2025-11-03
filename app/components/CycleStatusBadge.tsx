import { CycleStatus } from '@/lib/types';

interface CycleStatusBadgeProps {
    status: CycleStatus;
    className?: string;
}

export function CycleStatusBadge({ status, className = '' }: CycleStatusBadgeProps) {
    const getStatusStyles = () => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'archived':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'completed':
                return 'Completed';
            case 'archived':
                return 'Archived';
            default:
                return status;
        }
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()} ${className}`}
        >
            {getStatusText()}
        </span>
    );
}
