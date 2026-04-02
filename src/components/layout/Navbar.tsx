import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Coffee, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/context/OrderContext";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/book", label: "Book a Table" },
  { path: "/menu", label: "Menu" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useOrder();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center gold-glow-sm"
            >
              <Coffee className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="font-serif text-2xl font-semibold text-gradient-gold">
              Noir Lounge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const target = link.path === "/book" && !user ? "/auth" : link.path;

              return (
                <Link
                  key={link.path}
                  to={target}
                  className={cn(
                    "relative text-sm font-medium transition-colors duration-300",
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {/* Admin link (desktop) */}
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "relative text-sm font-medium transition-colors duration-300",
                  location.pathname === "/admin"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Admin
                {location.pathname === "/admin" && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link to="/menu" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>
            </Link>

            {/* Profile or Login Button - DESKTOP */}
            {user ? (
              <div className="hidden md:block">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-border/60 bg-background/60 hover:bg-background hover:border-primary/80 transition-all group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium hidden lg:block">
                    {user.email?.split("@")[0] || "Profile"}
                  </span>
                </Link>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button className="gold-glow-sm bg-primary text-primary-foreground hover:bg-primary/90">
                  Signup / Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {navLinks.map((link, index) => {
                const target =
                  link.path === "/book" && !user ? "/auth" : link.path;

                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={target}
                      className={cn(
                        "block py-2 text-lg font-medium transition-colors",
                        location.pathname === link.path
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Admin link (mobile) */}
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <Link
                    to="/admin"
                    className={cn(
                      "block py-2 text-lg font-medium transition-colors",
                      location.pathname === "/admin"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    Admin
                  </Link>
                </motion.div>
              )}

              {/* Mobile Profile or Login */}
              {user ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="pt-2 border-t border-border/60 mt-4 space-y-3">
                    <p className="text-xs text-muted-foreground px-2">
                      Hi, {user.email?.split("@")[0]}
                    </p>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted transition"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">My Profile</span>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:bg-destructive/10"
                      onClick={async () => {
                        await logout();
                        navigate("/");
                        setIsOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link to="/auth">
                    <Button className="w-full mt-4 gold-glow-sm bg-primary text-primary-foreground">
                      Signup / Login
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
