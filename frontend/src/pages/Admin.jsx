import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { availabilityService, courtService, bookingService } from '../services/bookingService';
import { generateTimeSlots, formatDate, getCurrentMonthDates, isTimeSlotExpired, formatTimeSlot } from '../utils/dateUtils';

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

  // --- Day view schedule state & loader for availability management ---
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dayData, setDayData] = useState({}); // { timeSlot: { [courtId]: { status, label, id, reason } } }
  const [dayLoading, setDayLoading] = useState(false);
  const [availabilitySport, setAvailabilitySport] = useState('badminton');
  // dialog state for closing a slot
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeDialogInfo, setCloseDialogInfo] = useState({ timeSlot: null, court: null });
  const [closeReason, setCloseReason] = useState('');
  const [closeProcessing, setCloseProcessing] = useState(false);
  // dialog state for reopening a slot (confirmation)
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [reopenDialogInfo, setReopenDialogInfo] = useState({ timeSlot: null, court: null, availabilityId: null });
  const [reopenProcessing, setReopenProcessing] = useState(false);

  const getToday = () => new Date().toISOString().slice(0, 10);

  const handleDateChange = (val) => {
    // ensure non-null date value and prevent selecting past dates
    if (!val) {
      setSelectedDate(getToday());
      return;
    }
    const today = getToday();
    if (val < today) {
      // clamp to today
      setSelectedDate(today);
    } else {
      setSelectedDate(val);
    }
  };

  const handleDateBlur = (e) => {
    const val = e.target.value;
    if (!val) {
      setSelectedDate(getToday());
      return;
    }
    if (val < getToday()) {
      setSelectedDate(getToday());
    }
  };

  const fetchDaySchedule = async (date = selectedDate) => {
    try {
      setDayLoading(true);
      // prevent loading past dates
      const today = getToday();
      if (date < today) {
        // reset selected date to today and bail out
        setSelectedDate(today);
        setDayLoading(false);
        return;
      }
      // fetch courts, bookings for date, and availability overrides
      const [courtsData, bookingsData, availabilityData] = await Promise.all([
        courtService.getCourts(),
        bookingService.getAllBookings({ date }),
        availabilityService.getAvailability({ date }),
      ]);

      // ensure courts stored
      setCourts(courtsData || []);

      // build dayData lookup
      const slots = generateTimeSlots();
      const data = {};
      // initialize as available
      slots.forEach((slot) => {
        data[slot] = {};
        (courtsData || []).forEach((c) => {
          data[slot][c._id] = { status: 'available', label: 'Open', id: null, reason: null, court: c };
        });
      });

      // apply availability overrides (closures)
      // availability records may populate `court` (object) or store `court` as id; handle both.
      (availabilityData || []).forEach((av) => {
        const slot = av.timeSlot;
        if (!data[slot]) return;

        // determine court id if present
        const cid = av.court?._id || av.courtId || av.court || null;

        // If cid is null (availability applies to all courts for the sport), apply to matching courts
        if (cid === null) {
          // apply to every court that matches the availability sport (or all)
          (courtsData || []).forEach((c) => {
            if (av.sport && av.sport !== 'all' && c.sport !== av.sport) return;
            if (!data[slot] || !data[slot][c._id]) {
              // note: defensive - ensure key exists
              if (!data[slot][c._id]) data[slot][c._id] = { status: 'available', label: 'Open', id: null, reason: null, court: c };
            }
            if (av.isAvailable === false) {
              data[slot][c._id] = { status: 'closed', label: 'Closed', id: av._id, reason: av.reason || '', court: data[slot][c._id].court };
            } else {
              data[slot][c._id] = { status: 'available', label: 'Open', id: av._id, reason: av.reason || '', court: data[slot][c._id].court };
            }
          });
        } else {
          // specific court override
          // cid might be an ObjectId string or populated object id — ensure we use the id string
          const courtIdStr = typeof cid === 'object' && cid._id ? cid._id : cid;
          if (!data[slot] || !data[slot][courtIdStr]) return;
          if (av.isAvailable === false) {
            data[slot][courtIdStr] = { status: 'closed', label: 'Closed', id: av._id, reason: av.reason || '', court: data[slot][courtIdStr].court };
          } else {
            data[slot][courtIdStr] = { status: 'available', label: 'Open', id: av._id, reason: av.reason || '', court: data[slot][courtIdStr].court };
          }
        }
      });

      // apply bookings (booked takes precedence)
      (bookingsData || []).forEach((b) => {
        const slot = b.timeSlot;
        const cid = b.court?._id || b.courtId;
        if (!data[slot] || !data[slot][cid]) return;
        data[slot][cid] = { status: 'booked', label: 'Booked', id: b._id, reason: null, court: data[slot][cid].court };
      });

      setDayData(data);
    } catch (err) {
      console.error('Failed to load day schedule', err);
      setError('Failed to load day schedule');
    } finally {
      setDayLoading(false);
    }
  };

  useEffect(() => {
    // fetch day schedule when selectedDate changes
    fetchDaySchedule(selectedDate);
  }, [selectedDate]);

  // open the close-slot dialog (enter reason + confirm)
  const handleCloseSlot = (timeSlot, court) => {
    setCloseDialogInfo({ timeSlot, court });
    setCloseReason('');
    setCloseDialogOpen(true);
  };

  const performCloseSlot = async () => {
    const { timeSlot, court } = closeDialogInfo || {};
    if (!timeSlot || !court) return;
    try {
      setCloseProcessing(true);
      const res = await availabilityService.setAvailability({ date: selectedDate, timeSlot, sport: court.sport || 'all', courtId: court._id, isAvailable: false, reason: closeReason });

      // optimistic UI update: mark the cell as closed immediately
      setDayData((prev) => {
        const next = { ...prev };
        if (!next[timeSlot]) next[timeSlot] = {};
        next[timeSlot] = { ...next[timeSlot] };
        next[timeSlot][court._id] = { status: 'closed', label: 'Closed', id: res?._id || null, reason: closeReason || '', court };
        return next;
      });

      setSuccessMessage('Slot closed');
      setTimeout(() => setSuccessMessage(''), 3000);
      setCloseDialogOpen(false);
      setCloseReason('');
      // refresh canonical schedule (in background)
      fetchDaySchedule(selectedDate);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close slot');
    } finally {
      setCloseProcessing(false);
    }
  };

  // open confirmation dialog for reopen
  const handleReopenSlot = (availabilityId, timeSlot, court) => {
    setReopenDialogInfo({ availabilityId, timeSlot, court });
    setReopenDialogOpen(true);
  };

  const performReopenSlot = async () => {
    const { availabilityId, timeSlot, court } = reopenDialogInfo || {};
    if (!availabilityId) return;
    try {
      setReopenProcessing(true);
      await availabilityService.deleteAvailability(availabilityId);

      // optimistic UI update: mark as available
      setDayData((prev) => {
        const next = { ...prev };
        if (!next[timeSlot]) return next;
        next[timeSlot] = { ...next[timeSlot] };
        next[timeSlot][court._id] = { status: 'available', label: 'Open', id: null, reason: null, court };
        return next;
      });

      setSuccessMessage('Slot reopened');
      setTimeout(() => setSuccessMessage(''), 3000);
      setReopenDialogOpen(false);
      setReopenDialogInfo({ timeSlot: null, court: null, availabilityId: null });
      // refresh canonical schedule
      fetchDaySchedule(selectedDate);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reopen slot');
    } finally {
      setReopenProcessing(false);
    }
  };

  // Classify bookings into ongoing / completed / cancelled for admin view
  const classifyBookings = (list) => {
    const ongoing = [];
    const completed = [];
    const cancelled = [];

    (list || []).forEach((b) => {
      if (b.status === 'cancelled') {
        cancelled.push(b);
      } else if (isTimeSlotExpired(b.date, b.timeSlot)) {
        completed.push(b);
      } else {
        ongoing.push(b);
      }
    });

    return { ongoing, completed, cancelled };
  };

  const { ongoing: ongoingBookings, completed: completedBookings, cancelled: cancelledBookings } = classifyBookings(bookings);
  const [bookingViewTab, setBookingViewTab] = useState('ongoing');

  // Helper: sort court lists using natural numeric ordering so names like
  // "Court 2" come before "Court 10".
  const sortByNameNumeric = (list) =>
    [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

  const badmintonCourts = sortByNameNumeric(courts.filter((c) => c.sport === 'badminton'));
  const tableTennisCourts = sortByNameNumeric(courts.filter((c) => c.sport === 'table-tennis'));

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
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-300">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={getToday()}
                  onChange={(e) => handleDateChange(e.target.value)}
                  onBlur={handleDateBlur}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none"
                />
              </div>
              <div className="text-sm text-slate-400">Click a cell to toggle Closed/Open. Booked cells are disabled.</div>
            </div>

            {/* Sport selector: Badminton / Table Tennis */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setAvailabilitySport('badminton')}
                className={`px-3 py-1 rounded ${availabilitySport === 'badminton' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                Badminton
              </button>
              <button
                onClick={() => setAvailabilitySport('table-tennis')}
                className={`px-3 py-1 rounded ${availabilitySport === 'table-tennis' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                Table Tennis
              </button>
            </div>

            <div className="overflow-auto max-h-[70vh]">
              <table className="w-full min-w-[900px] table-auto bg-slate-800 border border-slate-700">
                <thead>
                  <tr className="text-left">
                    <th className="sticky left-0 top-0 z-30 bg-slate-900 px-3 py-2 border-b border-slate-700 text-slate-300 w-44">Time</th>
                    {(availabilitySport === 'badminton' ? badmintonCourts : tableTennisCourts).map((court) => (
                      <th key={court._id} className="sticky top-0 bg-slate-800 z-20 px-3 py-2 border-b border-slate-700 text-slate-200">
                        <div className="text-sm font-semibold">{court.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot} className="align-top">
                      <td className="sticky left-0 bg-slate-900 z-20 px-3 py-2 border-b border-slate-700 text-slate-300 align-top">{formatTimeSlot(slot)}</td>
                      {(availabilitySport === 'badminton' ? badmintonCourts : tableTennisCourts).map((court) => {
                        const cell = dayData?.[slot]?.[court._id] || { status: 'available', label: 'Open' };
                        if (cell.status === 'booked') {
                          return (
                            <td key={court._id} className="px-3 py-2 border-b border-slate-700">
                              <div className="w-full flex items-center justify-center px-3 py-2 h-9 rounded-md bg-red-900/40 border border-red-800 text-red-100 text-sm">Booked</div>
                            </td>
                          );
                        }

                        if (cell.status === 'closed') {
                          return (
                            <td key={court._id} className="px-3 py-2 border-b border-slate-700">
                              <button
                                onClick={() => handleReopenSlot(cell.id, slot, court)}
                                className="w-full flex items-center justify-center px-3 py-2 h-9 rounded-md bg-slate-600 border border-slate-500 text-slate-100 text-sm"
                              >
                                <div>Closed</div>
                              </button>
                              {cell.reason && <div className="text-[11px] text-slate-400 mt-1">{cell.reason}</div>}
                            </td>
                          );
                        }

                        // available
                        return (
                          <td key={court._id} className="px-3 py-2 border-b border-slate-700">
                            <button
                              onClick={() => handleCloseSlot(slot, court)}
                              className="w-full flex items-center justify-center px-3 py-2 h-9 rounded-md bg-green-900/40 border border-green-800 text-green-100 text-sm"
                            >
                              Open
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Close-slot dialog */}
            {closeDialogOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setCloseDialogOpen(false)} />
                <div role="dialog" aria-modal="true" className="relative bg-slate-800 rounded-lg p-6 w-full max-w-md text-white z-60">
                  <h3 className="text-lg font-semibold mb-2">Close slot</h3>
                  <p className="text-sm text-slate-300 mb-3">{formatTimeSlot(closeDialogInfo.timeSlot)} — {closeDialogInfo.court?.name}</p>
                  <label className="block text-sm text-slate-300 mb-1">Reason (optional)</label>
                  <input
                    value={closeReason}
                    onChange={(e) => setCloseReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded mb-4 text-white"
                    placeholder="e.g., Maintenance"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setCloseDialogOpen(false)}
                      className="px-3 py-2 bg-slate-600 rounded text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={performCloseSlot}
                      disabled={closeProcessing}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-50"
                    >
                      {closeProcessing ? 'Closing...' : 'Confirm Close'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reopen confirmation dialog */}
            {reopenDialogOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setReopenDialogOpen(false)} />
                <div role="dialog" aria-modal="true" className="relative bg-slate-800 rounded-lg p-6 w-full max-w-md text-white z-60">
                  <h3 className="text-lg font-semibold mb-2">Reopen slot?</h3>
                  <p className="text-sm text-slate-300 mb-3">Are you sure you want to reopen {formatTimeSlot(reopenDialogInfo.timeSlot)} — {reopenDialogInfo.court?.name}?</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReopenDialogOpen(false)}
                      className="px-3 py-2 bg-slate-600 rounded text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={performReopenSlot}
                      disabled={reopenProcessing}
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
                    >
                      {reopenProcessing ? 'Opening...' : 'Confirm Reopen'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-sm bg-green-900/40 border border-green-800" />
                <span className="text-sm text-slate-300">Open</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-sm bg-red-900/40 border border-red-800" />
                <span className="text-sm text-slate-300">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-sm bg-slate-600 border border-slate-500" />
                <span className="text-sm text-slate-300">Closed</span>
              </div>
            </div>
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
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="text-lg text-white font-semibold mb-3">Badminton Courts</h3>
                {badmintonCourts.length === 0 ? (
                  <p className="text-slate-400">No badminton courts.</p>
                ) : (
                  <div className="grid gap-4">
                    {badmintonCourts.map((court) => (
                      <div key={court._id} className="p-4 bg-slate-700 rounded-lg border-l-4 border-l-blue-500 border border-slate-600">
                        <strong className="text-white">{court.name}</strong> <span className="text-slate-300">- 🏸 Badminton</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg text-white font-semibold mb-3">Table Tennis Courts</h3>
                {tableTennisCourts.length === 0 ? (
                  <p className="text-slate-400">No table tennis courts.</p>
                ) : (
                  <div className="grid gap-4">
                    {tableTennisCourts.map((court) => (
                      <div key={court._id} className="p-4 bg-slate-700 rounded-lg border-l-4 border-l-blue-500 border border-slate-600">
                        <strong className="text-white">{court.name}</strong> <span className="text-slate-300">- 🏓 Table Tennis</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            {/* Bookings sub-tabs: Ongoing / Completed / Cancelled */}
            <div className="flex gap-4 mb-6 border-b border-slate-700">
              <button
                className={`px-4 py-2 bg-transparent border-none cursor-pointer text-sm transition-all ${
                  bookingViewTab === 'ongoing' ? 'text-blue-400 font-semibold border-b-2 border-b-blue-500' : 'text-slate-400 hover:text-blue-400'
                }`}
                onClick={() => setBookingViewTab('ongoing')}
              >
                Ongoing ({ongoingBookings.length})
              </button>
              <button
                className={`px-4 py-2 bg-transparent border-none cursor-pointer text-sm transition-all ${
                  bookingViewTab === 'completed' ? 'text-blue-400 font-semibold border-b-2 border-b-blue-500' : 'text-slate-400 hover:text-blue-400'
                }`}
                onClick={() => setBookingViewTab('completed')}
              >
                Completed ({completedBookings.length})
              </button>
              <button
                className={`px-4 py-2 bg-transparent border-none cursor-pointer text-sm transition-all ${
                  bookingViewTab === 'cancelled' ? 'text-blue-400 font-semibold border-b-2 border-b-blue-500' : 'text-slate-400 hover:text-blue-400'
                }`}
                onClick={() => setBookingViewTab('cancelled')}
              >
                Cancelled ({cancelledBookings.length})
              </button>
            </div>
            {loading ? (
              <div className="text-slate-300">Loading bookings...</div>
            ) : (
              <div className="grid gap-4">
                {(bookingViewTab === 'ongoing' ? ongoingBookings : bookingViewTab === 'completed' ? completedBookings : cancelledBookings).map((booking) => {
                  const displayStatus = booking.status === 'cancelled'
                    ? 'Cancelled'
                    : bookingViewTab === 'ongoing'
                      ? 'Ongoing'
                      : bookingViewTab === 'completed'
                        ? 'Completed'
                        : booking.status;

                  return (
                    <div key={booking._id} className="p-6 bg-slate-700 rounded-lg border-l-4 border-l-blue-500 border border-slate-600">
                      <div className="my-2 text-white">
                        <strong>{booking.user?.name}</strong> <span className="text-slate-300">({booking.user?.email})</span>
                      </div>
                      <div className="my-2 text-slate-300">
                        {booking.sport === 'badminton' ? '🏸' : '🏓'} {booking.sport} - {booking.court?.name}
                      </div>
                      <div className="my-2 text-slate-300">
                        {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}
                      </div>
                      <div className="my-2 text-slate-300">Status: <span className="text-white font-semibold">{displayStatus}</span></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

