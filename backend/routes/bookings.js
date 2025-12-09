const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getMyBookings);
router.get('/', auth, admin, getAllBookings);
router.put('/:id/cancel', auth, cancelBooking);

module.exports = router;

