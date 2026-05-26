# StayEZ — Mini Airbnb System

> CMSC 121 Final Project | University of the Philippines Manila
> **Presented on:** May 27, 2026, 10–12nn

---

## Overview

a simplified Airbnb-like web application. The system
will simulate a real-world booking platform where users can list properties, search and filter
listings, and manage bookings

---

## Team Members

| Name | Role |
|------|------|
| (Arca, Rome) | |
| (Bautista, Malcolm) | |
| (De Leon, Chris) | |
| (Rites, Mark) | Fullstack developer |

---

## Running instructions

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

```bash
# 0. Clone the repository and cd to the project directory
git clone https://github.com/MGR-CS/CMSC-121-Lab-Final-Project-StayEZ-Mini-Airbnb-System-.git
cd CMSC-121-Lab-Final-Project-StayEZ-Mini-Airbnb-System-

# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Project Structure

```
/
├── server/
│   ├── server.js               # Express entry point
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   ├── User.js             # User schema (guest / host / admin)
│   │   ├── Listing.js          # Listing schema
│   │   └── Booking.js          # Booking schema
│   ├── routes/
│   │   ├── auth.js             # POST /api/auth/register, /login
│   │   ├── listings.js         # CRUD for listings + search/filter/sort
│   │   └── bookings.js         # Booking creation + status management
│   └── middleware/
│       └── auth.js             # JWT protect + role-based authorize
├── public/
│   ├── index.html              # Landing Page - Login / Register (public)
│   ├── css/style.css           # Global stylesheet
│   ├── js/api.js               # Shared fetch helper + session utils
    ├── js/common.js            # Manages shared front-end UI features
│   ├── guest/
│   │   ├── browse.html         # Browse listings with search/filter/sort
│   │   ├── booking.html        # Book a listing (date range input)
│   │   ├── my-bookings.html    # View own bookings + contact if approved
        ├── favorites.html      # View favorited listings
    │   └── ratings.html        # View previously booked stays and rate them
│   ├── host/
│   │   ├── my-listings.html    # View/edit/delete own listings
│   │   ├── booking-requests.html # Approve or reject booking requests
        └── ratings.html        # View ratings on listed stays
│   └── admin/
│       ├── manage-listings.html # Overview
        ├── all-listings.html    # View and delete listings
        ├── all-users.html       # View and delete users
│       └── all-bookings.html    # View and delete bookings
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |

### Listings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/listings` | Public | Get all listings (search/filter/sort via query params) |
| GET | `/api/listings/:id` | Public | Get single listing |
| POST | `/api/listings` | Host / Admin | Create a listing |
| PUT | `/api/listings/:id` | Owner Host / Admin | Update a listing |
| DELETE | `/api/listings/:id` | Owner Host / Admin | Delete a listing |

**Query params for `GET /api/listings`:**
```
?search=<name>&location=<loc>&type=<type>&sort=price_asc|price_desc
```

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/bookings` | Admin | Get all bookings |
| GET | `/api/bookings/my` | Guest | Get own bookings |
| GET | `/api/bookings/host` | Host | Get requests for host's listings |
| POST | `/api/bookings` | Guest | Create a booking |
| PUT | `/api/bookings/:id/status` | Host | Approve or reject a booking |

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Guest** | Browse/search listings, book listings, view own bookings (contact shown only if approved) |
| **Host** | Create/edit/delete own listings, view and approve/reject booking requests |
| **Admin** | View/delete any listing, view all bookings |

---

## Core Features

- **Authentication** — JWT-based login/register with bcrypt password hashing
- **Role-Based Access Control** — Middleware enforces guest/host/admin permissions
- **Search, Filter & Sort** — Query listings by name, location, type, and price
- **Booking System** — Date-range bookings with `pending → approved/rejected` flow
- **Date Range Validation** — Prevents overlapping approved bookings on the same listing
- **Contact Visibility** — Host contact number is only revealed to guests with an approved booking

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/stayez` |
| `JWT_SECRET` | Secret key for JWT signing | `supersecretkey` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript (Fetch API) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens (JWT), bcryptjs |


---

## Deployment

> Deployed via vercel


