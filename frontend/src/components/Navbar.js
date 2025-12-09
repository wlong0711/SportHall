import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          SportHall
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/book" className="navbar-link">
                Book Now
              </Link>
              <Link to="/profile" className="navbar-link">
                My Bookings
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="navbar-link">
                  Admin
                </Link>
              )}
              <div className="navbar-user">
                <span className="navbar-user-name">Welcome, {user?.name}</span>
                <button onClick={handleLogout} className="navbar-logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

