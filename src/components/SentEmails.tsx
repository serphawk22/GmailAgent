import React, { useState, useEffect } from 'react';
import { 
  Trash2, Search, ArrowLeft, Mail, 
  ExternalLink, Clock, Globe,
  Calendar, Check, AlertTriangle
} from 'lucide-react';

interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: string; // ISO date string
  method: 'api' | 'manual';
  companyUrl?: string;
}

interface SentEmailsProps {
  onNavigate: (page: 'landing' | 'login' | 'dashboard' | 'sent-emails') => void;
}

export const SentEmails: React.FC<SentEmailsProps> = ({ onNavigate }) => {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load emails from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sent_emails');
      if (stored) {
        setEmails(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to parse sent emails from localStorage:', err);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = emails.filter(email => email.id !== id);
    setEmails(updated);
    localStorage.setItem('sent_emails', JSON.stringify(updated));
    showToast('Log entry removed.');
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  const handleClearAll = () => {
    setEmails([]);
    localStorage.removeItem('sent_emails');
    setConfirmClear(false);
    showToast('All logs cleared successfully.');
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  // Filter emails based on search query
  const filteredEmails = emails.filter(email => 
    email.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (email.companyUrl && email.companyUrl.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-fade-in" style={{ zIndex: 1, position: 'relative' }}>
      
      {/* Header Panel */}
      <div className="glass-panel console-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <button 
          onClick={() => onNavigate('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-gray-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--mono)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '6px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-gray-light)'}
        >
          <ArrowLeft size={16} />
          <span>Back to Console</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={16} style={{ color: 'var(--text-gray-muted)' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-gray-light)', fontWeight: 500, fontFamily: 'var(--mono)' }}>
            Outbound Logs: {emails.length} Records
          </span>
        </div>
      </div>

      {/* Title section */}
      <div style={{ maxWidth: '850px', margin: '0 auto 30px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '10px' }}>
          Sent Outreach <span className="text-neon-glow">History</span>
        </h2>
        <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.9rem' }}>
          Trace and manage cold pitch templates delivered through this browser console.
        </p>
      </div>

      {/* Control Bar: Search and Clear */}
      <div style={{
        maxWidth: '850px',
        margin: '0 auto 24px',
        display: 'flex',
        gap: '16px',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray-muted)', zIndex: 2 }}>
            <Search size={18} />
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipient, subject, or domain..."
            className="custom-input"
            style={{ width: '100%', paddingLeft: '48px', height: '46px', fontSize: '0.9rem' }}
          />
        </div>

        {/* Clear All Data */}
        {emails.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {confirmClear ? (
              <>
                <button 
                  onClick={handleClearAll}
                  className="btn-primary"
                  style={{
                    background: '#ef4444',
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
                    color: '#ffffff',
                    padding: '10px 20px',
                    fontSize: '0.85rem'
                  }}
                >
                  <AlertTriangle size={14} />
                  <span>Confirm Clear All</span>
                </button>
                <button 
                  onClick={() => setConfirmClear(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setConfirmClear(true)}
                className="btn-secondary"
                style={{
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '10px 20px',
                  fontSize: '0.85rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
              >
                <Trash2 size={14} />
                <span>Clear All Logs</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Logs List */}
      <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredEmails.length === 0 ? (
          <div className="glass-panel" style={{ padding: '50px', textAlign: 'center', borderStyle: 'dashed' }}>
            <Mail size={48} style={{ color: 'var(--text-gray-muted)', marginBottom: '16px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#ffffff' }}>
              {searchQuery ? 'No Matching Records' : 'No Outreach Logs'}
            </h3>
            <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto' }}>
              {searchQuery 
                ? 'Try adjusting your search keywords to find logged outreach messages.' 
                : 'Emails sent successfully through the console or launched manually will be logged here.'}
            </p>
            {!searchQuery && (
              <button 
                onClick={() => onNavigate('dashboard')}
                className="btn-primary"
                style={{ marginTop: '24px', padding: '10px 20px', fontSize: '0.85rem' }}
              >
                Go to Console
              </button>
            )}
          </div>
        ) : (
          filteredEmails.map((email) => {
            const isExpanded = expandedId === email.id;
            return (
              <div 
                key={email.id} 
                className="glass-panel" 
                style={{ 
                  padding: '20px 24px', 
                  borderLeft: `4px solid ${email.method === 'api' ? '#10b981' : '#3b82f6'}`,
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Log Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  gap: '16px',
                  flexWrap: 'wrap',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '1.05rem', fontFamily: 'var(--mono)' }}>
                        {email.recipient}
                      </span>
                      {/* Method Badge */}
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontFamily: 'var(--mono)', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: email.method === 'api' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        color: email.method === 'api' ? '#10b981' : '#3b82f6',
                        border: `1px solid ${email.method === 'api' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                      }}>
                        {email.method === 'api' ? 'Sent (API)' : 'Gmail Manual'}
                      </span>
                    </div>

                    {email.companyUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-gray-muted)' }}>
                        <Globe size={12} />
                        <a 
                          href={email.companyUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: 'var(--text-gray-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          className="nav-link"
                        >
                          <span>{email.companyUrl}</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-gray-muted)', fontFamily: 'var(--mono)' }}>
                      <Calendar size={12} />
                      <span>{formatDate(email.sentAt)}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(email.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-gray-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s ease, background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-gray-muted)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      title="Delete log record"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Email Subject */}
                <div style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 600, 
                  color: 'var(--text-gray-light)', 
                  marginBottom: '10px',
                  fontFamily: 'var(--mono)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                  paddingTop: '10px'
                }}>
                  <span style={{ color: 'var(--text-gray-muted)', fontWeight: 400 }}>Subject:</span> {email.subject}
                </div>

                {/* Email Body */}
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    background: 'rgba(0, 0, 0, 0.25)', 
                    borderRadius: '6px', 
                    padding: '12px 16px',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--mono)',
                    lineHeight: '1.5',
                    color: 'var(--text-gray-muted)',
                    whiteSpace: 'pre-wrap',
                    maxHeight: isExpanded ? 'none' : '90px',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                    border: '1px solid rgba(255, 255, 255, 0.03)'
                  }}>
                    {email.body}
                  </div>

                  {/* Expand / Collapse Button */}
                  {email.body.split('\n').length > 3 || email.body.length > 200 ? (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-start',
                      marginTop: '8px'
                    }}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : email.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--mono)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        {isExpanded ? 'Show Less' : 'Show Full Body'}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Success/Toast notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(10, 10, 15, 0.95)',
          border: '1px solid var(--border-green-bright)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
          borderRadius: '8px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#ffffff',
          fontSize: '0.85rem',
          fontFamily: 'var(--mono)',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out forwards'
        }}>
          <Check size={16} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
