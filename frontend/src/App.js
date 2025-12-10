import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Book from './pages/Book';
import BookDate from './pages/BookDate';
import BookTime from './pages/BookTime';
import BookCourt from './pages/BookCourt';
import BookParticipants from './pages/BookParticipants';
import Profile from './pages/Profile';
import BookHistory from './pages/BookHistory';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Dashboard removed — users are redirected to Home after login */}
            <Route
              path="/book"
              element={
                <ProtectedRoute>
                  <Book />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/date"
              element={
                <ProtectedRoute>
                  <BookDate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/time"
              element={
                <ProtectedRoute>
                  <BookTime />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/court"
              element={
                <ProtectedRoute>
                  <BookCourt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book/participants"
              element={
                <ProtectedRoute>
                  <BookParticipants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

