import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

const Header = ({ showForm, setShowForm }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error logging out');
    }
  };

  // Get display name and avatar from user object
  const displayName = user?.username || user?.email;
  const avatarUrl = user?.avatarUrl || '/default-avatar.svg';

  // Determine current page from URL
  const isProfilePage = location.pathname === '/profile' || location.pathname.startsWith('/user/');
  const isHomePage = location.pathname === '/';

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Factly" />
        <h1>Factly</h1>
      </div>

      {/* Only show user info on home page */}
      {isHomePage && (
        <div className="user-info">
          <img
            src={avatarUrl || '/default-avatar.svg'}
            alt={displayName || 'User'}
            className="user-avatar"
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
            title="View Profile"
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
            }}
          />
          <span className="user-email">{displayName}</span>
        </div>
      )}

      <div className="header-actions">
        {isProfilePage && (
          <button className="btn btn-large" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        )}
        {isHomePage && (
          <button
            className="btn btn-large btn-open"
            onClick={() => setShowForm((show) => !show)}
          >
            {showForm ? 'Close' : 'Share a fact'}
          </button>
        )}
        <button className="btn btn-large" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
