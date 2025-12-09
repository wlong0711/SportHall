# SportHall - MERN Stack Application

A Sports Hall Management System built with MongoDB, Express.js, React.js, and Node.js.

## Project Structure

```
SportHall/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   └── authController.js  # Authentication controllers
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── errorHandler.js    # Error handling middleware
│   ├── models/
│   │   └── User.js            # User model
│   ├── routes/
│   │   └── auth.js            # Authentication routes
│   ├── utils/
│   │   └── generateToken.js   # JWT token generation
│   ├── server.js              # Express server entry point
│   ├── package.json
│   └── .env.example           # Environment variables example
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js      # Navigation component
    │   │   └── Navbar.css
    │   ├── pages/
    │   │   ├── Home.js        # Home page
    │   │   ├── Login.js       # Login page
    │   │   ├── Login.css
    │   │   ├── Register.js    # Register page
    │   │   └── Register.css
    │   ├── services/
    │   │   ├── api.js         # Axios configuration
    │   │   └── authService.js # Authentication service
    │   ├── utils/
    │   │   └── constants.js   # Constants
    │   ├── App.js             # Main App component
    │   ├── App.css
    │   ├── index.js           # React entry point
    │   └── index.css
    ├── package.json
    └── .env.example           # Environment variables example
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
- JWT authentication
- Password hashing with bcrypt
- CORS enabled
- Error handling middleware
- Environment variable configuration

### Frontend
- React.js with React Router
- Axios for API calls
- Authentication pages (Login/Register)
- Responsive design
- Token-based authentication

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Frontend**: React.js, React Router, Axios
- **Development Tools**: Nodemon, React Scripts

## Next Steps

1. Add more models and routes for your sports hall features
2. Implement protected routes in the frontend
3. Add form validation
4. Add error handling and user feedback
5. Style the application with a UI framework (Material-UI, Bootstrap, etc.)
6. Add more features specific to sports hall management

