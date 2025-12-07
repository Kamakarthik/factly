import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import API from '../../utils/api';
import { PacmanLoader } from 'react-spinners';
import './UserSettings.css';

export default function UserSettings({ onClose }) {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Account settings state
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password change state
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Handle account settings update
  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await API.patch('/users/updateMe', {
        username,
        email,
      });

      const updatedUser = response.data.data.user;
      // Update user state globally
      updateUser({
        username: updatedUser.username,
        email: updatedUser.email,
      });

      alert('Account updated successfully!');
      // Reload the entire page to fetch fresh user data
      //   window.location.reload();
    } catch (error) {
      console.error('Update error:', error);
      alert(
        error.response?.data?.message ||
          'Failed to update account. Please try again.'
      );
      setIsLoading(false);
    }
  };

  // Handle password change
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      alert('New passwords do not match!');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    setIsLoading(true);

    try {
      await API.patch('/users/updatePassword', {
        passwordCurrent,
        password,
        passwordConfirm,
      });

      alert('Password updated successfully!');
      // Clear password fields
      setPasswordCurrent('');
      setPassword('');
      setPasswordConfirm('');
    } catch (error) {
      console.error('Password update error:', error);
      alert(
        error.response?.data?.message ||
          'Failed to update password. Please check your current password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="settings-container">
        <p className="loading-text">
          <PacmanLoader color="#F59E0B" />
        </p>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-content">
        <div className="settings-header">
          <h2>User Settings</h2>
          <button className="settings-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Account Settings Section */}
        <div className="settings-section">
          <h3 className="section-title">Your Account Settings</h3>
          <form className="settings-form" onSubmit={handleUpdateAccount}>
            <div className="form-field">
              <label htmlFor="username">Name</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-large"
              disabled={isLoading}
            >
              Save Settings
            </button>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="settings-section">
          <h3 className="section-title">Password Change</h3>
          <form className="settings-form" onSubmit={handleUpdatePassword}>
            <div className="form-field">
              <label htmlFor="passwordCurrent">Current password</label>
              <input
                id="passwordCurrent"
                type="password"
                value={passwordCurrent}
                onChange={(e) => setPasswordCurrent(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="form-field">
              <label htmlFor="passwordConfirm">Confirm password</label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-large"
              disabled={isLoading}
            >
              Save Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
