import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BookingDetails {
  tableId: string;
  tableName: string;
  zone: string;
  seats: number;
  customerName: string;
  customerPhone: string;
  date: Date | null;
  time: string;
}

interface BookingContextType {
  booking: BookingDetails | null;
  setBooking: (booking: BookingDetails | null) => void;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [booking, setBooking] = useState<BookingDetails | null>(null);

  const clearBooking = () => setBooking(null);

  return (
    <BookingContext.Provider value={{ booking, setBooking, clearBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
