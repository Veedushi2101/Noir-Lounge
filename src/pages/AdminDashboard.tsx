import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Table, 
  Calendar, 
  Utensils, 
  Settings,
  Users,
  TrendingUp,
  Clock,
  Check,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { tables, getZoneName } from '@/data/tableData';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { useEffect} from "react";
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateDoc, doc } from "firebase/firestore";
// import { collection, getDocs, query, orderBy, addDoc, deleteDoc } from "firebase/firestore";

import { useNavigate } from "react-router-dom";

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tables', label: 'Tables', icon: Table },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'menu', label: 'Menu', icon: Utensils },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const mockBookings = [
  { id: 1, name: 'John Smith', table: 'M3', time: '7:00 PM', guests: 4, status: 'pending' },
  { id: 2, name: 'Sarah Johnson', table: 'C2', time: '7:30 PM', guests: 2, status: 'confirmed' },
  { id: 3, name: 'Mike Williams', table: 'L1', time: '8:00 PM', guests: 6, status: 'pending' },
  { id: 4, name: 'Emily Brown', table: 'W1', time: '8:30 PM', guests: 2, status: 'confirmed' },
];

// const stats = [
//   { label: 'Total Bookings Today', value: '24', icon: Calendar, trend: '+12%' },
//   { label: 'Available Tables', value: '18', icon: Table, trend: null },
//   { label: 'Guests Expected', value: '86', icon: Users, trend: '+8%' },
//   { label: 'Avg. Duration', value: '1.5h', icon: Clock, trend: '-5%' },
// ];
// AdminDashboard.tsx
const MENU_CATEGORIES = [
  { id: "coffees", name: "Coffees" },
  { id: "drinks",  name: "Drinks" },
  { id: "snacks",  name: "Snacks" },
  { id: "meals",   name: "Meals" },
  { id: "desserts", name: "Desserts" },
];
const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState('overview');
  const navigate = useNavigate(); // for table view
type AdminBooking = {
  id: string;
  tableId: string;      // 🔹 add this line
  tableName: string;
  zone: string;
  customerName: string;
  customerPhone: string;
  date: string; // ISO string
  time: string;
  seats: number;
  status: string;
};
type AdminTable = {
  id: string;
  name: string;
  zone: string;
  seats: number;
  status: string;
};
type AdminMenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
};

const [bookings, setBookings] = useState<AdminBooking[]>([]);
const [loading, setLoading] = useState(true);

const updateBookingStatus = async (
  id: string,
  status: "pending" | "confirmed" | "cancelled"
) => {
  try {
    // 1) Update booking
    await updateDoc(doc(db, "bookings", id), { status });

    // 2) Update table status (only if tableId exists)
    const booking = bookings.find((b) => b.id === id);
    if (booking?.tableId) {
      let tableStatus: "available" | "reserved" | "booked" = "available";
      if (status === "pending") tableStatus = "reserved";
      if (status === "confirmed") tableStatus = "booked";
      if (status === "cancelled") tableStatus = "available";

      await updateDoc(doc(db, "tables", booking.tableId), { status: tableStatus });
    }

    // 3) Update local state
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  } catch (error) {
    console.error("Error updating booking:", error);
  }
};




//for tables
const [tablesData, setTablesData] = useState<AdminTable[]>([]);
const [tablesLoading, setTablesLoading] = useState(true);
//for menu
const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
const [menuLoading, setMenuLoading] = useState(true);
const [menuForm, setMenuForm] = useState({
  name: "",
  category: "",
  price: "",
  description: "",
  image: "",
  isAvailable: true,
});
//menu updateion functions
const addMenuItem = async () => {
  if (!menuForm.name || !menuForm.category || !menuForm.price) return;

  const payload = {
    name: menuForm.name,
    category: menuForm.category,
    price: Number(menuForm.price),
    description: menuForm.description,
    image: menuForm.image,
    isAvailable: menuForm.isAvailable,
  };

  const ref = await addDoc(collection(db, "menu"), payload);
  setMenuItems((prev) => [...prev, { id: ref.id, ...payload }]);
  setMenuForm({
    name: "",
    category: "",
    price: "",
    description: "",
    image: "",
    isAvailable: true,
  });
};

//editing the states of menu
const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
//editing the states of the tables
const [editingTableId, setEditingTableId] = useState<string | null>(null);
//deleting the menu
const deleteMenuItem = async (id: string) => {
  await deleteDoc(doc(db, "menu", id));
  setMenuItems((prev) => prev.filter((m) => m.id !== id));
};
//updating the menu
const updateMenuItem = async (
  id: string,
  changes: Partial<AdminMenuItem>
) => {
  await updateDoc(doc(db, "menu", id), changes);
  setMenuItems((prev) =>
    prev.map((m) => (m.id === id ? { ...m, ...changes } : m))
  );
};
//updating the table status
const updateTableStatus = async (id: string, status: string) => {
  await updateDoc(doc(db, "tables", id), { status });
  setTablesData((prev) =>
    prev.map((t) => (t.id === id ? { ...t, status } : t))
  );
};

useEffect(() => {
  // BOOKINGS
  const bookingsUnsub = onSnapshot(
    query(collection(db, "bookings"), orderBy("date", "asc")),
    (snap) => {
      const bookingsData: AdminBooking[] = snap.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          tableId: d.tableId,
          tableName: d.tableName,
          zone: d.zone,
          customerName: d.customerName,
          customerPhone: d.customerPhone,
          date: d.date,
          time: d.time,
          seats: d.seats,
          status: d.status ?? "pending",
        };
      });

      setBookings(bookingsData);
      setLoading(false); // ✅ IMPORTANT
    },
    (error) => {
      console.error("❌ bookings snapshot error:", error);
      setLoading(false);
    }
  );

  // TABLES
  const tablesUnsub = onSnapshot(
    collection(db, "tables"),
    (snap) => {
      const tablesData: AdminTable[] = snap.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          name: d.name,
          zone: d.zone,
          seats: d.seats,
          status: d.status ?? "available",
        };
      });

      setTablesData(tablesData);
      setTablesLoading(false); // ✅ IMPORTANT
    },
    (error) => {
      console.error("❌ tables snapshot error:", error);
      setTablesLoading(false);
    }
  );

  // MENU
  const menuUnsub = onSnapshot(
    collection(db, "menu"),
    (snap) => {
      const menuData: AdminMenuItem[] = snap.docs.map((doc) => {
        const d = doc.data() as any;
        return {
          id: doc.id,
          name: d.name,
          category: d.category,
          price: d.price,
          description: d.description,
          image: d.image ?? "",
          isAvailable: d.isAvailable ?? true,
        };
      });

      setMenuItems(menuData);
      setMenuLoading(false); // ✅ IMPORTANT
    },
    (error) => {
      console.error("❌ menu snapshot error:", error);
      setMenuLoading(false);
    }
  );

  // CLEANUP (VERY IMPORTANT)
  return () => {
    bookingsUnsub();
    tablesUnsub();
    menuUnsub();
  };
}, []);


// ===== Dashboard stats derived from Firestore data =====
const todayISO = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

const totalBookingsToday = bookings.filter((b) =>
  b.date.slice(0, 10) === todayISO
).length;

const availableTablesCount = tablesData.filter(
  (t) => t.status === "available"
).length;

const guestsExpectedToday = bookings
  .filter(
    (b) =>
      b.date.slice(0, 10) === todayISO &&
      b.status !== "cancelled"
  )
  .reduce((sum, b) => sum + b.seats, 0);

const stats = [
  {
    label: "Total Bookings Today",
    value: String(totalBookingsToday),
    icon: Calendar,
    trend: null,
  },
  {
    label: "Available Tables",
    value: String(availableTablesCount),
    icon: Table,
    trend: null,
  },
  {
    label: "Guests Expected",
    value: String(guestsExpectedToday),
    icon: Users,
    trend: null,
  },
  {
    label: "Avg. Duration",
    value: "1.5h", // keep static for now
    icon: Clock,
    trend: null,
  },
];

// put these near the top of AdminDashboard component state
const [overviewFilter, setOverviewFilter] = useState<
  "all" | "confirmed" | "cancelled" | "pending"
>("all");


  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
  initial={{ x: -50, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  className="w-64 sticky top-20 h-[calc(100vh-5rem)] bg-card border-r border-border p-4"
>
          <div className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-foreground px-3">
              Admin Panel
            </h2>
            <p className="text-sm text-muted-foreground px-3">Manage your café</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  activeNav === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-8">

          {activeNav === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Dashboard Overview
                </h1>
                <p className="text-muted-foreground">
                  Welcome back! Here's what's happening today.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-panel border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                            <p className="text-3xl font-serif font-bold text-foreground">{stat.value}</p>
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <stat.icon className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        {stat.trend && (
                          <div className="flex items-center gap-1 mt-3">
                            <TrendingUp className={cn(
                              'w-4 h-4',
                              stat.trend.startsWith('+') ? 'text-status-available' : 'text-status-booked'
                            )} />
                            <span className={cn(
                              'text-sm font-medium',
                              stat.trend.startsWith('+') ? 'text-status-available' : 'text-status-booked'
                            )}>
                              {stat.trend}
                            </span>
                            <span className="text-sm text-muted-foreground">vs yesterday</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Bookings */}
              {/* Recent Bookings */}
<Card className="glass-panel border-border">
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle className="font-serif text-xl">
      Recent Booking Requests
    </CardTitle>

    {/* Filter pills */}
    <div className="flex gap-2 text-xs">
      {["all", "confirmed", "cancelled", "pending"].map((f) => (
        <button
          key={f}
          onClick={() =>
            setOverviewFilter(f as "all" | "confirmed" | "cancelled" | "pending")
          }
          className={cn(
            "px-3 py-1 rounded-full border text-xs font-medium transition-colors",
            overviewFilter === f
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-muted-foreground border-border hover:bg-secondary/60"
          )}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  </CardHeader>

  <CardContent>
    {/* Scroll container */}
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {bookings
        // filter by current tab
        .filter((b) =>
          overviewFilter === "all" ? true : b.status === overviewFilter
        )
        // sort: pending first, then by date desc
        .sort((a, b) => {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (b.status === "pending" && a.status !== "pending") return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
        .map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {booking.customerName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {booking.customerName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Table {booking.tableName} · {booking.time} · {booking.seats}{" "}
                  guests
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={
                  booking.status === "confirmed"
                    ? "default"
                    : booking.status === "cancelled"
                    ? "destructive"
                    : "secondary"
                }
              >
                {booking.status}
              </Badge>

              {booking.status === "pending" && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-status-available hover:text-status-available"
                    onClick={() =>
                      updateBookingStatus(booking.id, "confirmed")
                    }
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-status-booked hover:text-status-booked"
                    onClick={() =>
                      updateBookingStatus(booking.id, "cancelled")
                    }
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
    </div>
  </CardContent>
</Card>

            </motion.div>
          )}

          {activeNav === 'tables' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Table Management
                </h1>
                <p className="text-muted-foreground">
                  View and manage all tables across zones.
                </p>
              </div>

              <Card className="glass-panel border-border">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Table</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Zone</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Seats</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tablesLoading ? (
  <tr>
    <td className="p-4 text-sm text-muted-foreground" colSpan={5}>
      Loading tables…
    </td>
  </tr>
) : tablesData.length === 0 ? (
  <tr>
    <td className="p-4 text-sm text-muted-foreground" colSpan={5}>
      No tables found in Firestore.
    </td>
  </tr>
) : (
     tablesData.map((table) => {
      const isEditingTable = editingTableId === table.id;
      return (
        <tr
          key={table.id}
          className="border-b border-border/50 hover:bg-secondary/30"
        >
          <td className="p-4 font-medium text-foreground">{table.name}</td>
          <td className="p-4 text-muted-foreground">
            {getZoneName(table.zone)}
          </td>
          <td className="p-4 text-muted-foreground">{table.seats}</td>

          {/* Status cell */}
          <td className="p-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={table.status as "available" | "reserved" | "booked"} size="sm" />
              {isEditingTable && (
                <select
                  className="bg-secondary border border-border rounded px-2 py-1 text-xs text-muted-foreground"
                  value={table.status}
                  onChange={(e) => updateTableStatus(table.id, e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="booked">Booked</option>
                </select>
              )}
            </div>
          </td>

          {/* Actions cell */}
          <td className="p-4 text-right space-x-2">
  {/* Edit status (your existing toggle) */}
  <Button
    size="icon"
    variant="ghost"
    onClick={() =>
      setEditingTableId(isEditingTable ? null : table.id)
    }
  >
    <Edit className="w-4 h-4" />
  </Button>

  {/* Go to per-table order view */}
  <Button
    size="icon"
    variant="ghost"
    onClick={() => navigate(`/admin/tables/${table.id}`)}
  >
    <Utensils className="w-4 h-4" />
  </Button>
</td>
        </tr>
      );
    })
  )}

                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeNav === 'bookings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Booking Management
                </h1>
                <p className="text-muted-foreground">
                  View and manage all reservations.
                </p>
              </div>

              {loading ? (
  <p className="text-muted-foreground text-sm">Loading bookings…</p>
) : bookings.length === 0 ? (
  <Card className="glass-panel border-border p-8 text-center">
    <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
    <p className="text-muted-foreground">No bookings found yet.</p>
    <p className="text-sm text-muted-foreground mt-2">
      New reservations created on the site will appear here.
    </p>
  </Card>
) : (
  <Card className="glass-panel border-border">
    <CardContent className="p-0">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/60">
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Date
            </th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Time
            </th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Table
            </th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Guest
            </th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Phone
            </th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Seats
            </th>
            <th className="text-left p-4 text-sm font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b.id}
              className="border-b border-border/50 hover:bg-secondary/30"
            >
              <td className="p-4 text-foreground">
                {new Date(b.date).toLocaleDateString()}
              </td>
              <td className="p-4 text-foreground">{b.time}</td>
              <td className="p-4 text-foreground">{b.tableName}</td>
              <td className="p-4 text-foreground">{b.customerName}</td>
              <td className="p-4 text-muted-foreground">{b.customerPhone}</td>
              <td className="p-4 text-muted-foreground">{b.seats}</td>
              <td className="p-4">
                <Badge
                  variant={
                    b.status === "confirmed"
                      ? "default"
                      : b.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {b.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent>
  </Card>
)}

            </motion.div>
          )}

          {activeNav === 'menu' && (
            <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="space-y-8"
>
  <div className="flex items-center justify-between">
    <div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
        Menu Management
      </h1>
      <p className="text-muted-foreground">
        Add, edit, or remove menu items.
      </p>
    </div>
  </div>

  {/* Add item form */}
  <Card className="glass-panel border-border">
    <CardContent className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground"
          placeholder="Name"
          value={menuForm.name}
          onChange={(e) =>
            setMenuForm((f) => ({ ...f, name: e.target.value }))
          }
        />
        <select
  className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground"
  value={menuForm.category}
  onChange={(e) =>
    setMenuForm((f) => ({ ...f, category: e.target.value }))
  }
>
  <option value="">Select category</option> 
  {MENU_CATEGORIES.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>

        <input
          className="bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground"
          placeholder="Price"
          type="number"
          value={menuForm.price}
          onChange={(e) =>
            setMenuForm((f) => ({ ...f, price: e.target.value }))
          }
        />
      </div>
      <textarea
        className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground"
        rows={2}
        placeholder="Description"
        value={menuForm.description}
        onChange={(e) =>
          setMenuForm((f) => ({ ...f, description: e.target.value }))
        }
      />
      <input
        className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground"
        placeholder="Image URL"
        value={menuForm.image}
        onChange={(e) =>
          setMenuForm((f) => ({ ...f, image: e.target.value }))
        }
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={menuForm.isAvailable}
            onChange={(e) =>
              setMenuForm((f) => ({ ...f, isAvailable: e.target.checked }))
            }
          />
          Available
        </label>
        <Button onClick={addMenuItem} className="bg-primary text-primary-foreground gold-glow-sm">
          Add New Item
        </Button>
      </div>
    </CardContent>
  </Card>

  {/* Menu list */}
  <Card className="glass-panel border-border">
    <CardContent className="p-0">
      {menuLoading ? (
        <p className="p-4 text-sm text-muted-foreground">Loading menu…</p>
      ) : menuItems.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No menu items yet.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/60">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Category
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Price
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
  {menuItems.map((m) => {
    const isEditing = editingMenuId === m.id;
    return (
      <tr
        key={m.id}
        className="border-b border-border/50 hover:bg-secondary/30"
      >
        {/* Name */}
        <td className="p-4 text-foreground">
          {isEditing ? (
            <input
              className="w-full bg-secondary border border-border rounded px-2 py-1 text-sm"
              value={m.name}
              onChange={(e) =>
                setMenuItems((prev) =>
                  prev.map((item) =>
                    item.id === m.id ? { ...item, name: e.target.value } : item
                  )
                )
              }
              onBlur={() => updateMenuItem(m.id, { name: m.name })}
            />
          ) : (
            m.name
          )}
        </td>

        {/* Category */}
        <td className="p-4 text-muted-foreground">
          {isEditing ? (
            <select
  className="w-full bg-secondary border border-border rounded px-2 py-1 text-sm"
  value={m.category}
  onChange={(e) => {
    const value = e.target.value;
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === m.id ? { ...item, category: value } : item
      )
    );
    updateMenuItem(m.id, { category: value });
  }}
>
  {MENU_CATEGORIES.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>
          ) : (
            m.category
          )}
        </td>

        {/* Price */}
        <td className="p-4 text-muted-foreground">
          {isEditing ? (
            <input
              type="number"
              className="w-full bg-secondary border border-border rounded px-2 py-1 text-sm"
              value={m.price}
              onChange={(e) => {
                const value = Number(e.target.value);
                setMenuItems((prev) =>
                  prev.map((item) =>
                    item.id === m.id ? { ...item, price: value } : item
                  )
                );
              }}
              onBlur={() => updateMenuItem(m.id, { price: m.price })}
            />
          ) : (
            <>₹{m.price.toFixed(2)}</>
          )}
        </td>

        {/* Status (available / unavailable) */}
        <td className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              updateMenuItem(m.id, { isAvailable: !m.isAvailable })
            }
          >
            <Badge variant={m.isAvailable ? "default" : "secondary"}>
              {m.isAvailable ? "available" : "unavailable"}
            </Badge>
          </Button>
        </td>

        {/* Actions: edit toggle, delete */}
        <td className="p-4 text-right space-x-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              setEditingMenuId(isEditing ? null : m.id)
            }
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => deleteMenuItem(m.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </td>
      </tr>
    );
  })}
</tbody>

        </table>
      )}
    </CardContent>
  </Card>
</motion.div>
          )}

          {activeNav === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Settings
                </h1>
                <p className="text-muted-foreground">
                  Configure your café settings.
                </p>
              </div>

              <Card className="glass-panel border-border p-8 text-center">
                <Settings className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Settings panel will be displayed here.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect to a backend to save settings.
                </p>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
