const Availability = require('../models/Availability');
const Court = require('../models/Court');

// @desc    Set availability (close/open dates or time slots)
// @route   POST /api/availability
// @access  Private/Admin
exports.setAvailability = async (req, res) => {
  try {
    const { date, timeSlot, sport, courtId, isAvailable, reason } = req.body;

    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Please provide date and timeSlot' });
    }

    const availabilityDate = new Date(date);
    availabilityDate.setHours(0, 0, 0, 0);

    // If courtId is provided, verify it exists
    if (courtId) {
      const court = await Court.findById(courtId);
      if (!court) {
        return res.status(404).json({ message: 'Court not found' });
      }
    }

    const availability = await Availability.findOneAndUpdate(
      {
        date: availabilityDate,
        timeSlot,
        sport: sport || 'all',
        court: courtId || null,
      },
      {
        date: availabilityDate,
        timeSlot,
        sport: sport || 'all',
        court: courtId || null,
        isAvailable: isAvailable !== undefined ? isAvailable : false,
        reason: reason || '',
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get availability
// @route   GET /api/availability
// @access  Public
exports.getAvailability = async (req, res) => {
  try {
    const { date, timeSlot, sport, courtId } = req.query;

    const query = {};

    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      query.date = queryDate;
    }

    if (timeSlot) {
      query.timeSlot = timeSlot;
    }

    if (sport) {
      query.$or = [{ sport: 'all' }, { sport }];
    }

    if (courtId) {
      query.$or = [
        { court: null },
        { court: courtId },
      ];
    }

    const availability = await Availability.find(query).populate('court', 'name sport');
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete availability setting
// @route   DELETE /api/availability/:id
// @access  Private/Admin
exports.deleteAvailability = async (req, res) => {
  try {
    const availability = await Availability.findByIdAndDelete(req.params.id);

    if (!availability) {
      return res.status(404).json({ message: 'Availability setting not found' });
    }

    res.json({ message: 'Availability setting deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

