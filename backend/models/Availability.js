const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Please specify a date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please specify a time slot'],
    },
    sport: {
      type: String,
      enum: ['badminton', 'table-tennis', 'all'],
      default: 'all',
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Court',
      default: null, // null means all courts for that sport
    },
    isAvailable: {
      type: Boolean,
      default: false, // false means closed/unavailable
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
availabilitySchema.index({ date: 1, timeSlot: 1, sport: 1, court: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);

