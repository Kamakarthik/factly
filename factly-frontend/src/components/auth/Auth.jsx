import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const { data, error } = await signUp(email, password, username);

        if (error) {
          setError(error.message);
          return;
        }

        if (data?.user?.identities?.length === 0) {
          // This is a duplicate email (dummy user returned)
          setError('Email already in use. Please log in.');
          return;
        }
        // Success case
        setEmail('');
        setPassword('');
        setUsername('');
        alert('Account created! You can now log in.');
        setIsLogin(true); // Switch to login mode
      }
    } catch (err) {
      console.log('Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {/*Show username field only on signup */}
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="auth-input"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="auth-input"
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-large">
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="auth-link"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
