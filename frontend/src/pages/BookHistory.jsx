import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { formatDateDisplay, formatTimeSlot, isTimeSlotExpired } from '../utils/dateUtils';

const BookHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ongoing');
  const tabRefs = {
    ongoing: useRef(null),
    completed: useRef(null),
    cancelled: useRef(null),
  };
  const indicatorRef = useRef(null);
  const tabsContainerRef = useRef(null);

  useEffect(() => {
    if (searchParams.get('bookingSuccess') === 'true') {
      setSuccessMessage('Booking created successfully!');
      // Remove the query param immediately so a page refresh won't re-show the message.
      try {
        const params = new URLSearchParams(searchParams);
        params.delete('bookingSuccess');
        setSearchParams(params, { replace: true });
      } catch (e) {
        // ignore
      }

      setTimeout(() => {
        setSuccessMessage('');
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
    // keep for compatibility if called directly, but prefer using the modal
    try {
      await bookingService.cancelBooking(bookingId);
      // Update local state to mark the booking as cancelled so it appears
      // immediately in the Cancelled tab without a full refresh.
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      setSuccessMessage('Booking cancelled successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  // Confirmation modal state for cancelling
  const [confirmCancel, setConfirmCancel] = useState({ open: false, bookingId: null });

  const openCancelModal = (bookingId) => setConfirmCancel({ open: true, bookingId });
  const closeCancelModal = () => setConfirmCancel({ open: false, bookingId: null });

  const performCancel = async () => {
    const bookingId = confirmCancel.bookingId;
    if (!bookingId) return closeCancelModal();

    try {
      await bookingService.cancelBooking(bookingId);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      setSuccessMessage('Booking cancelled successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      closeCancelModal();
    }
  };

  // classify bookings into Ongoing, Completed, Cancelled
  const classified = bookings.reduce(
    (acc, booking) => {
      const cancelled = booking.status === 'cancelled';
      const backendCompleted = booking.status === 'completed';
      const expired = isTimeSlotExpired(booking.date, booking.timeSlot);

      if (cancelled) acc.cancelled.push(booking);
      else if (backendCompleted || (booking.status === 'confirmed' && expired)) acc.completed.push(booking);
      else acc.ongoing.push(booking);

      return acc;
    },
    { ongoing: [], completed: [], cancelled: [] }
  );

  // position the underline indicator beneath the active tab
  const positionIndicator = useCallback(() => {
    const activeRef = tabRefs[activeTab];
    const indicator = indicatorRef.current;
    const container = tabsContainerRef.current;
    if (!activeRef || !activeRef.current || !indicator || !container) return;
    const activeRect = activeRef.current.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const left = activeRect.left - containerRect.left + container.scrollLeft;
    indicator.style.width = `${activeRect.width}px`;
    indicator.style.transform = `translateX(${left}px)`;
  }, [activeTab, bookings]);

  useLayoutEffect(() => {
    // position initially and whenever positionIndicator changes (which covers activeTab/bookings)
    positionIndicator();
    const onResize = () => positionIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [positionIndicator]);

  const renderBookingCard = (booking, showCancel = false) => {
    const cancelled = booking.status === 'cancelled';
    const backendCompleted = booking.status === 'completed';
    const expired = isTimeSlotExpired(booking.date, booking.timeSlot);
    const displayStatus = cancelled ? 'cancelled' : backendCompleted || (booking.status === 'confirmed' && expired) ? 'completed' : 'ongoing';

    return (
      <div
        key={booking._id}
        className={`bg-slate-800 p-8 rounded-xl shadow-lg border-l-4 border ${
          cancelled
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
            displayStatus === 'ongoing'
              ? 'bg-green-900/50 text-green-200 border border-green-700'
              : displayStatus === 'completed'
              ? 'bg-sky-900/50 text-sky-200 border border-sky-700'
              : 'bg-red-900/50 text-red-200 border border-red-700'
          }`}>
            {displayStatus}
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
        {showCancel && (
          <button
            className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg cursor-pointer text-base hover:bg-red-500 transition-colors"
            onClick={() => openCancelModal(booking._id)}
          >
            Cancel Booking
          </button>
        )}
      </div>
    );
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
            {/* Tabs header */}
            <div className="relative mb-6" ref={tabsContainerRef}>
              <div className="flex items-center gap-4">
                <button
                  ref={tabRefs.ongoing}
                  onClick={() => setActiveTab('ongoing')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold ${activeTab === 'ongoing' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
                  Ongoing ({classified.ongoing.length})
                </button>
                <button
                  ref={tabRefs.completed}
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold ${activeTab === 'completed' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
                  Completed ({classified.completed.length})
                </button>
                <button
                  ref={tabRefs.cancelled}
                  onClick={() => setActiveTab('cancelled')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold ${activeTab === 'cancelled' ? 'text-white' : 'text-slate-300 hover:text-white'}`}>
                  Cancelled ({classified.cancelled.length})
                </button>
              </div>
              {/* animated underline indicator */}
              <div
                ref={indicatorRef}
                className="absolute left-0 bottom-0 h-0.5 bg-blue-400 rounded transition-all duration-300 ease-in-out"
                style={{ width: 0, transform: 'translateX(0px)' }}
              />
            </div>

            {/* Tab content */}
            <div>
              <div className="relative">
                <div className={`transition-all duration-300 ${activeTab === 'ongoing' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                  <h2 className="text-xl text-white mb-4">Ongoing</h2>
                  {classified.ongoing.length === 0 ? (
                    <p className="text-slate-400 mb-4">No ongoing bookings.</p>
                  ) : (
                    <div className="grid gap-6">{classified.ongoing.map(b => renderBookingCard(b, true))}</div>
                  )}
                </div>

                <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'completed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                  <h2 className="text-xl text-white mb-4">Completed</h2>
                  {classified.completed.length === 0 ? (
                    <p className="text-slate-400 mb-4">No completed bookings.</p>
                  ) : (
                    <div className="grid gap-6">{classified.completed.map(b => renderBookingCard(b, false))}</div>
                  )}
                </div>

                <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'cancelled' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                  <h2 className="text-xl text-white mb-4">Cancelled</h2>
                  {classified.cancelled.length === 0 ? (
                    <p className="text-slate-400 mb-4">No cancelled bookings.</p>
                  ) : (
                    <div className="grid gap-6">{classified.cancelled.map(b => renderBookingCard(b, false))}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Confirmation modal for cancelling a booking */}
        {confirmCancel.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={closeCancelModal} />
            <div className="relative bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
              <h3 className="text-lg text-white mb-2">Confirm cancellation</h3>
              <p className="text-slate-300 mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 bg-slate-700 text-slate-200 rounded" onClick={closeCancelModal}>Close</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={performCancel}>Confirm Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookHistory;
