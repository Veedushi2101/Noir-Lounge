import { cn } from '@/lib/utils';
import { TableStatus } from '@/data/tableData';

interface StatusBadgeProps {
  status: TableStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  available: {
    label: 'Available',
    bgColor: 'bg-status-available/20',
    textColor: 'text-status-available',
    glowClass: 'status-glow-available',
  },
  booked: {
    label: 'Booked',
    bgColor: 'bg-status-booked/20',
    textColor: 'text-status-booked',
    glowClass: 'status-glow-booked',
  },
  reserved: {
    label: 'Reserved',
    bgColor: 'bg-status-reserved/20',
    textColor: 'text-status-reserved',
    glowClass: 'status-glow-reserved',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all',
        config.bgColor,
        config.textColor,
        sizeConfig[size]
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full animate-pulse',
          status === 'available' && 'bg-status-available',
          status === 'booked' && 'bg-status-booked',
          status === 'reserved' && 'bg-status-reserved'
        )}
      />
      {config.label}
    </span>
  );
};
