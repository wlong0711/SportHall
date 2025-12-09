const express = require('express');
const router = express.Router();
const {
  getCourts,
  getAvailableCourts,
  createCourt,
} = require('../controllers/courtController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', getCourts);
router.get('/available', getAvailableCourts);
router.post('/', auth, admin, createCourt);

module.exports = router;

