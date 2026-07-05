import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TIME_SLOTS = [
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '18:00-19:00',
  '19:00-20:00',
  '20:00-21:00',
];

const CreateReservation = () => {
  const [reservationDate, setReservationDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/reservations', {
        reservationDate,
        timeSlot,
        guests: Number(guests),
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    }
  };

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Book a Table</h2>
      {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={reservationDate}
            min={today}
            onChange={(e) => setReservationDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Time Slot</label>
          <select 
            value={timeSlot} 
            onChange={(e) => setTimeSlot(e.target.value)}
            required
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Number of Guests</label>
          <input
            type="number"
            min="1"
            max="20"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Confirm Reservation
        </button>
      </form>
    </div>
  );
};

export default CreateReservation;
