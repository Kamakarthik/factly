import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import supabase from '../../utils/supabase';
import './Header.css';

const Header = ({ showForm, setShowForm, onNavigate, currentPage }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);

  // Fetch profile from profiles table
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Profile will remain null, fallback to user metadata
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error logging out');
    }
  };

  // Get username from metadata, fallback to email
  const displayName =
    profile?.username || user?.user_metadata?.username || user?.email;

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Factly" />
        <h1>Factly</h1>
      </div>

      {currentPage !== 'profile' && (
        <div className="user-info">
          <img
            src={profile?.avatar_url || '/default-avatar.svg'}
            alt={profile?.username || 'User'}
            className="user-avatar"
            onClick={() => onNavigate('profile')}
            style={{ cursor: 'pointer' }}
            title="View Profile"
          />
          <span className="user-email">{displayName}</span>
        </div>
      )}

      <div className="header-actions">
        {currentPage === 'profile' && (
          <button className="btn btn-large" onClick={() => onNavigate('home')}>
            ← Back to Home
          </button>
        )}
        {currentPage !== 'profile' && (
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
