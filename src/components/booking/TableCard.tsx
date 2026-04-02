import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Table } from '@/data/tableData';
import { cn } from '@/lib/utils';

interface TableCardProps {
  table: Table;
  onClick: () => void;
  isSelected?: boolean;
}

export const TableCard = ({ table, onClick, isSelected }: TableCardProps) => {
  const statusColors = {
    available: 'border-status-available bg-status-available/10 hover:bg-status-available/20',
    booked: 'border-status-booked bg-status-booked/10 cursor-not-allowed opacity-60',
    reserved: 'border-status-reserved bg-status-reserved/10 cursor-not-allowed opacity-60',
  };

  const glowClasses = {
    available: 'hover:shadow-[0_0_25px_hsl(var(--status-available)/0.4)]',
    booked: '',
    reserved: '',
  };

  const isClickable = table.status === 'available';

  return (
    <motion.button
      onClick={() => isClickable && onClick()}
      disabled={!isClickable}
      whileHover={isClickable ? { scale: 1.05, y: -5 } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      className={cn(
        'relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 min-w-[80px] min-h-[80px]',
        statusColors[table.status],
        glowClasses[table.status],
        isSelected && 'ring-2 ring-primary gold-glow'
      )}
    >
      {/* Table Number */}
      <span className="font-serif text-lg font-bold text-foreground">
        {table.name}
      </span>

      {/* Seats */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="w-3 h-3" />
        <span>{table.seats}</span>
      </div>

      {/* Status Dot */}
      <motion.div
        animate={table.status === 'available' ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn(
          'absolute top-2 right-2 w-2 h-2 rounded-full',
          table.status === 'available' && 'bg-status-available',
          table.status === 'booked' && 'bg-status-booked',
          table.status === 'reserved' && 'bg-status-reserved'
        )}
      />
    </motion.button>
  );
};
