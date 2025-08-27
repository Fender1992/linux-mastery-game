import React, { useState } from 'react';
import authService from '../services/authService';

const AuthModal = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        const user = await authService.register(
          formData.username,
          formData.email,
          formData.password
        );
        onSuccess(user);
      } else {
        const user = await authService.login(
          formData.username,
          formData.password
        );
        onSuccess(user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="auth-modal">
      <div className="auth-container">
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <div className="auth-header">
          <h2>{mode === 'login' ? '🔐 Login' : '📝 Create Account'}</h2>
          <p>
            {mode === 'login' 
              ? 'Welcome back! Login to save your progress'
              : 'Join the Linux Masters community!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {mode === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <button onClick={switchMode} className="switch-mode-btn">
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </div>

        <div className="auth-benefits">
          <h4>🎮 Benefits of Creating an Account:</h4>
          <ul>
            <li>✅ Save your progress across devices</li>
            <li>✅ Compete on global leaderboards</li>
            <li>✅ Unlock exclusive achievements</li>
            <li>✅ Track your learning journey</li>
            <li>✅ Join the community</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;