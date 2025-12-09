# SportHall - MERN Stack Application

A Sports Hall Management System built with MongoDB, Express.js, React.js, and Node.js. This application allows users to book sports courts, manage availability, and handle bookings with an admin panel for court management.

## Project Structure

```
SportHall/
├── backend/
│   ├── config/
│   │   └── db.js                    # Database configuration
│   ├── controllers/
│   │   ├── authController.js        # Authentication controllers
│   │   ├── availabilityController.js # Availability management
│   │   ├── bookingController.js     # Booking management
│   │   └── courtController.js       # Court management
│   ├── middleware/
│   │   ├── auth.js                  # Authentication middleware
│   │   ├── admin.js                 # Admin authorization middleware
│   │   └── errorHandler.js          # Error handling middleware
│   ├── models/
│   │   ├── User.js                  # User model
│   │   ├── Court.js                 # Court model
│   │   ├── Booking.js               # Booking model
│   │   └── Availability.js          # Availability model
│   ├── routes/
│   │   ├── auth.js                  # Authentication routes
│   │   ├── courts.js                # Court routes
│   │   ├── bookings.js              # Booking routes
│   │   └── availability.js          # Availability routes
│   ├── scripts/
│   │   └── seedCourts.js            # Court seeding script
│   ├── utils/
│   │   ├── generateToken.js         # JWT token generation
│   │   └── dateUtils.js             # Date utility functions
│   ├── server.js                    # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Navigation component
│   │   │   └── ProtectedRoute.jsx   # Route protection component
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication context
│   │   ├── hooks/
│   │   │   └── useAuth.jsx          # Custom auth hook
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Home page
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Register page
│   │   │   ├── Dashboard.jsx        # User dashboard
│   │   │   ├── Profile.jsx           # User profile
│   │   │   ├── Admin.jsx            # Admin panel
│   │   │   ├── Book.jsx             # Booking flow entry
│   │   │   ├── BookDate.jsx         # Date selection
│   │   │   ├── BookTime.jsx         # Time slot selection
│   │   │   ├── BookCourt.jsx        # Court selection
│   │   │   └── BookParticipants.jsx # Participants selection
│   │   ├── services/
│   │   │   ├── api.js               # Axios configuration
│   │   │   ├── authService.js       # Authentication service
│   │   │   └── bookingService.js    # Booking & court services
│   │   ├── utils/
│   │   │   ├── constants.js         # Constants
│   │   │   └── dateUtils.js        # Date utility functions
│   │   ├── App.js                   # Main App component
│   │   ├── index.js                 # React entry point
│   │   └── index.css                # Global styles (Tailwind)
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   └── package.json
│
├── .gitignore                       # Root gitignore
├── README.md                        # Project documentation
└── SECURITY_NOTES.md                # Security documentation
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your MongoDB connection string and JWT secret.

5. Start the development server:
   ```bash
   npm run dev
   ```

   The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your API URL if different from default.

5. Start the development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Features

### Backend
- Express.js server with RESTful API
- MongoDB database with Mongoose ODM
- JWT authentication with protected routes
- Password hashing with bcrypt
- Role-based access control (User/Admin)
- CORS enabled
- Centralized error handling middleware
- Database connection configuration
- Court seeding script
- Date utility functions

### Frontend
- React.js with React Router v6
- Axios for API calls with interceptors
- Context API for state management
- Custom authentication hooks
- Protected routes implementation
- Multi-step booking flow
- Admin panel for court and availability management
- User dashboard and profile management
- Responsive design with Tailwind CSS
- Token-based authentication

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Courts
- `GET /api/courts` - Get all courts (optional: `?sport=sportType`)
- `GET /api/courts/available` - Get available courts (query: `sport`, `date`, `timeSlot`)
- `POST /api/courts` - Create a new court (Admin only)

### Bookings
- `POST /api/bookings` - Create a new booking (Protected)
- `GET /api/bookings/my-bookings` - Get current user's bookings (Protected)
- `GET /api/bookings` - Get all bookings with filters (Admin only)
- `PUT /api/bookings/:id/cancel` - Cancel a booking (Protected)

### Availability
- `GET /api/availability` - Get availability (query: `date`, `timeSlot`, `sport`, `courtId`)
- `POST /api/availability` - Set court availability (Admin only)
- `DELETE /api/availability/:id` - Delete availability (Admin only)

## Technologies Used

- **Backend**: 
  - Node.js
  - Express.js v5
  - MongoDB
  - Mongoose v9
  - JWT (jsonwebtoken)
  - bcryptjs
  - CORS
  - dotenv

- **Frontend**: 
  - React.js v18
  - React Router DOM v6
  - Axios
  - Tailwind CSS v3
  - PostCSS & Autoprefixer

- **Development Tools**: 
  - Nodemon
  - React Scripts

## Available Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed:courts # Seed the database with sample courts
```

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## Project Status

✅ **Completed Features:**
- User authentication (register/login)
- JWT-based authentication
- Protected routes (frontend & backend)
- Admin role-based access control
- Court management (CRUD operations)
- Availability management
- Booking system with multi-step flow
- User dashboard and profile
- Admin panel
- Error handling middleware
- Responsive UI with Tailwind CSS

## Future Enhancements

- Email notifications for bookings
- Booking history and analytics
- Calendar view for availability