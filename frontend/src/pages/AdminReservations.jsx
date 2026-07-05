import { useState, useEffect } from 'react';
import api from '../api';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const url = filterDate 
        ? `/api/reservations?date=${filterDate}` 
        : '/api/reservations';
      const { data } = await api.get(url);
      setReservations(data);
    } catch (err) {
      setError('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filterDate]);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await api.patch(`/api/reservations/${id}/cancel`);
        fetchReservations();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel reservation');
      }
    }
  };

  return (
    <div className="card">
      <div className="header-content" style={{ marginBottom: '1.5rem', borderBottom: 'none', padding: 0 }}>
        <h2>All Reservations (Admin)</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="dateFilter" style={{ fontWeight: 500 }}>Filter by Date:</label>
          <input
            id="dateFilter"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ padding: '0.25rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}
          />
          {filterDate && (
            <button onClick={() => setFilterDate('')} className="btn" style={{ padding: '0.25rem 0.5rem' }}>
              Clear
            </button>
          )}
        </div>
      </div>
      
      {error && <div style={{ color: 'var(--error)' }}>{error}</div>}
      
      {loading ? (
        <div>Loading...</div>
      ) : reservations.length === 0 ? (
        <p>No reservations found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
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
                  <td>
                    <div>{res.user?.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{res.user?.email}</div>
                  </td>
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

export default AdminReservations;
