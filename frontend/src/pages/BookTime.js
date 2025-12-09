import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateTimeSlots, isTimeSlotExpired, formatTimeSlot } from '../utils/dateUtils';
import './BookTime.css';

const BookTime = () => {
  const [searchParams] = useSearchParams();
  const sport = searchParams.get('sport');
  const date = searchParams.get('date');
  const navigate = useNavigate();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const timeSlots = generateTimeSlots();

  const handleTimeSelect = (timeSlot) => {
    if (isTimeSlotExpired(date, timeSlot)) {
      return; // Disabled
    }
    setSelectedTimeSlot(timeSlot);
    navigate(`/book/court?sport=${sport}&date=${date}&timeSlot=${timeSlot}`);
  };

  return (
    <div className="book-time-container">
      <div className="book-time-content">
        <h1>Select a Time Slot</h1>
        <p className="book-time-subtitle">
          Each time slot is 2 hours long
        </p>

        <div className="time-slots-grid">
          {timeSlots.map((timeSlot) => {
            const isExpired = isTimeSlotExpired(date, timeSlot);
            return (
              <div
                key={timeSlot}
                className={`time-slot ${isExpired ? 'disabled' : 'enabled'} ${selectedTimeSlot === timeSlot ? 'selected' : ''}`}
                onClick={() => !isExpired && handleTimeSelect(timeSlot)}
              >
                {formatTimeSlot(timeSlot)}
              </div>
            );
          })}
        </div>

        <button className="btn-back" onClick={() => navigate(`/book/date?sport=${sport}`)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default BookTime;

