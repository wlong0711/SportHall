import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Book.css';

const Book = () => {
  const [selectedSport, setSelectedSport] = useState(null);
  const navigate = useNavigate();

  const handleSportSelect = (sport) => {
    setSelectedSport(sport);
    navigate(`/book/date?sport=${sport}`);
  };

  return (
    <div className="book-container">
      <div className="book-content">
        <h1>Select a Sport</h1>
        <p className="book-subtitle">Choose the sport you want to book</p>
        
        <div className="sport-selection">
          <div 
            className="sport-option"
            onClick={() => handleSportSelect('badminton')}
          >
            <div className="sport-icon">🏸</div>
            <h2>Badminton</h2>
            <p>Book a badminton court</p>
          </div>
          
          <div 
            className="sport-option"
            onClick={() => handleSportSelect('table-tennis')}
          >
            <div className="sport-icon">🏓</div>
            <h2>Table Tennis</h2>
            <p>Reserve a table tennis court</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;

