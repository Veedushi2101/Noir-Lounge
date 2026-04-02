import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { collection, getDocs, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserBooking {
  id: string;
  tableName: string;
  zone: string;
  seats: number;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
  customerName: string;
}

const Profile = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
  if (!user?.uid) return;

  const q = query(
    collection(db, "bookings"),
    where("userId", "==", user.uid),
    orderBy("date", "desc")
  );

  const unsub = onSnapshot(q, (snapshot) => {
    const data: UserBooking[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    })) as UserBooking[];
    setBookings(data);
    setLoadingBookings(false);
  });

  return () => unsub();
}, [user?.uid]);


  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please login to view profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="glass-panel p-8 mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
              My Profile
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome back, {user.email?.split("@")[0]}!
            </p>
            {isAdmin && (
              <Badge className="mt-2 bg-primary text-primary-foreground">
                Admin
              </Badge>
            )}
          </div>
          <Button onClick={handleLogout} variant="outline" size="lg">
            Logout
          </Button>
        </div>

        {/* Account Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-panel p-6">
            <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
              Account Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs">{user.uid}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Summary */}
          <div className="glass-panel p-6">
            <h2 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
              Booking Summary
            </h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{bookings.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-status-available">
                  {bookings.filter(b => b.status === "confirmed").length}
                </p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="glass-panel p-6">
          <h2 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2">
            Recent Bookings
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </h2>
          
          {loadingBookings ? (
            <div className="flex justify-center py-12">
              <p className="text-muted-foreground">Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings yet. Make your first reservation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/50 transition">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{booking.tableName}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {booking.date} • {booking.time}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={booking.status === "confirmed" ? "default" : "secondary"}
                    className={
                      booking.status === "confirmed" 
                        ? "bg-status-available text-status-available" 
                        : "bg-status-reserved text-status-reserved"
                    }
                  >
                    {booking.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
