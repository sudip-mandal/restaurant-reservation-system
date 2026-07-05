import { useState, useEffect } from 'react';
import api from '../api';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  // Edit Modal State
  const [editingReservation, setEditingReservation] = useState(null);
  const [editForm, setEditForm] = useState({ reservationDate: '', timeSlot: '', guests: 1 });
  const [editError, setEditError] = useState('');

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

  const handleEditClick = (reservation) => {
    setEditingReservation(reservation);
    setEditForm({
      reservationDate: new Date(reservation.reservationDate).toISOString().split('T')[0],
      timeSlot: reservation.timeSlot,
      guests: reservation.guests
    });
    setEditError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      await api.put(`/api/reservations/${editingReservation._id}`, editForm);
      setEditingReservation(null);
      fetchReservations();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update reservation');
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEditClick(res)} 
                          className="btn" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleCancel(res._id)} 
                          className="btn btn-danger" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingReservation && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Edit Reservation</h3>
            {editError && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{editError}</div>}
            
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  required 
                  value={editForm.reservationDate} 
                  onChange={(e) => setEditForm({...editForm, reservationDate: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label>Time Slot</label>
                <select 
                  required 
                  value={editForm.timeSlot} 
                  onChange={(e) => setEditForm({...editForm, timeSlot: e.target.value})}
                >
                  <option value="">Select Time</option>
                  <option value="18:00">18:00 (6:00 PM)</option>
                  <option value="19:00">19:00 (7:00 PM)</option>
                  <option value="20:00">20:00 (8:00 PM)</option>
                  <option value="21:00">21:00 (9:00 PM)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Guests</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  max="20"
                  value={editForm.guests} 
                  onChange={(e) => setEditForm({...editForm, guests: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setEditingReservation(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservations;
