import { useState, useEffect } from 'react';
import api from '../api';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReservations = async () => {
    try {
      const { data } = await api.get('/api/reservations/me');
      setReservations(data);
    } catch (err) {
      setError('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await api.patch(`/api/reservations/${id}/cancel`);
        fetchReservations(); // Refresh list
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel reservation');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem' }}>My Reservations</h2>
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      
      {reservations.length === 0 ? (
        <p>You have no reservations yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Guests</th>
                <th>Table #</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res._id}>
                  <td>{new Date(res.reservationDate).toLocaleDateString()}</td>
                  <td>{res.timeSlot}</td>
                  <td>{res.guests}</td>
                  <td>{res.table?.tableNumber}</td>
                  <td>
                    <span className={`badge ${res.status === 'confirmed' ? 'badge-success' : 'badge-danger'}`}>
                      {res.status}
                    </span>
                  </td>
                  <td>
                    {res.status === 'confirmed' && (
                      <button 
                        onClick={() => handleCancel(res._id)} 
                        className="btn btn-danger" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyReservations;
