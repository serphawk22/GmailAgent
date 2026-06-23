import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { GmailAgent } from './components/GmailAgent';
import { SentEmails } from './components/SentEmails';
import { Activity, Menu, X } from 'lucide-react';
import LightRays from './components/LightRays';
import ShapeGrid from './components/ShapeGrid';

type Page = 'landing' | 'login' | 'dashboard' | 'sent-emails';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  // Check localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage 
            onNavigate={setCurrentPage} 
            isAuthenticated={isAuthenticated} 
          />
        );
      case 'login':
        return (
          <LoginPage 
            onNavigate={setCurrentPage} 
            onLoginSuccess={handleLoginSuccess} 
          />
        );
      case 'dashboard':
        return isAuthenticated ? (
          <GmailAgent onNavigate={setCurrentPage} />
        ) : (
          <LoginPage 
            onNavigate={setCurrentPage} 
            onLoginSuccess={handleLoginSuccess} 
          />
        );
      case 'sent-emails':
        return isAuthenticated ? (
          <SentEmails onNavigate={setCurrentPage} />
        ) : (
          <LoginPage 
            onNavigate={setCurrentPage} 
            onLoginSuccess={handleLoginSuccess} 
          />
        );
      default:
        return <LandingPage onNavigate={setCurrentPage} isAuthenticated={isAuthenticated} />;
    }
  };

  return (
    <>
      {/* Background Grids & Glows */}
      <div className="grid-bg-container">
        {currentPage === 'dashboard' ? (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            <ShapeGrid 
              speed={0.3} 
              size={40}
              direction="diagonal"
              borderColor="rgba(255, 255, 255, 0.03)"
              hoverColor="rgba(255, 255, 255, 0.08)"
              shape="square"
              hoverTrailAmount={5}
            />
          </div>
        ) : (
          <>
            <div className="grid-bg-lines"></div>
            <div className="grid-bg-glow"></div>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '800px', zIndex: 1, pointerEvents: 'none' }}>
              <LightRays
                raysOrigin="top-center"
                raysColor="#ffffff"
                raysSpeed={1}
                lightSpread={0.5}
                rayLength={3}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0}
                distortion={0}
                className="custom-rays"
                pulsating={false}
                fadeDistance={1}
                saturation={1}
              />
            </div>
          </>
        )}
      </div>

      {/* Navigation Header */}
      <header className="nav-header">
        <div 
          className="nav-logo" 
          onClick={() => {
            setCurrentPage('landing');
            setMobileMenuOpen(false);
          }}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 600, fontSize: '1.25rem', fontFamily: 'var(--mono)' }}>
            <Activity size={20} style={{ color: '#ffffff' }} />
            SERPbot
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            <li>
              <button 
                onClick={() => setCurrentPage('landing')}
                className={`nav-link ${currentPage === 'landing' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none' }}
              >
                Home
              </button>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <button 
                    onClick={() => setCurrentPage('dashboard')}
                    className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    Console
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentPage('sent-emails')}
                    className={`nav-link ${currentPage === 'sent-emails' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    Sent History
                  </button>
                </li>
              </>
            ) : null}
            <li>
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Logout
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentPage('login')}
                  style={{ 
                    background: 'transparent',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </nav>

        {/* Mobile Navigation Toggle */}
        <button 
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'none', // Managed via CSS Media Queries
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            zIndex: 110
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation Menu Panel */}
        <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-nav-links">
            <li>
              <button 
                onClick={() => {
                  setCurrentPage('landing');
                  setMobileMenuOpen(false);
                }}
                className={`mobile-nav-link ${currentPage === 'landing' ? 'active' : ''}`}
              >
                Home
              </button>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentPage('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className={`mobile-nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                  >
                    Console
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setCurrentPage('sent-emails');
                      setMobileMenuOpen(false);
                    }}
                    className={`mobile-nav-link ${currentPage === 'sent-emails' ? 'active' : ''}`}
                  >
                    Sent History
                  </button>
                </li>
              </>
            ) : null}
            <li>
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-nav-btn btn-logout"
                >
                  Logout
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setCurrentPage('login');
                    setMobileMenuOpen(false);
                  }}
                  className="mobile-nav-btn btn-login"
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="content-wrapper">
        {renderPage()}
      </main>

      {/* Unified Footer */}
      <footer className="main-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span>SERPbot digital marketing outreach system &copy; {new Date().getFullYear()}.</span>
          <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-gray-muted)' }}>
            "Opportunities do not happen. You create them."
          </span>
        </div>
      </footer>
    </>
  );
}

export default App;
