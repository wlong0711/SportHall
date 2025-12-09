import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to SportHall</h1>
        <p className="home-subtitle">Book your favorite sports facilities with ease</p>
        
        {isAuthenticated ? (
          <div className="home-actions">
            <Link to="/book" className="btn-book-now">
              Book Now
            </Link>
            <Link to="/profile" className="btn-profile">
              My Bookings
            </Link>
          </div>
        ) : (
          <div className="home-actions">
            <Link to="/login" className="btn-book-now">
              Login to Book
            </Link>
          </div>
        )}

        <div className="sports-info">
          <div className="sport-card">
            <h3>🏸 Badminton</h3>
            <p>Book a badminton court for your game</p>
          </div>
          <div className="sport-card">
            <h3>🏓 Table Tennis</h3>
            <p>Reserve a table tennis court</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

