const express = require('express');
const router = express.Router();
const {
  setAvailability,
  getAvailability,
  deleteAvailability,
} = require('../controllers/availabilityController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, admin, setAvailability);
router.get('/', getAvailability);
router.delete('/:id', auth, admin, deleteAvailability);

module.exports = router;

