import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { availabilityService, courtService, bookingService } from '../services/bookingService';
import { generateTimeSlots, formatDate, getCurrentMonthDates } from '../utils/dateUtils';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('availability');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Availability state
  const [availabilityForm, setAvailabilityForm] = useState({
    date: '',
    timeSlot: '',
    sport: 'all',
    courtId: '',
    isAvailable: false,
    reason: '',
  });

  // Courts state
  const [courts, setCourts] = useState([]);
  const [newCourt, setNewCourt] = useState({ name: '', sport: 'badminton' });

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingFilters, setBookingFilters] = useState({
    date: '',
    sport: '',
    court: '',
  });

  const timeSlots = generateTimeSlots();
  const dates = getCurrentMonthDates();

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin only.');
      return;
    }
    fetchCourts();
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBookings();
    }
  }, [user, bookingFilters]);

  const fetchCourts = async () => {
    try {
      const data = await courtService.getCourts();
      setCourts(data);
    } catch (err) {
      console.error('Failed to fetch courts:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAllBookings(bookingFilters);
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSetAvailability = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await availabilityService.setAvailability(availabilityForm);
      setSuccessMessage('Availability updated successfully');
      setAvailabilityForm({
        date: '',
        timeSlot: '',
        sport: 'all',
        courtId: '',
        isAvailable: false,
        reason: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability');
    }
  };

  const handleCreateCourt = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await courtService.createCourt(newCourt);
      setSuccessMessage('Court created successfully');
      setNewCourt({ name: '', sport: 'badminton' });
      fetchCourts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create court');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-container">
        <div className="admin-content">
          <div className="error-message">Access denied. Admin only.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-content">
        <h1>Admin Panel</h1>

        <div className="admin-tabs">
          <button
            className={activeTab === 'availability' ? 'active' : ''}
            onClick={() => setActiveTab('availability')}
          >
            Manage Availability
          </button>
          <button
            className={activeTab === 'courts' ? 'active' : ''}
            onClick={() => setActiveTab('courts')}
          >
            Manage Courts
          </button>
          <button
            className={activeTab === 'bookings' ? 'active' : ''}
            onClick={() => setActiveTab('bookings')}
          >
            View Bookings
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {activeTab === 'availability' && (
          <div className="admin-section">
            <h2>Close/Open Dates or Time Slots</h2>
            <form onSubmit={handleSetAvailability} className="admin-form">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={availabilityForm.date}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time Slot</label>
                <select
                  value={availabilityForm.timeSlot}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, timeSlot: e.target.value })}
                  required
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sport</label>
                <select
                  value={availabilityForm.sport}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, sport: e.target.value })}
                >
                  <option value="all">All Sports</option>
                  <option value="badminton">Badminton</option>
                  <option value="table-tennis">Table Tennis</option>
                </select>
              </div>
              <div className="form-group">
                <label>Court (Optional - leave empty for all courts)</label>
                <select
                  value={availabilityForm.courtId}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, courtId: e.target.value })}
                >
                  <option value="">All Courts</option>
                  {courts.map((court) => (
                    <option key={court._id} value={court._id}>
                      {court.name} ({court.sport})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={availabilityForm.isAvailable}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, isAvailable: e.target.checked })}
                  />
                  Available (uncheck to close)
                </label>
              </div>
              <div className="form-group">
                <label>Reason (Optional)</label>
                <input
                  type="text"
                  value={availabilityForm.reason}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, reason: e.target.value })}
                  placeholder="e.g., Maintenance"
                />
              </div>
              <button type="submit" className="btn-submit">Update Availability</button>
            </form>
          </div>
        )}

        {activeTab === 'courts' && (
          <div className="admin-section">
            <h2>Create New Court</h2>
            <form onSubmit={handleCreateCourt} className="admin-form">
              <div className="form-group">
                <label>Court Name</label>
                <input
                  type="text"
                  value={newCourt.name}
                  onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
                  required
                  placeholder="e.g., Court 1"
                />
              </div>
              <div className="form-group">
                <label>Sport</label>
                <select
                  value={newCourt.sport}
                  onChange={(e) => setNewCourt({ ...newCourt, sport: e.target.value })}
                >
                  <option value="badminton">Badminton</option>
                  <option value="table-tennis">Table Tennis</option>
                </select>
              </div>
              <button type="submit" className="btn-submit">Create Court</button>
            </form>

            <h2 style={{ marginTop: '2rem' }}>Existing Courts</h2>
            <div className="courts-list">
              {courts.map((court) => (
                <div key={court._id} className="court-item">
                  <strong>{court.name}</strong> - {court.sport === 'badminton' ? '🏸 Badminton' : '🏓 Table Tennis'}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="admin-section">
            <h2>All Bookings</h2>
            <div className="filters">
              <input
                type="date"
                placeholder="Filter by date"
                value={bookingFilters.date}
                onChange={(e) => setBookingFilters({ ...bookingFilters, date: e.target.value })}
              />
              <select
                value={bookingFilters.sport}
                onChange={(e) => setBookingFilters({ ...bookingFilters, sport: e.target.value })}
              >
                <option value="">All Sports</option>
                <option value="badminton">Badminton</option>
                <option value="table-tennis">Table Tennis</option>
              </select>
            </div>
            {loading ? (
              <div>Loading bookings...</div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking._id} className="booking-item">
                    <div>
                      <strong>{booking.user?.name}</strong> ({booking.user?.email})
                    </div>
                    <div>
                      {booking.sport === 'badminton' ? '🏸' : '🏓'} {booking.sport} - {booking.court?.name}
                    </div>
                    <div>
                      {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}
                    </div>
                    <div>Status: {booking.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

