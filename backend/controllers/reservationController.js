const Reservation = require('../models/Reservation');
const { validateReservationInput } = require('../validators/reservationValidator');
const { assignTable } = require('../services/reservationService');

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private (Customer)
const createReservation = async (req, res, next) => {
  try {
    const { reservationDate, timeSlot, guests } = req.body;

    // 1. Validation (early fail)
    const validData = await validateReservationInput(reservationDate, timeSlot, guests);

    // 2. Business logic: find available table
    const assignedTable = await assignTable(validData.parsedDate, validData.timeSlot, validData.guests);

    // 3. Save to database
    const reservation = await Reservation.create({
      user: req.user._id,
      table: assignedTable._id,
      reservationDate: validData.parsedDate,
      timeSlot: validData.timeSlot,
      guests: validData.guests,
    });

    res.status(201).json(reservation);
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(error.status || 400); // 400 for validation, 409 for conflict
    }
    next(error);
  }
};

// @desc    Get logged in user's reservations
// @route   GET /api/reservations/me
// @access  Private (Customer)
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table', 'tableNumber capacity')
      .sort({ reservationDate: 1 });
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private (Admin)
const getReservations = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.date) {
      // Filter by date if provided in query string
      query.reservationDate = new Date(req.query.date);
    }

    const reservations = await Reservation.find(query)
      .populate('user', 'name email')
      .populate('table', 'tableNumber')
      .sort({ reservationDate: 1 });
    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a reservation (Admin only)
// @route   PUT /api/reservations/:id
// @access  Private (Admin)
const updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      res.status(404);
      throw new Error('Reservation not found');
    }

    // Admins can update any details.
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedReservation);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a reservation (Soft delete)
// @route   PATCH /api/reservations/:id/cancel
// @access  Private (Customer/Admin)
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      res.status(404);
      throw new Error('Reservation not found');
    }

    // Check ownership if user is a customer
    if (req.user.role === 'customer' && reservation.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this reservation');
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json(reservation);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservations,
  updateReservation,
  cancelReservation,
};
