import { motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder, MenuItem } from "@/context/OrderContext";
import { useState } from "react";

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
}

export const MenuItemCard = ({ item, index }: MenuItemCardProps) => {
  const { addItem, items } = useOrder();
  const [justAdded, setJustAdded] = useState(false);

  const quantityInCart = items.find((i) => i.id === item.id)?.quantity || 0;

  const handleAdd = () => {
    if (!item.isAvailable) return; // prevent adding unavailable items
    addItem(item);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className={`glass-panel overflow-hidden group ${
        !item.isAvailable ? "opacity-70" : ""
      }`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

        {/* Price Tag */}
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold gold-glow-sm">
          ${item.price.toFixed(2)}
        </div>

        {/* Quantity Badge */}
        {quantityInCart > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 left-3 w-7 h-7 bg-status-available text-background rounded-full flex items-center justify-center text-sm font-bold"
          >
            {quantityInCart}
          </motion.div>
        )}

        {/* Availability badge */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.isAvailable
                ? "bg-status-available/90 text-background"
                : "bg-status-booked/90 text-background"
            }`}
          >
            {item.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
          {item.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {item.description}
        </p>

        <Button
          onClick={handleAdd}
          disabled={!item.isAvailable}
          className={`w-full transition-all duration-300 ${
            !item.isAvailable
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : justAdded
              ? "bg-status-available text-background"
              : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
          }`}
        >
          {item.isAvailable ? (
            justAdded ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Added!
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add to Order
              </span>
            )
          ) : (
            <span className="flex items-center gap-2">Not available</span>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
