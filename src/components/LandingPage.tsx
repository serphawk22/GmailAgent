import React from 'react';
import { Shield, Cpu, Languages, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'login' | 'dashboard') => void;
  isAuthenticated: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, isAuthenticated }) => {
  return (
    <div className="animate-fade-in" style={{ zIndex: 1, position: 'relative' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <span className="hero-badge-tag">PRODUCTION</span>
          <span className="hero-badge-text">v1.0.0 Gmail Agent Outreach Core</span>
        </div>
        
        <h1 className="hero-title">
          Outreach at Zero Gravity.
        </h1>
        
        <p className="hero-subtitle">
          "Opportunities do not happen. You create them."
        </p>

        <div className="hero-actions">
          <button 
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'login')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#cbd5e1',
              color: '#0b0a0f',
              border: 'none',
              fontFamily: 'var(--sans)',
              fontWeight: 600,
              padding: '14px 30px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              transition: 'background-color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#cbd5e1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>{isAuthenticated ? 'Open Control Panel' : 'Launch Outreach Console'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section">
        <h2 className="features-title">
          Designed for <span className="text-neon-glow">High-Fidelity</span> Performance
        </h2>
        <p className="features-description">
          By splitting user interfaces from heavy processing engines, SERPbot achieves blazing-fast page loads while maintaining high availability.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '24px',
          marginTop: '20px'
        }}>
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '32px', textAlign: 'left' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '8px', 
              background: 'rgba(255, 255, 255, 0.04)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary-green)',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', fontFamily: 'var(--sans)' }}>Bypass IP Blocks</h3>
            <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Built-in proxy rotation and CAPTCHA handling bypass scraping blocks, returning raw structured HTML from targets instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '32px', textAlign: 'left' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '8px', 
              background: 'rgba(255, 255, 255, 0.04)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary-green)',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', fontFamily: 'var(--sans)' }}>GPT-4o Extraction</h3>
            <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Intelligent processing scans target content for valid emails, telephone records, social profiles, and specific customer-facing services.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover" style={{ padding: '32px', textAlign: 'left' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '8px', 
              background: 'rgba(255, 255, 255, 0.04)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary-green)',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <Languages size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', fontFamily: 'var(--sans)' }}>Bilingual Campaigns</h3>
            <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Instantly outputs customized copy in both English and Spanish, personalized using the target's specific business services.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
