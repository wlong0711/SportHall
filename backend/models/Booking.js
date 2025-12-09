const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a user'],
    },
    sport: {
      type: String,
      enum: ['badminton', 'table-tennis'],
      required: [true, 'Please specify the sport'],
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      required: [true, 'Please select a court'],
    },
    date: {
      type: Date,
      required: [true, 'Please select a date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a time slot'],
    },
    participants: {
      type: [participantSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0 && v.length <= 6;
        },
        message: 'Participants must be between 1 and 6 people',
      },
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

// Index to prevent duplicate bookings (one sport + one court per day per user)
bookingSchema.index({ user: 1, sport: 1, date: 1, court: 1 }, { unique: true });

// Index for efficient queries
bookingSchema.index({ date: 1, timeSlot: 1, court: 1 });
bookingSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Booking', bookingSchema);

