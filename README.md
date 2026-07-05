# Restaurant Reservation System

A complete MERN stack web application for managing restaurant table reservations. Built in accordance with the intern assignment requirements.

## Features

- **Authentication**: JWT-based login and registration with bcrypt hashed passwords.
- **Customer Portal**:
  - View personal upcoming and historical reservations.
  - Book a table by selecting a date, predefined time slot, and guest count.
  - Automatic, optimized table assignment preventing double bookings and capacity issues.
  - Soft cancel own reservations.
- **Admin Portal**:
  - View all reservations system-wide.
  - Filter reservations by specific dates.
  - Soft cancel any reservation.

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB server)

### 1. Database Setup
1. Create a MongoDB database.
2. Obtain the connection string URI.

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Run the database seeder to populate tables and an admin user (optional, you can register and manually change role to admin in DB):
```bash
node seeder.js
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```
VITE_API_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm run dev
```

## Assumptions & Design Decisions
- **Single Restaurant**: The system assumes a single physical location.
- **Fixed Tables**: The restaurant layout (table count and capacities) is fixed. It is seeded directly into the database.
- **Time Slots**: Reservations are booked in predefined 1-hour slots (e.g., 18:00-19:00) rather than arbitrary start/end times.
- **Soft Deletes**: Cancellations simply flip the reservation `status` to `cancelled` rather than deleting the document, preserving audit history.

## Reservation Logic
The system uses an automated assignment algorithm:
1. Validates the input (date is not in the past, guests > 0, guests <= max restaurant capacity).
2. Queries all tables, sorting them by capacity (smallest to largest) to optimize seating efficiency.
3. Filters out tables that cannot fit the requested party size.
4. Queries existing `confirmed` reservations for the exact requested date and time slot to identify booked tables.
5. Assigns the first table from the sorted list that is not already booked.

## Role-Based Access
- **Customer**: Default role upon registration. Can create reservations and view/cancel their own reservations.
- **Admin**: Can view all reservations across the system, filter them, and cancel any reservation. An admin account can be set by manually modifying the `role` field in the database.

## Limitations
- **No Real-Time Updates**: The frontend requires a page refresh or manual interaction to see new reservations made by other users.
- **No Email Confirmations**: The system does not send confirmation emails upon booking.
- **Fixed Duration**: All reservations are exactly one time slot long.

## Future Improvements
- **Interactive Floor Plan**: A visual UI for admins to see table status in real-time.
- **Custom Reservation Durations**: Allow customers to book back-to-back slots.
- **Email/SMS Notifications**: Send reminders to customers before their reservation.
