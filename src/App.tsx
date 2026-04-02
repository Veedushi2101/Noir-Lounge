import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "@/context/BookingContext";
import { OrderProvider } from "@/context/OrderContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Index from "./pages/Index";
import TableBooking from "./pages/TableBooking";
import Menu from "./pages/Menu";
import BookingConfirmation from "./pages/BookingConfirmation";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminRoute from "@/routes/AdminRoute";
import AuthPage from "./pages/Auth";
import Profile from "./pages/Profile.tsx";  // 🔹 ADD THIS
import AdminTableView from "./pages/AdminTableView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BookingProvider>
        <OrderProvider>
           <AuthProvider> 
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
  <Route path="/" element={<Index />} />
  <Route path="/book" element={<TableBooking />} />
  <Route path="/menu" element={<Menu />} />
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/confirmation" element={<BookingConfirmation />} />
  {/* Admin routes */}
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/admin/tables/:tableId" element={<AdminTableView />} />

  <Route path="*" element={<NotFound />} />
</Routes>
            <Footer />
          </BrowserRouter>
          </AuthProvider>
        </OrderProvider>
      </BookingProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
