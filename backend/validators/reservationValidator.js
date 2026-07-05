const Table = require('../models/Table');

const validateReservationInput = async (reservationDate, timeSlot, guests) => {
  if (!reservationDate || !timeSlot || !guests) {
    throw new Error('Please provide date, time slot, and number of guests');
  }

  const parsedDate = new Date(reservationDate);
  if (isNaN(parsedDate)) {
    throw new Error('Invalid reservation date format');
  }

  // Ensure date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of today
  if (parsedDate < today) {
    throw new Error('Reservation date cannot be in the past');
  }

  if (guests <= 0) {
    throw new Error('Guest count must be at least 1');
  }

  // Find the max table capacity to fail early if party is too large
  const largestTable = await Table.findOne().sort({ capacity: -1 });
  if (!largestTable) {
    throw new Error('System error: No tables configured in the restaurant');
  }

  if (guests > largestTable.capacity) {
    throw new Error(`Party size exceeds maximum restaurant table capacity of ${largestTable.capacity}`);
  }

  return { parsedDate, timeSlot, guests };
};

module.exports = {
  validateReservationInput,
};
