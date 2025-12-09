const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a court name'],
      trim: true,
    },
    sport: {
      type: String,
      enum: ['badminton', 'table-tennis'],
      required: [true, 'Please specify the sport'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Court', courtSchema);

