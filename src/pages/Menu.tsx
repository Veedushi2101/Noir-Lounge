import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { OrderSidebar } from "@/components/menu/OrderSidebar";
import { menuItems, categories } from "@/data/menuData";
import { useOrder } from "@/context/OrderContext";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { onSnapshot, collection } from "firebase/firestore"; 
import type { MenuItem } from "@/context/OrderContext";

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("coffees");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { itemCount, total } = useOrder();
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [loading, setLoading] = useState(true);

  const filteredItems = items.filter(
    (item) => item.category === selectedCategory
  );

 useEffect(() => {
  setLoading(true);
  
  const unsub = onSnapshot(collection(db, "menu"), (snap) => {
    const data: MenuItem[] = snap.docs.map((doc, index) => {
      const d = doc.data() as any;
      return {
        id: parseInt(doc.id) || index + 1,  // ✅ string → number
        name: d.name,
        category: d.category,
        price: d.price,
        description: d.description,
        image: d.image ?? "",
        isAvailable: d.isAvailable ?? true,
      };
    });
    setItems(data);
    setLoading(false);
  });
  
  return () => unsub();
}, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="flex">
        
        {/* MAIN CONTENT */}
        <div className="flex-1 px-4 lg:pr-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our <span className="text-gradient-gold">Menu</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our carefully curated selection of premium coffees,
              delicious meals, and decadent desserts.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "transition-all text-base",
                  selectedCategory === category.id && "gold-glow-sm"
                )}
              >
                {category.name}
              </Button>
            ))}
          </motion.div>

          {/* Menu Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredItems.map((item, index) => (
                <MenuItemCard key={item.id} item={item} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DESKTOP SIDEBAR (always visible) */}
        <div className="hidden lg:block lg:w-[360px] flex-none">
          <OrderSidebar isOpen={true} onClose={() => {}} />
        </div>

        {/* MOBILE SIDEBAR */}
        <div className="lg:hidden">
          <AnimatePresence>
            <OrderSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* MOBILE FLOATING BUTTON */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 lg:hidden z-40"
          >
            <Button
              onClick={() => setIsSidebarOpen(true)}
              className="w-full bg-primary text-primary-foreground gold-glow py-6"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              View Order ({itemCount}) - ${total.toFixed(2)}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
