import { useState } from 'react';
import { motion } from 'framer-motion';
import { zones, Table } from '@/data/tableData'; // keep zones + Table type
import { TableCard } from './TableCard';
import { BookingModal } from './BookingModal';
import { cn } from '@/lib/utils';

interface FloorPlanProps {
  selectedZone: string | null;
  tables: Table[]; // 🔹 tables now come from Firestore via props
   onTableClick?: (table: Table) => void; 
}

export const FloorPlan = ({ selectedZone, tables }: FloorPlanProps) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔹 Use tables from props instead of imported static tables
  const filteredTables = selectedZone
    ? tables.filter(t => t.zone === selectedZone)
    : tables;

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  // Group tables by zone for the layout
  const mainTables = filteredTables.filter(t => t.zone === 'main');
  const cozyTables = filteredTables.filter(t => t.zone === 'cozy');
  const loungeTables = filteredTables.filter(t => t.zone === 'lounge');
  const windowTables = filteredTables.filter(t => t.zone === 'window');

  const renderZone = (zoneTables: Table[], zoneId: string, title: string) => {
    if (selectedZone && selectedZone !== zoneId) return null;
    if (zoneTables.length === 0) return null;

    const zone = zones.find(z => z.id === zoneId);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'glass-panel p-6 rounded-2xl',
          `bg-gradient-to-br ${zone?.color}`
        )}
      >
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
          {title}
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {zoneTables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <TableCard
                table={table}
                onClick={() => handleTableClick(table)}
                isSelected={selectedTable?.id === table.id}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-status-available animate-pulse" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-status-booked" />
          <span className="text-muted-foreground">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-status-reserved" />
          <span className="text-muted-foreground">Reserved</span>
        </div>
      </div>

      {/* Floor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {renderZone(mainTables, 'main', 'Main Dining Area')}
          {renderZone(windowTables, 'window', 'Window Seats')}
        </div>

        {/* Side Areas */}
        <div className="space-y-6">
          {renderZone(cozyTables, 'cozy', 'Cozy Corner')}
          {renderZone(loungeTables, 'lounge', 'Private Lounge')}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        table={selectedTable}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTable(null);
        }}
      />
    </div>
  );
};
