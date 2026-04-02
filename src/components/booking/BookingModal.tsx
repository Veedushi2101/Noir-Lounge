import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MapPin, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, getZoneName } from '@/data/tableData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useBooking } from '@/context/BookingContext';
import { cn } from '@/lib/utils';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface BookingModalProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
}

const timeSlots = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
];
//timingsslot to date comparison
const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

//timings slot to date object
const slotToDate = (baseDate: Date, slot: string) => {
  // slot format: "2:30 PM"
  const [timePart, ampm] = slot.split(" ");
  const [hourStr, minuteStr] = timePart.split(":");
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
};


export const BookingModal = ({ table, isOpen, onClose }: BookingModalProps) => {
  const navigate = useNavigate();
  const { setBooking } = useBooking();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

// Time slots filtered based on date and current time (+2 hours rule)
const availableTimeSlots = (() => {
  if (!date) return timeSlots; // no date selected yet → show all

  const now = new Date();

  // if selected date is NOT today, return all slots
  if (!isSameDay(date, now)) return timeSlots;

  // selected date is today → filter by now + 2 hours
  const minTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // now + 2 hours if in future change if you wish like for how many hours you want more

  return timeSlots.filter((slot) => {
    const slotDate = slotToDate(date, slot);
    return slotDate >= minTime;
  });
})();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!table || !name || !phone || !date || !time) return;

  try {
    setIsLoading(true);

    // 1) Save booking to Firestore
    const bookingData = {
      tableId: table.docId ?? table.id.toString(),
      tableName: table.name,
      zone: getZoneName(table.zone),
      seats: table.seats,
      customerName: name,
      customerPhone: phone,
      date: date.toISOString(),
      time,
      status: "pending",
      userId: user?.uid,
      userEmail: user?.email ?? null,
      createdAt: serverTimestamp(),
    };

    const bookingRef = await addDoc(collection(db, "bookings"), bookingData);

    // 2) Set table to "reserved" (pending admin approval)
    try {
      const tableRef = doc(db, "tables", table.docId!);
      await updateDoc(tableRef, {
        status: "reserved",
        updatedAt: serverTimestamp(),
        pendingBookingId: bookingRef.id
      });
      console.log("Table reserved:", table.name);
    } catch (error) {
      console.warn("Table update failed:", error);
    }

    // 3) Keep existing context for confirmation screen
    setBooking({
      tableId: table.docId,
      tableName: table.name,
      zone: getZoneName(table.zone),
      seats: table.seats,
      customerName: name,
      customerPhone: phone,
      date,
      time,
    });

    setIsLoading(false);
    onClose();
    navigate("/confirmation");
  } catch (error) {
    console.error("Error creating booking:", error);
    setIsLoading(false);
  }
};


  if (!table) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
         <motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  className="fixed inset-0 flex items-center justify-center z-50 px-4"
>
  <div className="glass-panel p-6 gold-glow w-full max-w-md">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    Book Table {table.name}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Complete your reservation
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Table Info */}
              <div className="bg-secondary/50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{getZoneName(table.zone)}</span>
                  </div>
                  <StatusBadge status={table.status} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{table.seats} seats</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                    className="bg-secondary border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-secondary border-border',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select time">
                        {time || (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            Select time
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
  {availableTimeSlots.map((slot) => (
    <SelectItem key={slot} value={slot}>
      {slot}
    </SelectItem>
  ))}
</SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !name || !phone || !date || !time}
                  className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 gold-glow-sm"
                >
                  {isLoading ? (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Confirming...
                    </motion.span>
                  ) : (
                    'Confirm Reservation'
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
