import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrder } from "@/context/OrderContext";
import { cn } from "@/lib/utils";

interface OrderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderSidebar = ({ isOpen, onClose }: OrderSidebarProps) => {
  const { items, updateQuantity, removeItem, total, clearOrder } = useOrder();
  const hasItems = items.length > 0;

  return (
    <>
      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          // MOBILE — fixed slide-in drawer
          "fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 lg:hidden",

          // DESKTOP — static, NEVER leaves layout, fixed height
          "lg:static lg:block lg:w-[360px] lg:h-[calc(100vh-6rem)] lg:bg-card lg:border-l lg:border-border lg:z-0 lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* HEADER */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    Your Order
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasItems && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearOrder}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                {/* MOBILE CLOSE BUTTON */}
                <button
                  className="lg:hidden w-8 h-8 rounded-full border border-border flex items-center justify-center"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ORDER LIST */}
          <ScrollArea className="flex-1 p-6 overflow-y-auto">
            {hasItems ? (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-3 rounded-lg bg-secondary/50"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {item.name}
                        </h4>
                        <p className="text-primary font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-7 h-7"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>

                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="w-7 h-7"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 ml-auto text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Your order is empty</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Add items from the menu to get started
                </p>
              </div>
            )}
          </ScrollArea>

          {/* FOOTER */}
          {hasItems && (
            <div className="p-6 border-t border-border space-y-4 bg-card">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="text-foreground font-medium">
                  ${(total * 0.1).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-lg pt-2 border-t border-border">
                <span className="font-serif font-semibold text-foreground">
                  Total
                </span>
                <span className="font-serif font-bold text-primary">
                  ${(total * 1.1).toFixed(2)}
                </span>
              </div>

              <Link to="/book">
                <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 gold-glow-sm">
                  Book Table & Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
};
