import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { formatDateDisplay, formatTimeSlot } from '../utils/dateUtils';
import './Profile.css';

const Profile = () => {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('bookingSuccess') === 'true') {
      setSuccessMessage('Booking created successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        searchParams.delete('bookingSuccess');
      }, 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getMyBookings();
        setBookings(data);
      } catch (err) {
        setError('Failed to load bookings. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      setBookings(bookings.filter(b => b._id !== bookingId));
      setSuccessMessage('Booking cancelled successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div>Loading your bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h1>My Bookings</h1>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You don't have any bookings yet.</p>
            <a href="/book" className="btn-book-now">Book Now</a>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className={`booking-card ${booking.status === 'cancelled' ? 'cancelled' : ''}`}
              >
                <div className="booking-header">
                  <h3>
                    {booking.sport === 'badminton' ? '🏸' : '🏓'}{' '}
                    {booking.sport === 'badminton' ? 'Badminton' : 'Table Tennis'}
                  </h3>
                  <span className={`status-badge ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-details">
                  <p><strong>Court:</strong> {booking.court?.name}</p>
                  <p><strong>Date:</strong> {formatDateDisplay(booking.date)}</p>
                  <p><strong>Time:</strong> {formatTimeSlot(booking.timeSlot)}</p>
                  <p><strong>Participants:</strong> {booking.participants.length}</p>
                </div>
                <div className="participants-list">
                  <strong>Participants:</strong>
                  <ul>
                    {booking.participants.map((participant, index) => (
                      <li key={index}>
                        {participant.name} ({participant.email})
                      </li>
                    ))}
                  </ul>
                </div>
                {booking.status === 'confirmed' && (
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

