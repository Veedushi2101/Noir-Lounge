export type TableStatus = 'available' | 'booked' | 'reserved';

export interface Table {
  id: number;
  name: string;
  seats: number;
  zone: string;
  status: TableStatus;
  position: { x: number; y: number };
  docId?: string; // 🔹 add this (optional so static data still works)
}

export const zones = [
  { id: 'main', name: 'Main Dining', color: 'from-primary/20 to-primary/5' },
  { id: 'cozy', name: 'Cozy Corner', color: 'from-amber-900/20 to-amber-900/5' },
  { id: 'lounge', name: 'Private Lounge', color: 'from-purple-900/20 to-purple-900/5' },
  { id: 'window', name: 'Window Seats', color: 'from-blue-900/20 to-blue-900/5' },
];

export const tables: Table[] = [
  // Main Dining Area (12 tables)
  { id: 1, name: 'M1', seats: 2, zone: 'main', status: 'available', position: { x: 10, y: 15 } },
  { id: 2, name: 'M2', seats: 2, zone: 'main', status: 'booked', position: { x: 25, y: 15 } },
  { id: 3, name: 'M3', seats: 4, zone: 'main', status: 'available', position: { x: 40, y: 15 } },
  { id: 4, name: 'M4', seats: 4, zone: 'main', status: 'reserved', position: { x: 55, y: 15 } },
  { id: 5, name: 'M5', seats: 6, zone: 'main', status: 'available', position: { x: 10, y: 35 } },
  { id: 6, name: 'M6', seats: 6, zone: 'main', status: 'available', position: { x: 25, y: 35 } },
  { id: 7, name: 'M7', seats: 4, zone: 'main', status: 'booked', position: { x: 40, y: 35 } },
  { id: 8, name: 'M8', seats: 2, zone: 'main', status: 'available', position: { x: 55, y: 35 } },
  { id: 9, name: 'M9', seats: 8, zone: 'main', status: 'available', position: { x: 17, y: 55 } },
  { id: 10, name: 'M10', seats: 8, zone: 'main', status: 'reserved', position: { x: 47, y: 55 } },
  { id: 11, name: 'M11', seats: 4, zone: 'main', status: 'available', position: { x: 10, y: 75 } },
  { id: 12, name: 'M12', seats: 4, zone: 'main', status: 'booked', position: { x: 55, y: 75 } },
  
  // Cozy Corner (6 tables)
  { id: 13, name: 'C1', seats: 2, zone: 'cozy', status: 'available', position: { x: 75, y: 10 } },
  { id: 14, name: 'C2', seats: 2, zone: 'cozy', status: 'available', position: { x: 88, y: 10 } },
  { id: 15, name: 'C3', seats: 2, zone: 'cozy', status: 'booked', position: { x: 75, y: 25 } },
  { id: 16, name: 'C4', seats: 2, zone: 'cozy', status: 'available', position: { x: 88, y: 25 } },
  { id: 17, name: 'C5', seats: 2, zone: 'cozy', status: 'reserved', position: { x: 75, y: 40 } },
  { id: 18, name: 'C6', seats: 2, zone: 'cozy', status: 'available', position: { x: 88, y: 40 } },
  
  // Private Lounge (5 tables)
  { id: 19, name: 'L1', seats: 6, zone: 'lounge', status: 'available', position: { x: 75, y: 58 } },
  { id: 20, name: 'L2', seats: 6, zone: 'lounge', status: 'booked', position: { x: 88, y: 58 } },
  { id: 21, name: 'L3', seats: 8, zone: 'lounge', status: 'available', position: { x: 82, y: 72 } },
  { id: 22, name: 'L4', seats: 4, zone: 'lounge', status: 'available', position: { x: 75, y: 86 } },
  { id: 23, name: 'L5', seats: 4, zone: 'lounge', status: 'reserved', position: { x: 88, y: 86 } },
  
  // Window Seats (5 tables)
  { id: 24, name: 'W1', seats: 2, zone: 'window', status: 'available', position: { x: 25, y: 90 } },
  { id: 25, name: 'W2', seats: 2, zone: 'window', status: 'available', position: { x: 35, y: 90 } },
  { id: 26, name: 'W3', seats: 4, zone: 'window', status: 'booked', position: { x: 45, y: 90 } },
  { id: 27, name: 'W4', seats: 2, zone: 'window', status: 'available', position: { x: 55, y: 90 } },
  { id: 28, name: 'W5', seats: 2, zone: 'window', status: 'available', position: { x: 65, y: 90 } },
];

export const getZoneName = (zoneId: string): string => {
  return zones.find(z => z.id === zoneId)?.name || zoneId;
};
