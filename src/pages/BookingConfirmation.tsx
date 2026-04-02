import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Check, Calendar, Clock, Users, MapPin, Coffee, Home, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/context/BookingContext';
import { useOrder } from '@/context/OrderContext';
import { ConfettiEffect } from '@/components/shared/ConfettiEffect';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
// Map order items into the structure used by tableOrders
type OrderItemForTable = {
  menuItemId: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

const saveTableOrder = async (
  tableId: string,
  tableName: string,
  zone: string,
  items: ReturnType<typeof useOrder>["items"]
) => {
  const mappedItems: OrderItemForTable[] = items.map((i) => ({
    menuItemId: String(i.id),
    name: i.name,
    category: i.category,
    quantity: i.quantity,
    unitPrice: i.price,
    totalPrice: i.price * i.quantity,
  }));

  const subtotal = mappedItems.reduce((sum, it) => sum + it.totalPrice, 0);

  // check if an order already exists for this table
  const qSnap = await getDocs(
    query(collection(db, "tableOrders"), where("tableId", "==", tableId))
  );

  if (qSnap.empty) {
    await addDoc(collection(db, "tableOrders"), {
      tableId,
      tableName,
      zone,
      status: "open",
      items: mappedItems,
      subtotal,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    const d = qSnap.docs[0];
    await setDoc(
      doc(db, "tableOrders", d.id),
      {
        tableId,
        tableName,
        zone,
        status: "open",
        items: mappedItems,
        subtotal,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
};

const BookingConfirmation = () => {
  const { booking, clearBooking } = useBooking();
  const { items, total, clearOrder } = useOrder();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);
useEffect(() => {
    if (!booking || items.length === 0) return;

    saveTableOrder(
      booking.tableId,
      booking.tableName,
      booking.zone,
      items
    ).catch((err) => console.error("Failed to save table order", err));
  }, [booking, items]);
  // Redirect if no booking
  if (!booking) {
    return <Navigate to="/book" replace />;
  }

  const handleNewBooking = () => {
    clearBooking();
    clearOrder();
  };

  const grandTotal = total * 1.1; // Including tax

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 relative">
      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}

      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-status-available/20 flex items-center justify-center relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-16 h-16 rounded-full bg-status-available flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-background" />
            </motion.div>
            {/* Pulse rings */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-status-available"
            />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
            Reservation <span className="text-gradient-gold">Confirmed!</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Thank you, {booking.customerName}. We look forward to seeing you!
          </p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 mb-6 gold-glow"
        >
          <h2 className="font-serif text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Reservation Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Table</p>
                <p className="font-medium text-foreground">{booking.tableName}</p>
                <p className="text-xs text-muted-foreground">{booking.zone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-medium text-foreground">{booking.seats} seats</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">
                  {booking.date ? format(booking.date, 'EEEE, MMMM d, yyyy') : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium text-foreground">{booking.time}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Summary */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6 mb-6"
          >
            <h2 className="font-serif text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-primary" />
              Your Pre-Order
            </h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="text-foreground">${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2">
                <span className="text-foreground">Total</span>
                <span className="text-primary">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            variant="outline"
            className="flex-1 border-primary/50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Details
          </Button>
          <Link to="/" onClick={handleNewBooking} className="flex-1">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gold-glow-sm">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          A confirmation has been sent to your phone at {booking.customerPhone}.
          <br />
          Please arrive 5 minutes before your reservation time.
        </motion.p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
