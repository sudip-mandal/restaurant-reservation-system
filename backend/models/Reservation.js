const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    reservationDate: {
      type: Date,
      required: [true, 'Please add a reservation date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please add a time slot'],
      // Example values: '18:00-19:00', '19:00-20:00'
    },
    guests: {
      type: Number,
      required: [true, 'Please add number of guests'],
      min: [1, 'At least 1 guest required'],
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

module.exports = mongoose.model('Reservation', reservationSchema);
