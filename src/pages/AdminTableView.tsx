// src/pages/AdminTableView.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TableDoc = { name: string; zone: string; seats: number; status: string };

type MenuDoc = {
  id: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
};

type OrderItem = {
  menuItemId: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type TableOrder = {
  id: string;
  tableId: string;
  tableName: string;
  zone: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
};

const AdminTableView = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();

  const [table, setTable] = useState<TableDoc | null>(null);
  const [tableStatus, setTableStatus] = useState<string | null>(null);

  const [menu, setMenu] = useState<MenuDoc[]>([]);
  const [menuSearch, setMenuSearch] = useState("");

  const [order, setOrder] = useState<TableOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tableId) return;

    // load table + menu once, then subscribe to order
    const load = async () => {
      setLoading(true);
      try {
        // 1) load table
        const tableSnap = await getDoc(doc(db, "tables", tableId));
        if (!tableSnap.exists()) {
          navigate("/admin");
          return;
        }
        const tableData = tableSnap.data() as TableDoc;
        setTable(tableData);
        setTableStatus(tableData.status);

        // 2) load menu
        const menuSnap = await getDocs(collection(db, "menu"));
        setMenu(
          menuSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }))
        );

        // 3) subscribe to existing order for this table (real-time)
        const q = query(
          collection(db, "tableOrders"),
          where("tableId", "==", tableId)
        );
        const unsubscribe = onSnapshot(q, (snap) => {
          if (!snap.empty) {
            const d = snap.docs[0];
            const o = d.data() as any;
            setOrder({
              id: d.id,
              tableId: o.tableId,
              tableName: o.tableName,
              zone: o.zone,
              status: o.status,
              items: o.items || [],
              subtotal: o.subtotal || 0,
            });
          } else {
            setOrder(null);
          }
        });

        setLoading(false);
        return unsubscribe;
      } catch (e) {
        console.error("AdminTableView load error:", e);
        setLoading(false);
      }
    };

    const maybeUnsubPromise = load();

    // in case load returned an unsubscribe
    return () => {
      if (typeof maybeUnsubPromise === "function") {
        maybeUnsubPromise();
      }
    };
  }, [tableId, navigate]);

  const recalcSubtotal = (items: OrderItem[]) =>
    items.reduce((sum, it) => sum + it.totalPrice, 0);

  const addMenuItemToOrder = (m: MenuDoc) => {
    if (!table || !tableId) return;

    if (!order) {
      const items: OrderItem[] = [
        {
          menuItemId: m.id,
          name: m.name,
          category: m.category,
          quantity: 1,
          unitPrice: m.price,
          totalPrice: m.price,
        },
      ];
      setOrder({
        id: "",
        tableId,
        tableName: table.name,
        zone: table.zone,
        status: "open",
        items,
        subtotal: recalcSubtotal(items),
      });
      return;
    }

    const items = [...order.items];
    const idx = items.findIndex((it) => it.menuItemId === m.id);
    if (idx === -1) {
      items.push({
        menuItemId: m.id,
        name: m.name,
        category: m.category,
        quantity: 1,
        unitPrice: m.price,
        totalPrice: m.price,
      });
    } else {
      const it = items[idx];
      const qty = it.quantity + 1;
      items[idx] = { ...it, quantity: qty, totalPrice: qty * it.unitPrice };
    }

    setOrder({ ...order, items, subtotal: recalcSubtotal(items) });
  };

  const saveOrder = async () => {
    if (!order || !tableId) return;
    setSaving(true);
    try {
      if (!order.id) {
        const ref = await addDoc(collection(db, "tableOrders"), {
          tableId,
          tableName: order.tableName,
          zone: order.zone,
          status: order.status,
          items: order.items,
          subtotal: order.subtotal,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setOrder({ ...order, id: ref.id });
      } else {
        await setDoc(
          doc(db, "tableOrders", order.id),
          {
            tableId,
            tableName: order.tableName,
            zone: order.zone,
            status: order.status,
            items: order.items,
            subtotal: order.subtotal,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const markDone = async () => {
    if (!order || !order.id) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "orderHistory"), {
        ...order,
        closedAt: serverTimestamp(),
      });
      await deleteDoc(doc(db, "tableOrders", order.id));
      setOrder(null);
    } finally {
      setSaving(false);
    }
  };

  const updateTableStatus = async (
    status: "available" | "reserved" | "booked"
  ) => {
    if (!tableId) return;
    setTableStatus(status);
    await setDoc(
      doc(db, "tables", tableId),
      { status },
      { merge: true }
    );
  };

  if (loading || !table) {
    return (
      <div className="min-h-screen bg-background pt-20 p-8 text-muted-foreground">
        Loading table..
      </div>
    );
  }

  const filteredMenu = menu
    .filter((m) => m.isAvailable)
    .filter((m) => {
      const q = menuSearch.toLowerCase();
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    });

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto p-6 space-y-6">
        <Button variant="outline" onClick={() => navigate("/admin?tab=tables")}>
          ← Back to Tables
        </Button>

        <Card className="glass-panel border-border">
          <CardHeader>
            <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Table {table.name} · {table.zone} · {table.seats} seats
              </span>

              <div className="flex flex-wrap items-center gap-3">
                {/* Table status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Table status:
                  </span>
                  <Badge variant="outline">
                    {tableStatus ?? "unknown"}
                  </Badge>
                </div>

                {/* Quick status buttons */}
                <div className="flex gap-1">
                  <Button
                    // size="xs"
                    variant={
                      tableStatus === "available" ? "default" : "outline"
                    }
                    onClick={() => updateTableStatus("available")}
                  >
                    Available
                  </Button>
                  <Button
                    // size="xs"
                    variant={
                      tableStatus === "reserved" ? "default" : "outline"
                    }
                    onClick={() => updateTableStatus("reserved")}
                  >
                    Reserved
                  </Button>
                  <Button
                    // size="xs"
                    variant={tableStatus === "booked" ? "default" : "outline"}
                    onClick={() => updateTableStatus("booked")}
                  >
                    Booked
                  </Button>
                </div>

                {/* Order status */}
                {order ? (
                  <Badge variant="default">{order.status}</Badge>
                ) : (
                  <Badge variant="secondary">No active order</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current order */}
            <div className="space-y-4">
              <h3 className="font-semibold">Current order</h3>
              {order && order.items.length > 0 ? (
                <>
                  <ul className="space-y-2 text-sm">
                    {order.items.map((it) => (
                      <li
                        key={it.menuItemId}
                        className="flex justify-between"
                      >
                        <span>
                          {it.name} × {it.quantity}
                        </span>
                        <span>₹{it.totalPrice.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between font-semibold mt-2">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button size="sm" onClick={saveOrder} disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={markDone}
                      disabled={saving}
                    >
                      Mark as done
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No items yet. Add items from the menu on the right.
                </p>
              )}
            </div>

            {/* Menu list */}
            <div className="space-y-4">
              <h3 className="font-semibold">Add items from menu</h3>

              <input
                className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground"
                placeholder="Search menu items..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
              />

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredMenu.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-1">
                    No menu items match this search.
                  </p>
                ) : (
                  filteredMenu.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between border border-border rounded px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{m.price.toFixed(2)} · {m.category}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addMenuItemToOrder(m)}
                      >
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTableView;
