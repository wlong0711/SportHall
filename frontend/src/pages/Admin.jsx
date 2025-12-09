import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { availabilityService, courtService, bookingService } from '../services/bookingService';
import { generateTimeSlots, formatDate, getCurrentMonthDates } from '../utils/dateUtils';

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
      <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/50 text-red-200 px-4 py-4 rounded-lg border border-red-700">
            Access denied. Admin only.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-8 text-white text-3xl font-bold">Admin Panel</h1>

        <div className="flex gap-4 mb-8 border-b-2 border-slate-700">
          <button
            className={`px-8 py-4 bg-transparent border-none cursor-pointer text-base transition-all border-b-2 ${
              activeTab === 'availability'
                ? 'text-blue-400 border-b-blue-500 font-bold'
                : 'text-slate-400 border-b-transparent hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('availability')}
          >
            Manage Availability
          </button>
          <button
            className={`px-8 py-4 bg-transparent border-none cursor-pointer text-base transition-all border-b-2 ${
              activeTab === 'courts'
                ? 'text-blue-400 border-b-blue-500 font-bold'
                : 'text-slate-400 border-b-transparent hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('courts')}
          >
            Manage Courts
          </button>
          <button
            className={`px-8 py-4 bg-transparent border-none cursor-pointer text-base transition-all border-b-2 ${
              activeTab === 'bookings'
                ? 'text-blue-400 border-b-blue-500 font-bold'
                : 'text-slate-400 border-b-transparent hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            View Bookings
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 px-4 py-4 rounded-lg mb-4 border border-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-900/50 text-green-200 px-4 py-4 rounded-lg mb-4 border border-green-700">
            {successMessage}
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
            <h2 className="mb-6 text-white text-xl font-semibold">Close/Open Dates or Time Slots</h2>
            <form onSubmit={handleSetAvailability} className="grid gap-6">
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-slate-200">Date</label>
                <input
                  type="date"
                  value={availabilityForm.date}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, date: e.target.value })}
                  required
                  className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-slate-200">Time Slot</label>
                <select
                  value={availabilityForm.timeSlot}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, timeSlot: e.target.value })}
                  required
                  className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-slate-200">Sport</label>
                <select
                  value={availabilityForm.sport}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, sport: e.target.value })}
                  className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Sports</option>
                  <option value="badminton">Badminton</option>
                  <option value="table-tennis">Table Tennis</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-slate-200">Court (Optional - leave empty for all courts)</label>
                <select
                  value={availabilityForm.courtId}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, courtId: e.target.value })}
                  className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Courts</option>
                  {courts.map((court) => (
                    <option key={court._id} value={court._id}>
                      {court.name} ({court.sport})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-slate-200 flex items-center">
                  <input
                    type="checkbox"
                    checked={availabilityForm.isAvailable}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, isAvailable: e.target.checked })}
                    className="mr-2 w-auto"
                  />
                  Available (uncheck to close)
                </label>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-slate-200">Reason (Optional)</label>
                <input
                  type="text"
                  value={availabilityForm.reason}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, reason: e.target.value })}
                  placeholder="e.g., Maintenance"
                  className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button 
                type="submit" 
                className="px-8 py-3 bg-blue-600 text-white rounded-lg cursor-pointer text-base hover:bg-blue-500 transition-colors"
              >
                Update Availability
              </button>
            </form>
          </div>
        )}

        {activeTab === 'courts' && (
          <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
            <h2 className="mb-6 text-white text-xl font-semibold">Create New Court</h2>
            <form onSubmit={handleCreateCourt} className="grid gap-6">
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-slate-200">Court Name</label>
                <input
                  type="text"
                  value={newCourt.name}
                  onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
                  required
                  placeholder="e.g., Court 1"
                  className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-slate-200">Sport</label>
                <select
                  value={newCourt.sport}
                  onChange={(e) => setNewCourt({ ...newCourt, sport: e.target.value })}
                  className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="badminton">Badminton</option>
                  <option value="table-tennis">Table Tennis</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="px-8 py-3 bg-blue-600 text-white rounded-lg cursor-pointer text-base hover:bg-blue-500 transition-colors"
              >
                Create Court
              </button>
            </form>

            <h2 className="mt-8 mb-4 text-white text-xl font-semibold">Existing Courts</h2>
            <div className="grid gap-4 mt-4">
              {courts.map((court) => (
                <div key={court._id} className="p-4 bg-slate-700 rounded-lg border-l-4 border-blue-500 border border-slate-600">
                  <strong className="text-white">{court.name}</strong> <span className="text-slate-300">- {court.sport === 'badminton' ? '🏸 Badminton' : '🏓 Table Tennis'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
            <h2 className="mb-6 text-white text-xl font-semibold">All Bookings</h2>
            <div className="flex gap-4 mb-8">
              <input
                type="date"
                placeholder="Filter by date"
                value={bookingFilters.date}
                onChange={(e) => setBookingFilters({ ...bookingFilters, date: e.target.value })}
                className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <select
                value={bookingFilters.sport}
                onChange={(e) => setBookingFilters({ ...bookingFilters, sport: e.target.value })}
                className="px-3 py-3 bg-slate-700 border border-slate-600 rounded text-base text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Sports</option>
                <option value="badminton">Badminton</option>
                <option value="table-tennis">Table Tennis</option>
              </select>
            </div>
            {loading ? (
              <div className="text-slate-300">Loading bookings...</div>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="p-6 bg-slate-700 rounded-lg border-l-4 border-blue-500 border border-slate-600">
                    <div className="my-2 text-white">
                      <strong>{booking.user?.name}</strong> <span className="text-slate-300">({booking.user?.email})</span>
                    </div>
                    <div className="my-2 text-slate-300">
                      {booking.sport === 'badminton' ? '🏸' : '🏓'} {booking.sport} - {booking.court?.name}
                    </div>
                    <div className="my-2 text-slate-300">
                      {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}
                    </div>
                    <div className="my-2 text-slate-300">Status: <span className="text-white font-semibold">{booking.status}</span></div>
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

