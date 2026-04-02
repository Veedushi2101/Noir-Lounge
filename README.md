To show real “trend” values you need stats for today and yesterday, then compare them.

1) Compute “today” and “yesterday” strings
Right above where you compute stats:

ts
const today = new Date();
const todayISO = today.toISOString().slice(0, 10); // "YYYY-MM-DD"

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayISO = yesterday.toISOString().slice(0, 10);
2) Get counts for today and yesterday
ts
const bookingsToday = bookings.filter(
  (b) => b.date.slice(0, 10) === todayISO
);
const bookingsYesterday = bookings.filter(
  (b) => b.date.slice(0, 10) === yesterdayISO
);

const totalBookingsToday = bookingsToday.length;
const totalBookingsYesterday = bookingsYesterday.length;

const guestsToday = bookingsToday
  .filter((b) => b.status !== "cancelled")
  .reduce((sum, b) => sum + b.seats, 0);

const guestsYesterday = bookingsYesterday
  .filter((b) => b.status !== "cancelled")
  .reduce((sum, b) => sum + b.seats, 0);
3) Helper to format the trend string
ts
const getTrend = (todayValue: number, yesterdayValue: number) => {
  if (yesterdayValue === 0) return null; // no trend if no data yesterday
  const diff = ((todayValue - yesterdayValue) / yesterdayValue) * 100;
  const rounded = Math.round(diff);
  if (rounded === 0) return "0%";
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
};
4) Build stats with real trends
ts
const stats = [
  {
    label: "Total Bookings Today",
    value: String(totalBookingsToday),
    icon: Calendar,
    trend: getTrend(totalBookingsToday, totalBookingsYesterday),
  },
  {
    label: "Available Tables",
    value: String(
      tablesData.filter((t) => t.status === "available").length
    ),
    icon: Table,
    trend: null, // usually no trend for this
  },
  {
    label: "Guests Expected",
    value: String(guestsToday),
    icon: Users,
    trend: getTrend(guestsToday, guestsYesterday),
  },
  {
    label: "Avg. Duration",
    value: "1.5h",
    icon: Clock,
    trend: null, // until you track duration
  },
];
Because your JSX already checks stat.trend and shows green for + and red for -, these trend strings (“+12%”, “-5%”, etc.) will now be calculated from real bookings data.



Here is a README you can drop into `README.md` (replace the old content). It explains setup, Firebase config, and how each feature works.

***

# Noir Lounge – Café Booking & Admin Panel

Noir Lounge is a full‑stack café booking experience built with React, TypeScript, Vite, Tailwind, shadcn‑ui, and Firebase Firestore. It lets guests book tables online and gives admins a dashboard to manage tables, bookings, and menu items.[1][2]

## Tech stack

- React + TypeScript + Vite (frontend)[2]
- Tailwind CSS + shadcn‑ui components for UI[3]
- React Router v6 for routing (`/`, `/book`, `/menu`, `/confirmation`, `/admin`)[2]
- Firebase Firestore for tables, bookings, and menu data[4][1]

***

## 1. Getting started

### Prerequisites

- Node.js 18+ and npm installed[5]
- A Firebase project with Firestore enabled[6]

### Install and run

```bash
# install dependencies
npm install

# start dev server
npm run dev
```

The app runs on `http://localhost:5173` by default (Vite).

***

## 2. Firebase setup

### 2.1. Firestore collections

Create these collections in Firestore:

1. `tables` – one document per table:
   - `name` (string) – e.g. `"M2"`
   - `zone` (string) – e.g. `"main"`; mapped to display name via `getZoneName`[7]
   - `seats` (number)
   - `status` (string: `"available" | "reserved" | "booked"`)

2. `bookings` – one document per reservation:
   - `tableId` (string)
   - `tableName` (string)
   - `zone` (string, display name)
   - `seats` (number)
   - `customerName` (string)
   - `customerPhone` (string)
   - `date` (ISO string, from `date.toISOString()`)[4]
   - `time` (string, e.g. `"8:30 PM"`)
   - `status` (string: `"pending" | "confirmed" | "cancelled"`)
   - `createdAt` (serverTimestamp)

3. `menu` – one document per menu item:
   - `name` (string)
   - `category` (string, one of `"Coffees" | "Teas" | "Mocktails" | "Cold Brews" | "Desserts" | "Snacks" | "Breakfast" | "Mains"`)[1]
   - `price` (number)
   - `description` (string)
   - `image` (string URL, optional)
   - `isAvailable` (boolean)

### 2.2. Security rules (dev mode)

For development, use rules that allow full read/write on these collections:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /tables/{document} {
      allow read, write: if true;
    }

    match /menu/{document} {
      allow read, write: if true;
    }

    match /bookings/{bookingId} {
      allow read, write: if true;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Do not ship these rules to production; add auth and proper checks before going live.[8][9]

***

## 3. App structure

### 3.1. Routing

`App.tsx` wires providers, router, navbar, and footer:

- `/` → `Index` – marketing / landing page  
- `/book` → `TableBooking` – user picks a table and time  
- `/menu` → `Menu` – public menu view  
- `/confirmation` → `BookingConfirmation` – shown after booking  
- `/admin` → `AdminDashboard` – internal admin panel

### 3.2. Booking flow (guest side)

Files: `TableBooking.tsx`, `FloorPlan.tsx`, `TableCard.tsx`, `BookingModal.tsx`, `BookingContext.tsx`.[10][11][12][8][4]

1. Guest selects a table from the floor plan.  
2. `BookingModal` opens and collects name, phone, date, and time.[4]
3. On submit (`handleSubmit` in `BookingModal.tsx`):
   - Validates fields.
   - Writes a new document into `bookings` with `addDoc(collection(db, "bookings"), bookingData)`.  
   - Optionally updates the matching `tables` document to `status: "booked"`.  
   - Stores booking details in `BookingContext` and navigates to `/confirmation`.[4]

4. `BookingConfirmation` reads from `BookingContext` and shows a success screen.[13]

***

## 4. Admin Dashboard

File: `AdminDashboard.tsx`.[1]

### 4.1. Data loading

On mount, `useEffect` loads:

- All `bookings`, ordered by `date`.[1]
- All `tables`.[1]
- All `menu` items.[1]

### 4.2. Derived dashboard stats

After data loads, stats are computed:

- `Total Bookings Today` = count of bookings whose `date` matches today’s date (ISO prefix).[1]
- `Available Tables` = number of tables with `status === "available"`.  
- `Guests Expected` = sum of `seats` for today’s non‑cancelled bookings.  
- Optional “trend” percentages compare today vs. yesterday using a helper.[14]

These are rendered in the Overview stat cards.

### 4.3. Recent Booking Requests

- Shows the first few `bookings`, newest first.  
- For each pending booking, admin can:
  - Click the green check to mark `status = "confirmed"`.  
  - Click the red X to mark `status = "cancelled"`.  
- This calls `updateBookingStatus`, which updates Firestore and local state.[1]

### 4.4. Table Management

- Lists all documents from `tables` with name, zone, seats, and status.  
- By default shows only the `StatusBadge`.  
- When admin clicks the edit icon on a row, a status `<select>` appears for that row only, letting them switch between `"available"`, `"reserved"`, and `"booked"`.  
- Changes call `updateTableStatus`, which updates the `tables` document.[1]

### 4.5. Booking Management

- Shows a full bookings table pulled from Firestore.  
- Used for viewing, not editing (status is edited via Overview or custom actions).[1]

### 4.6. Menu Management

- Top card: **Add New Item** form.
  - Name input.
  - Category `<select>` (`MENU_CATEGORIES` constant).
  - Price, description, image URL, and available checkbox.
  - On submit, calls `addMenuItem` (writes to `menu` and updates state).[1]

- Bottom card: **Menu list** table.
  - Each row supports:
    - Edit icon: toggles inline edit mode for name, category, and price.
    - Status button: toggles `isAvailable` between available / unavailable.
    - Delete icon: removes the item from Firestore via `deleteMenuItem`.[1]

***

## 5. Styling and layout

- Global styles in `index.css` and `App.css` set dark theme, fonts, and utility classes like `glass-panel` and `gold-glow`.[15][16]
- Admin layout:
  - Sidebar on the left (`motion.aside`), now `sticky top-20` so it doesn’t overlap the footer.[1]
  - Main content on the right (`flex-1 p-8`).  

Navbar and Footer are shared across all routes and defined in `Navbar.tsx` and `Footer.tsx`.[17][18]

***

## 6. Typical workflows

### Run locally

```bash
npm install
npm run dev
```

### Add a new table

1. In Firestore → `tables`, create a document (auto‑ID).  
2. Set the fields: `name`, `zone`, `seats`, `status: "available"`.  
3. It appears on the Admin **Tables** page and in the booking floor plan (if `tableData` is aligned with Firestore).[7]

### Test a booking end‑to‑end

1. Go to `/book`.  
2. Choose a table and fill out the booking modal.  
3. Confirm; check Firestore → `bookings` for the new document.  
4. Go to `/admin`:
   - See the new booking in Overview and Bookings tab.
   - Status updates work via buttons and update Firestore.

### Manage menu

1. Open `/admin` → Menu.  
2. Add or edit items using the form and inline editor.  
3. Check `menu` collection in Firestore to confirm data.

***

## 7. Deployment notes

- Build with `npm run build`; Vite outputs to `dist/`.[5]
- Host static files (Netlify, Vercel, Firebase Hosting, etc.).  
- Ensure production Firestore rules restrict writes to authenticated admin users before going live.[9]

***

This README should be enough for someone else (or future you) to set up the project, understand how tables/bookings/menu are wired to Firestore, and extend the admin features.

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/109314184/f4604347-6298-4fcc-8e37-6cc1561cdcc9/AdminDashboard.tsx)
[2](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/null-value)
[3](https://community.flutterflow.io/ask-the-community/post/cannot-write-or-create-empty-list-of-custom-data-types-into-firestore-qj98E8nfLZ3FNi0)
[4](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/109314184/68358986-0990-469d-91bc-d99e98c94de4/BookingModal.tsx)
[5](https://dev.to/fonyuygita/firebase-firestore-in-react-storing-and-retrieving-user-data-36g6)
[6](https://firebase.google.com/docs/firestore/query-data/get-data)
[7](https://tjaddison.com/blog/2019/07/allowing-only-specified-users-to-access-cloud-firestore/)
[8](https://firebase.google.com/docs/firestore/security/get-started)
[9](https://docs.cloud.google.com/firestore/native/docs/security/insecure-rules)
[10](https://firebase.google.com/docs/firestore/manage-data/data-types)
[11](https://www.ayrshare.com/how-to-query-for-non-existent-fields-in-firestore/)
[12](https://stackoverflow.com/questions/61035743/allow-read-access-to-one-specific-collection-in-firebase-firestore)
[13](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
[14](https://firebase.google.com/docs/firestore/query-data/aggregation-queries)
[15](https://firebase.blog/posts/2014/04/best-practices-arrays-in-firebase/)
[16](https://github.com/n8n-io/n8n/issues/11413)
[17](https://fireship.io/snippets/firestore-rules-recipes/)
[18](https://docs.cloud.google.com/firestore/native/docs/query-data/get-data)
[19](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/109314184/8af72d4d-ab2b-43f5-9968-36a1429a2ade/README.md)