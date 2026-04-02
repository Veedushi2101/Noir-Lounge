# Noir Lounge – Café Booking & Admin System

Noir Lounge is a full-stack café booking application that allows users to reserve tables online and provides an admin dashboard to manage bookings, tables, and menu items in real time. The system is designed for scalability, real-time updates, and efficient data handling.

---

## Tech Stack

* Frontend: React, TypeScript, Vite
* Styling: Tailwind CSS, shadcn/ui
* Routing: React Router v6
* Backend/Database: Firebase Firestore
* Deployment: Vercel

---

## Features

### User Side

* Online table booking system
* Real-time table availability
* Booking confirmation flow
* Menu browsing interface

### Admin Dashboard

* View and manage bookings
* Update booking status (pending, confirmed, cancelled)
* Manage tables (available, reserved, booked)
* Add, edit, and delete menu items
* Dashboard analytics with daily trend comparison

---

## Project Structure

```
src/
├── components/
├── pages/
├── context/
├── lib/
├── App.tsx
└── main.tsx
```

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher)
* Firebase project with Firestore enabled

### Installation

```
npm install
npm run dev
```

Application runs at:

```
http://localhost:5173
```

---

## Firebase Configuration

### Collections

#### tables

```
{
  "name": "M1",
  "zone": "main",
  "seats": 4,
  "status": "available"
}
```

#### bookings

```
{
  "tableId": "id",
  "tableName": "M1",
  "zone": "Main Hall",
  "seats": 4,
  "customerName": "John",
  "customerPhone": "1234567890",
  "date": "ISO string",
  "time": "8:30 PM",
  "status": "pending",
  "createdAt": "timestamp"
}
```

#### menu

```
{
  "name": "Cold Coffee",
  "category": "Beverages",
  "price": 150,
  "description": "Refreshing drink",
  "image": "url",
  "isAvailable": true
}
```

---

## Dashboard Logic

* Total Bookings Today: Count of bookings matching today’s date
* Guests Expected: Sum of seats excluding cancelled bookings
* Available Tables: Count of tables with status "available"
* Trends: Percentage comparison between today and yesterday

---

## Booking Flow

1. User selects a table
2. Booking modal collects user details
3. Data is stored in Firestore
4. User is redirected to confirmation page

---

## Admin Functionalities

* Update booking status in real time
* Modify table availability
* Perform CRUD operations on menu items
* Live updates using Firestore listeners

---

## Deployment

```
npm run build
```

* Output directory: dist/
* Can be deployed on Vercel, Netlify, or Firebase Hosting

---

## Security Note

Development rules currently allow full access:

```
allow read, write: if true;
```

Before production:

* Implement authentication
* Restrict write access to admin users

---

## Future Improvements

* Admin authentication system
* Booking conflict handling
* Payment integration
* Advanced analytics and reporting

---
