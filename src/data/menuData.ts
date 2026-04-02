import type { MenuItem } from "@/context/OrderContext"; // ✅ single source of truth

export const categories = [
  { id: 'coffees', name: 'Coffees', icon: '☕' },
  { id: 'drinks', name: 'Drinks', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🥨' },
  { id: 'meals', name: 'Meals', icon: '🍽️' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
];

// export interface MenuItem {
//   id: number;
//   name: string;
//   category: string;
//   price: number;
//   description: string;
//   image?: string;
//   isAvailable: boolean;
// }


export const menuItems: MenuItem[] = [
  // Coffees
  // { id: 1, name: 'Noir Espresso', price: 4.50, category: 'coffees', description: 'Rich, bold single-origin espresso with notes of dark chocolate', image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 2, name: 'Velvet Latte', price: 6.00, category: 'coffees', description: 'Silky smooth latte with house-made vanilla bean syrup', image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 3, name: 'Midnight Mocha', price: 6.50, category: 'coffees', description: 'Dark chocolate meets espresso in this decadent creation', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 4, name: 'Caramel Macchiato', price: 6.25, category: 'coffees', description: 'Espresso marked with steamed milk and buttery caramel', image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 5, name: 'Cold Brew Reserve', price: 5.50, category: 'coffees', description: '24-hour steeped cold brew, smooth and refreshing', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 6, name: 'Affogato', price: 7.00, category: 'coffees', description: 'Hot espresso poured over creamy vanilla gelato', image: 'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=400&h=300&fit=crop', isAvailable: true },
  
  // // Drinks
  // { id: 7, name: 'Golden Chai', price: 5.50, category: 'drinks', description: 'Spiced chai with turmeric and honey', image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 8, name: 'Matcha Dreams', price: 6.00, category: 'drinks', description: 'Ceremonial grade matcha with oat milk', image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 9, name: 'Berry Bliss Smoothie', price: 7.50, category: 'drinks', description: 'Mixed berries, banana, and Greek yogurt', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 10, name: 'Fresh Orange Juice', price: 5.00, category: 'drinks', description: 'Freshly squeezed oranges, no added sugar', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 11, name: 'Sparkling Lemonade', price: 4.50, category: 'drinks', description: 'House-made lemonade with a fizzy twist', image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400&h=300&fit=crop', isAvailable: true           },
  
  // // Snacks
  // { id: 12, name: 'Truffle Fries', price: 9.00, category: 'snacks', description: 'Crispy fries with truffle oil and parmesan', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 13, name: 'Bruschetta Trio', price: 11.00, category: 'snacks', description: 'Three artisan bruschettas with seasonal toppings', image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 14, name: 'Cheese Board', price: 16.00, category: 'snacks', description: 'Selection of fine cheeses with honeycomb and crackers', image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 15, name: 'Hummus Platter', price: 10.00, category: 'snacks', description: 'Creamy hummus with warm pita and vegetables', image: 'https://images.unsplash.com/photo-1637949385162-e416fb15b2fe?w=400&h=300&fit=crop', isAvailable: true },
  
  // // Meals
  // { id: 16, name: 'Noir Burger', price: 18.00, category: 'meals', description: 'Wagyu beef, aged cheddar, caramelized onions, brioche bun', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 17, name: 'Grilled Salmon', price: 24.00, category: 'meals', description: 'Atlantic salmon with asparagus and lemon butter', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 18, name: 'Truffle Risotto', price: 22.00, category: 'meals', description: 'Creamy arborio rice with black truffle shavings', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 19, name: 'Caesar Salad', price: 14.00, category: 'meals', description: 'Crisp romaine, parmesan, croutons, house dressing', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 20, name: 'Pasta Carbonara', price: 17.00, category: 'meals', description: 'Classic carbonara with pancetta and pecorino', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop', isAvailable: true },
  
  // // Desserts
  // { id: 21, name: 'Chocolate Lava Cake', price: 10.00, category: 'desserts', description: 'Warm chocolate cake with molten center', image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 22, name: 'Crème Brûlée', price: 9.00, category: 'desserts', description: 'Vanilla custard with caramelized sugar crust', image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 23, name: 'Tiramisu', price: 9.50, category: 'desserts', description: 'Classic Italian dessert with espresso and mascarpone', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 24, name: 'Cheesecake', price: 8.50, category: 'desserts', description: 'New York style with berry compote', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop', isAvailable: true },
  // { id: 25, name: 'Gelato Selection', price: 7.00, category: 'desserts', description: 'Three scoops of artisan Italian gelato', image: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=400&h=300&fit=crop', isAvailable: true },
];
