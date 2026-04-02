import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloorPlan } from "@/components/booking/FloorPlan";
import { zones, Table } from "@/data/tableData";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";  // 🔹 ADD
import { useNavigate } from "react-router-dom";   // 🔹 ADD

const TableBooking = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const { user } = useAuth();                        // 🔹 ADD
  const navigate = useNavigate();                    // 🔹 ADD

  // 🔹 ADD - redirect guests to login
  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
  }, [user, navigate]);

 useEffect(() => {
  const unsub = onSnapshot(collection(db, "tables"), (snap) => {
    const data: Table[] = snap.docs.map((doc) => {
      const d = doc.data() as any;
      return {
        id: d.number,
        name: d.name,
        seats: d.seats,
        zone: d.zone,
        status: d.status,
        position: d.position,
        docId: doc.id,
      };
    });
    console.log("✅ Firestore tables updated:", data);
    setTables(data);
  });
  
  return () => unsub(); // Cleanup
}, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Reserve Your <span className="text-gradient-gold">Table</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select an available table from our floor plan. 
            Choose your preferred zone for the perfect ambiance.
          </p>
        </motion.div>

        {/* Zone Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          <Button
            variant={selectedZone === null ? 'default' : 'outline'}
            onClick={() => setSelectedZone(null)}
            className={cn(
              'transition-all',
              selectedZone === null && 'gold-glow-sm'
            )}
          >
            <MapPin className="w-4 h-4 mr-2" />
            All Zones
          </Button>
          {zones.map((zone) => (
            <Button
              key={zone.id}
              variant={selectedZone === zone.id ? 'default' : 'outline'}
              onClick={() => setSelectedZone(zone.id)}
              className={cn(
                'transition-all',
                selectedZone === zone.id && 'gold-glow-sm'
              )}
            >
              {zone.name}
            </Button>
          ))}
        </motion.div>

        {/* Floor Plan */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FloorPlan
            selectedZone={selectedZone}
            tables={tables}
          />
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground text-sm">
            Click on any <span className="text-status-available font-medium">available (green)</span> table to make a reservation.
            <br />
            Tables marked as booked or reserved are currently unavailable.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TableBooking;
