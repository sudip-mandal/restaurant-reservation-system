const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getReservations,
  updateReservation,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createReservation)
  .get(protect, admin, getReservations);

router.get('/me', protect, getMyReservations);

router.route('/:id')
  .put(protect, admin, updateReservation);

router.patch('/:id/cancel', protect, cancelReservation);

module.exports = router;
