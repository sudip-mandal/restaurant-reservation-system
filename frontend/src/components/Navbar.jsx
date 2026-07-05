import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container header-content">
        <h2>
          <Link to="/">Restaurant Reservations</Link>
        </h2>
        <nav className="nav-links">
          {user ? (
            <>
              {user.role === 'customer' && (
                <Link to="/create-reservation" className="btn btn-primary">
                  New Reservation
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-danger">
                Logout ({user.name})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
