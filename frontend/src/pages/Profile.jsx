import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { formatDateDisplay, formatTimeSlot } from '../utils/dateUtils';

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
      <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-slate-300">Loading your bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-8 text-white text-3xl font-bold">My Bookings</h1>

        {successMessage && (
          <div className="bg-green-900/50 text-green-200 px-4 py-4 rounded-lg mb-4 border border-green-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 text-red-200 px-4 py-4 rounded-lg mb-4 border border-red-700">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-16 px-8 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-lg text-slate-300 mb-8">You don't have any bookings yet.</p>
            <Link to="/book" className="inline-block px-8 py-4 bg-blue-600 text-white no-underline rounded-lg text-lg hover:bg-blue-500 transition-colors">
              Book Now
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className={`bg-slate-800 p-8 rounded-xl shadow-lg border-l-4 border ${
                  booking.status === 'cancelled' 
                    ? 'opacity-60 border-l-slate-500 border-slate-700' 
                    : 'border-l-blue-500 border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-700">
                  <h3 className="m-0 text-white text-2xl">
                    {booking.sport === 'badminton' ? '🏸' : '🏓'}{' '}
                    {booking.sport === 'badminton' ? 'Badminton' : 'Table Tennis'}
                  </h3>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${
                    booking.status === 'confirmed'
                      ? 'bg-green-900/50 text-green-200 border border-green-700'
                      : 'bg-red-900/50 text-red-200 border border-red-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="my-2 text-slate-300"><strong className="text-white">Court:</strong> {booking.court?.name}</p>
                  <p className="my-2 text-slate-300"><strong className="text-white">Date:</strong> {formatDateDisplay(booking.date)}</p>
                  <p className="my-2 text-slate-300"><strong className="text-white">Time:</strong> {formatTimeSlot(booking.timeSlot)}</p>
                  <p className="my-2 text-slate-300"><strong className="text-white">Participants:</strong> {booking.participants.length}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <strong className="text-white">Participants:</strong>
                  <ul className="list-none p-0 mt-2">
                    {booking.participants.map((participant, index) => (
                      <li key={index} className="py-1 text-slate-300">
                        {participant.name} ({participant.email})
                      </li>
                    ))}
                  </ul>
                </div>
                {booking.status === 'confirmed' && (
                  <button
                    className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg cursor-pointer text-base hover:bg-red-500 transition-colors"
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

