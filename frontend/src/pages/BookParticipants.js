import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { formatTimeSlot, formatDateDisplay } from '../utils/dateUtils';
import './BookParticipants.css';

const BookParticipants = () => {
  const [searchParams] = useSearchParams();
  const sport = searchParams.get('sport');
  const date = searchParams.get('date');
  const timeSlot = searchParams.get('timeSlot');
  const courtId = searchParams.get('courtId');
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([{ name: '', email: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const addParticipant = () => {
    if (participants.length < 6) {
      setParticipants([...participants, { name: '', email: '' }]);
    }
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) {
      const updated = participants.filter((_, i) => i !== index);
      setParticipants(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const validParticipants = participants.filter(p => p.name.trim() && p.email.trim());
    if (validParticipants.length === 0) {
      setError('Please add at least one participant');
      return;
    }

    if (validParticipants.length > 6) {
      setError('Maximum 6 participants allowed');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const participant of validParticipants) {
      if (!emailRegex.test(participant.email)) {
        setError(`Invalid email address: ${participant.email}`);
        return;
      }
    }

    try {
      setLoading(true);
      await bookingService.createBooking({
        sport,
        courtId,
        date,
        timeSlot,
        participants: validParticipants,
      });
      navigate('/profile?bookingSuccess=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-participants-container">
      <div className="book-participants-content">
        <h1>Participant Information</h1>
        <p className="book-participants-subtitle">
          Add up to 6 participants for your booking
        </p>

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <p><strong>Sport:</strong> {sport === 'badminton' ? 'Badminton' : 'Table Tennis'}</p>
          <p><strong>Date:</strong> {formatDateDisplay(date)}</p>
          <p><strong>Time:</strong> {formatTimeSlot(timeSlot)}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="participants-form">
          {participants.map((participant, index) => (
            <div key={index} className="participant-row">
              <div className="participant-number">Participant {index + 1}</div>
              <div className="participant-fields">
                <input
                  type="text"
                  placeholder="Name"
                  value={participant.name}
                  onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                  required={index === 0}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={participant.email}
                  onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                  required={index === 0}
                />
                {participants.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeParticipant(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          {participants.length < 6 && (
            <button
              type="button"
              className="btn-add-participant"
              onClick={addParticipant}
            >
              + Add Participant
            </button>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn-back"
              onClick={() => navigate(`/book/court?sport=${sport}&date=${date}&timeSlot=${timeSlot}`)}
            >
              Back
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookParticipants;

