# TICKET ISSUING SYSTEM (v2.0 — Admin & User Modes)
> A Complete, Clean, and Functional Full-Stack Database Management System (DBMS) College Project.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@ticket.com` | `admin123` | Full system control, route CRUD, user roles, system logs |
| **USER** | `rahul@gmail.com` | `user123` | Personal ticket booking, view own tickets, ticket cancellation |

*(Note: Passwords in MySQL database are hashed using **bcrypt**)*

---

## 📌 Project Features

### 🛡️ 1. ADMIN MODE
- **System Dashboard**: View total registered users, total passengers, total system tickets, active tickets, cancelled tickets, and total active revenue.
- **Route Management**: Add, edit, and delete transport routes (Source, Destination, Fare) with foreign-key dependency protection.
- **User Account Management**: View all registered users, toggle user roles (`ADMIN` ↔ `USER`), and delete user accounts (with last-admin protection).
- **Passenger Records**: View master passenger directory.
- **Global Ticket Log**: Audit all tickets across all passengers with admin cancellation authority.
- **Financial Payment Logs**: View payment transactions and refund statuses.

### 👤 2. USER MODE
- **User Dashboard**: Personal greeting ("Welcome, [User Name]"), personal booking metrics (total bookings, active, cancelled, total spent).
- **Book Ticket**: Passenger name and phone are **automatically pre-filled** from the logged-in user profile. Select route, ticket category, quantity, and payment method with live fare calculation (`Unit Fare × Quantity`).
- **My Tickets**: View **ONLY** tickets belonging to the logged-in user account.
- **Ticket Cancellation**: Users can cancel their **OWN** active tickets. Cancellation updates ticket status to `CANCELLED` and payment status to `REFUNDED` (no physical row deletion, preserving DBMS audit history).
- **Printable Receipt**: Official transport voucher with browser printing support (`window.print()`).

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite) + Plain CSS
- **Backend**: Node.js + Express.js
- **Database**: MySQL (`mysql2/promise` with transactions) + SQLite automatic fallback mode
- **Security**: JWT (JSON Web Tokens) + `bcryptjs` password hashing

---

## 🗄️ Database Architecture & Tables

### 1. `users`
- `user_id` (INT PRIMARY KEY AUTO_INCREMENT)
- `name` (VARCHAR(100) NOT NULL)
- `email` (VARCHAR(150) UNIQUE NOT NULL)
- `phone` (VARCHAR(15))
- `password` (VARCHAR(255) NOT NULL — bcrypt hash)
- `role` (ENUM('ADMIN', 'USER') DEFAULT 'USER')
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 2. `passengers`
- `passenger_id` (INT PRIMARY KEY AUTO_INCREMENT)
- `name` (VARCHAR(100) NOT NULL)
- `phone` (VARCHAR(15))

### 3. `routes`
- `route_id` (INT PRIMARY KEY AUTO_INCREMENT)
- `source` (VARCHAR(100) NOT NULL)
- `destination` (VARCHAR(100) NOT NULL)
- `fare` (DECIMAL(10,2) NOT NULL)

### 4. `tickets`
- `ticket_id` (INT PRIMARY KEY AUTO_INCREMENT)
- `passenger_id` (INT, FK ➔ passengers)
- `user_id` (INT NULL, FK ➔ users)
- `route_id` (INT, FK ➔ routes)
- `ticket_type` (VARCHAR(30) NOT NULL)
- `quantity` (INT NOT NULL)
- `total_amount` (DECIMAL(10,2) NOT NULL)
- `status` (ENUM('BOOKED', 'CANCELLED') DEFAULT 'BOOKED')
- `issue_date` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### 5. `payments`
- `payment_id` (INT PRIMARY KEY AUTO_INCREMENT)
- `ticket_id` (INT, FK ➔ tickets)
- `payment_method` (VARCHAR(30) NOT NULL)
- `amount` (DECIMAL(10,2) NOT NULL)
- `payment_status` (VARCHAR(30) DEFAULT 'PAID')

---

## 🔗 ER Relationship Explanation (For Viva)
- **USER 1 ➔ M TICKETS**: One registered user account can book multiple tickets over time.
- **PASSENGER 1 ➔ M TICKETS**: One passenger record can be linked to multiple tickets.
- **ROUTE 1 ➔ M TICKETS**: One route can be booked on multiple tickets.
- **TICKET 1 ➔ 1 PAYMENT**: Each issued ticket has exactly one payment transaction record.

---

## 📡 API Endpoints & Security

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new account (Always `USER` role) |
| `POST` | `/api/auth/login` | Public | Authenticate & return JWT token |
| `GET` | `/api/auth/me` | Auth User | Fetch logged-in user profile |
| `GET` | `/api/user/dashboard` | Auth User | User-specific statistics |
| `GET` | `/api/user/tickets` | Auth User | Returns ONLY tickets of logged-in user |
| `POST` | `/api/tickets` | Optional Auth | Issue ticket (MySQL Transaction) |
| `GET` | `/api/tickets/:id` | Auth User/Admin | Fetch ticket details (Enforces user ownership) |
| `PUT` | `/api/tickets/:id/cancel` | Auth User/Admin | Cancel ticket (User can only cancel own ticket) |
| `GET` | `/api/admin/dashboard` | Admin Only | Global system statistics |
| `GET` | `/api/admin/routes` | Admin Only | View all routes |
| `POST` | `/api/admin/routes` | Admin Only | Create new route |
| `PUT` | `/api/admin/routes/:id` | Admin Only | Edit route |
| `DELETE`| `/api/admin/routes/:id` | Admin Only | Delete route |
| `GET` | `/api/admin/users` | Admin Only | View registered users |
| `PUT` | `/api/admin/users/:id/role`| Admin Only | Change user role |
| `DELETE`| `/api/admin/users/:id` | Admin Only | Delete user account |
| `GET` | `/api/admin/passengers` | Admin Only | View passenger directory |
| `GET` | `/api/admin/tickets` | Admin Only | View all system tickets |
| `GET` | `/api/admin/payments` | Admin Only | View all financial payment records |

---

## 🚀 How to Run

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5174/` or `http://localhost:5173/` in your browser.
