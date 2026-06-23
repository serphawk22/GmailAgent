import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertTriangle, ArrowLeft, Info } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: 'landing' | 'login' | 'dashboard') => void;
  onLoginSuccess: (token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setIsLoading(true);

    // Simulate simple login check
    setTimeout(() => {
      setIsLoading(false);
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
      
      if (username.trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPassword) {
        onLoginSuccess('simulated-jwt-token-xyz');
        onNavigate('dashboard');
      } else {
        setError('Invalid admin credentials. Please check your .env configuration.');
      }
    }, 1000);
  };

  return (
    <div className="animate-fade-in flex-center login-container">
      <div className="glass-panel login-card">
        
        {/* Back Link */}
        <button 
          onClick={() => onNavigate('landing')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-gray-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--mono)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            marginBottom: '24px',
            padding: 0
          }}
          className="cursor-glow"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Admin <span className="text-neon-glow">Login</span>
          </h2>
          <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.85rem' }}>
            Authenticate to manage the n8n outbound pipelines
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 75, 75, 0.1)',
            border: '1px solid rgba(255, 75, 75, 0.3)',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '24px',
            color: '#ff4b4b',
            fontSize: '0.85rem'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Username Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>
              ADMIN EMAIL
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray-muted)' }}>
                <User size={18} />
              </span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin email"
                className="custom-input"
                style={{ width: '100%', paddingLeft: '44px' }}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--text-gray-light)' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray-muted)' }}>
                <Lock size={18} />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="custom-input"
                style={{ width: '100%', paddingLeft: '44px', paddingRight: '44px' }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-gray-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary flex-center"
            style={{ width: '100%', marginTop: '10px', height: '48px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid var(--bg-dark-pure)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></div>
            ) : (
              'Authenticate'
            )}
          </button>
        </form>

        {/* Info Tip */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontFamily: 'var(--mono)',
          fontSize: '0.75rem',
          color: 'var(--text-gray-muted)',
          borderTop: '1px dashed var(--border-green-dim)',
          paddingTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <Info size={14} style={{ color: 'var(--primary-green)' }} />
          <span>Please use the admin credentials configured in the .env file.</span>
        </div>
      </div>

      {/* Embedded CSS for spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
