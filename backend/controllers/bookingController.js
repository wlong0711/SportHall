const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Availability = require('../models/Availability');
const { isWeekend, isPastDate, isCurrentMonth, isTimeSlotExpired } = require('../utils/dateUtils');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { sport, courtId, date, timeSlot, participants } = req.body;
    const userId = req.user.id;

    // Validation
    if (!sport || !courtId || !date || !timeSlot || !participants) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (participants.length === 0 || participants.length > 6) {
      return res.status(400).json({ message: 'Participants must be between 1 and 6 people' });
    }

    // Validate participants data
    for (const participant of participants) {
      if (!participant.name || !participant.email) {
        return res.status(400).json({ message: 'All participants must have name and email' });
      }
    }

    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Check if date is weekend
    if (isWeekend(bookingDate)) {
      return res.status(400).json({ message: 'Bookings are not allowed on weekends' });
    }

    // Check if date is in the past
    if (isPastDate(bookingDate)) {
      return res.status(400).json({ message: 'Cannot book past dates' });
    }

    // Check if date is in current month
    if (!isCurrentMonth(bookingDate)) {
      return res.status(400).json({ message: 'Bookings are only allowed for the current month' });
    }

    // Check if time slot is expired
    if (isTimeSlotExpired(bookingDate, timeSlot)) {
      return res.status(400).json({ message: 'This time slot has already passed' });
    }

    // Check if court exists
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Check if court matches the sport
    if (court.sport !== sport) {
      return res.status(400).json({ message: 'Court does not match the selected sport' });
    }

    // Check if user already has a booking for this sport and date
    const existingBooking = await Booking.findOne({
      user: userId,
      sport,
      date: bookingDate,
      status: 'confirmed',
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'You can only book one sport and one court per day',
      });
    }

    // Check if court is available (check availability settings)
    const availability = await Availability.findOne({
      date: bookingDate,
      timeSlot,
      $or: [
        { sport: 'all' },
        { sport },
      ],
      $or: [
        { court: null },
        { court: courtId },
      ],
      isAvailable: false,
    });

    if (availability) {
      return res.status(400).json({ message: 'This time slot is not available' });
    }

    // Check if court is already booked
    const conflictingBooking = await Booking.findOne({
      court: courtId,
      date: bookingDate,
      timeSlot,
      status: 'confirmed',
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'This court is already booked for this time slot' });
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      sport,
      court: courtId,
      date: bookingDate,
      timeSlot,
      participants,
    });

    await booking.populate('court', 'name sport');

    res.status(201).json(booking);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You already have a booking for this sport, date, and court',
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.find({ user: userId })
      .populate('court', 'name sport')
      .sort({ date: -1, timeSlot: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { date, sport, court } = req.query;
    const query = {};

    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      query.date = queryDate;
    }

    if (sport) {
      query.sport = sport;
    }

    if (court) {
      query.court = court;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('court', 'name sport')
      .sort({ date: -1, timeSlot: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

