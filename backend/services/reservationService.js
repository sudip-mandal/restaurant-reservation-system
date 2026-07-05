const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

const assignTable = async (reservationDate, timeSlot, guests) => {
  // Query all tables, sorted by capacity ascending to optimize seating
  const allTables = await Table.find().sort({ capacity: 1 });

  // Filter out tables that are too small
  const suitableTables = allTables.filter((table) => table.capacity >= guests);

  if (suitableTables.length === 0) {
    throw new Error('No tables large enough for this party size exist');
  }

  // Get all confirmed reservations for this exact date and time slot
  const conflictingReservations = await Reservation.find({
    reservationDate,
    timeSlot,
    status: 'confirmed',
  });

  const bookedTableIds = conflictingReservations.map((res) => res.table.toString());

  // Find the first suitable table that isn't booked
  let assignedTable = null;
  for (const table of suitableTables) {
    if (!bookedTableIds.includes(table._id.toString())) {
      assignedTable = table;
      break;
    }
  }

  if (!assignedTable) {
    const error = new Error('No tables available for the requested time slot and party size');
    error.status = 409;
    throw error;
  }

  return assignedTable;
};

module.exports = {
  assignTable,
};
