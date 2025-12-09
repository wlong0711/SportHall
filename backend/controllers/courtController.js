const Court = require('../models/Court');
const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const { isWeekend, isPastDate, isCurrentMonth, isTimeSlotExpired } = require('../utils/dateUtils');

// @desc    Get all courts
// @route   GET /api/courts
// @access  Public
exports.getCourts = async (req, res) => {
  try {
    const { sport } = req.query;
    const query = { isActive: true };

    if (sport) {
      query.sport = sport;
    }

    const courts = await Court.find(query).sort({ name: 1 });
    res.json(courts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available courts for a date and time slot
// @route   GET /api/courts/available
// @access  Public
exports.getAvailableCourts = async (req, res) => {
  try {
    const { sport, date, timeSlot } = req.query;

    if (!sport || !date || !timeSlot) {
      return res.status(400).json({ message: 'Please provide sport, date, and timeSlot' });
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Get all courts for the sport
    const allCourts = await Court.find({ sport, isActive: true });

    // Get bookings for this date and time slot
    const bookings = await Booking.find({
      sport,
      date: bookingDate,
      timeSlot,
      status: 'confirmed',
    });

    const bookedCourtIds = bookings.map((b) => b.court.toString());

    // Get availability restrictions
    const unavailableSlots = await Availability.find({
      date: bookingDate,
      timeSlot,
      $or: [{ sport: 'all' }, { sport }],
      isAvailable: false,
    });

    const unavailableCourtIds = unavailableSlots
      .filter((slot) => slot.court)
      .map((slot) => slot.court.toString());

    // Filter out booked and unavailable courts
    const availableCourts = allCourts.filter(
      (court) =>
        !bookedCourtIds.includes(court._id.toString()) &&
        !unavailableCourtIds.includes(court._id.toString())
    );

    res.json(availableCourts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a court (Admin)
// @route   POST /api/courts
// @access  Private/Admin
exports.createCourt = async (req, res) => {
  try {
    const { name, sport } = req.body;

    if (!name || !sport) {
      return res.status(400).json({ message: 'Please provide name and sport' });
    }

    const court = await Court.create({ name, sport });
    res.status(201).json(court);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

