import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { courtService } from '../services/bookingService';
import './BookCourt.css';

const BookCourt = () => {
  const [searchParams] = useSearchParams();
  const sport = searchParams.get('sport');
  const date = searchParams.get('date');
  const timeSlot = searchParams.get('timeSlot');
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailableCourts = async () => {
      try {
        setLoading(true);
        const availableCourts = await courtService.getAvailableCourts(sport, date, timeSlot);
        setCourts(availableCourts);
        if (availableCourts.length === 0) {
          setError('No courts available for this time slot. Please select another time.');
        }
      } catch (err) {
        setError('Failed to load available courts. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCourts();
  }, [sport, date, timeSlot]);

  const handleCourtSelect = (courtId) => {
    navigate(`/book/participants?sport=${sport}&date=${date}&timeSlot=${timeSlot}&courtId=${courtId}`);
  };

  if (loading) {
    return (
      <div className="book-court-container">
        <div className="book-court-content">
          <div>Loading available courts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-court-container">
      <div className="book-court-content">
        <h1>Select a Court</h1>
        <p className="book-court-subtitle">
          Available courts for {sport === 'badminton' ? 'Badminton' : 'Table Tennis'} on {new Date(date).toLocaleDateString()} at {timeSlot}
        </p>

        {error && <div className="error-message">{error}</div>}

        {courts.length > 0 ? (
          <div className="courts-grid">
            {courts.map((court) => (
              <div
                key={court._id}
                className="court-option"
                onClick={() => handleCourtSelect(court._id)}
              >
                <h3>{court.name}</h3>
                <p>{court.sport === 'badminton' ? '🏸' : '🏓'} {court.sport}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courts">
            <p>No courts available for this time slot.</p>
            <button className="btn-back" onClick={() => navigate(`/book/time?sport=${sport}&date=${date}`)}>
              Select Another Time
            </button>
          </div>
        )}

        <button className="btn-back" onClick={() => navigate(`/book/time?sport=${sport}&date=${date}`)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default BookCourt;

