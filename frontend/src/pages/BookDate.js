import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentMonthDates, formatDate, isWeekend, isPastDate } from '../utils/dateUtils';
import './BookDate.css';

const BookDate = () => {
  const [searchParams] = useSearchParams();
  const sport = searchParams.get('sport');
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const currentMonthDates = getCurrentMonthDates();
    setDates(currentMonthDates);
  }, []);

  const handleDateSelect = (date) => {
    if (isWeekend(date) || isPastDate(date)) {
      return; // Disabled dates
    }
    const dateStr = formatDate(date);
    navigate(`/book/time?sport=${sport}&date=${dateStr}`);
  };

  const formatDateDisplay = (date) => {
    const d = new Date(date);
    return d.getDate();
  };

  const getDayName = (date) => {
    const d = new Date(date);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
  };

  return (
    <div className="book-date-container">
      <div className="book-date-content">
        <h1>Select a Date</h1>
        <p className="book-date-subtitle">
          Choose a date for your {sport === 'badminton' ? 'Badminton' : 'Table Tennis'} booking
        </p>
        <p className="book-date-note">Only dates in the current month are available. Weekends are not available.</p>

        <div className="calendar-grid">
          {dates.map((date, index) => {
            const isDisabled = isWeekend(date) || isPastDate(date);
            return (
              <div
                key={index}
                className={`calendar-day ${isDisabled ? 'disabled' : 'enabled'}`}
                onClick={() => !isDisabled && handleDateSelect(date)}
              >
                <div className="day-name">{getDayName(date)}</div>
                <div className="day-number">{formatDateDisplay(date)}</div>
              </div>
            );
          })}
        </div>

        <button className="btn-back" onClick={() => navigate('/book')}>
          Back
        </button>
      </div>
    </div>
  );
};

export default BookDate;

