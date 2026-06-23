import React, { useState } from 'react';
import { 
  Globe, Clipboard, Check, Send, 
  Loader2, Sparkles, LogOut, Terminal,
  Phone, Mail, ExternalLink
} from 'lucide-react';

interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

// Custom inline SVG icons for brand profiles to avoid lucide-react version compatibility issues
const LinkedinIcon = ({ size = 24, ...props }: CustomIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ size = 24, ...props }: CustomIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 24, ...props }: CustomIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);


interface GmailAgentProps {
  onNavigate: (page: 'landing' | 'login' | 'dashboard' | 'sent-emails') => void;
}


interface SocialLinks {
  linkedin: string;
  instagram: string;
  facebook: string;
}

interface WebhookResponse {
  emails: string;
  phone: string;
  social_links: SocialLinks;
  company_services: string[];
  cold_email_english: string;
  cold_email_spanish: string;
}

export const GmailAgent: React.FC<GmailAgentProps> = ({ onNavigate }) => {
  const [targetUrl, setTargetUrl] = useState('');
  const [webhookUrl] = useState(
    import.meta.env.VITE_SCRAPER_WEBHOOK_URL || '/webhook/trigger-cold-email'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const [result, setResult] = useState<WebhookResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es'>('en');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendStatus, setEmailSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailSendError, setEmailSendError] = useState('');
  
  // Custom states for draft adjustments before copying/sending
  const [recipientEmail, setRecipientEmail] = useState('');
  const [editedEnglishSubject, setEditedEnglishSubject] = useState('');
  const [editedEnglishBody, setEditedEnglishBody] = useState('');
  const [editedSpanishSubject, setEditedSpanishSubject] = useState('');
  const [editedSpanishBody, setEditedSpanishBody] = useState('');
  const [showSuccessFlash, setShowSuccessFlash] = useState(false);

  const parseEmailDraft = (text: string) => {
    const lines = text.split('\n');
    const subjectLineIdx = lines.findIndex(l => l.trim().startsWith('Subject:') || l.trim().startsWith('Asunto:'));
    let subject = 'Digital Marketing Pitch';
    let body = text;

    if (subjectLineIdx !== -1) {
      subject = lines[subjectLineIdx].replace(/^(Subject:|Asunto:)\s*/i, '').trim();
      const remainingLines = lines.slice(subjectLineIdx + 1);
      let startIdx = 0;
      while (startIdx < remainingLines.length && remainingLines[startIdx].trim() === '') {
        startIdx++;
      }
      body = remainingLines.slice(startIdx).join('\n');
    }
    return { subject, body };
  };

  // High-tech scanning steps shown during execution
  const loadingSteps = [
    'SERP Hawk is scraping site assets...',
    'Establishing secure proxy connections & routing...',
    'Extracting verified contact coordinates & phone records...',
    'Analyzing business model & detecting company services...',
    'Generating bilingual growth strategies & sales copy...'
  ];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    onNavigate('landing');
  };


  // Normalization helper to map varying n8n output formats dynamically
  const normalizeWebhookResponse = (rawData: any): WebhookResponse => {
    let data = rawData;
    if (Array.isArray(rawData)) {
      data = rawData[0];
    }
    
    if (!data) {
      throw new Error("Empty response payload received from webhook.");
    }

    // Unpack nested objects if n8n wraps it (common in HTTP Request nodes)
    const wrappers = ['data', 'body', 'output', 'result', 'json', 'leadData'];
    for (const wrapper of wrappers) {
      if (data[wrapper] && typeof data[wrapper] === 'object' && !Array.isArray(data[wrapper])) {
        data = data[wrapper];
        break;
      }
    }

    const findValue = (obj: any, keys: string[]): any => {
      for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) {
          return obj[key];
        }
      }
      return undefined;
    };

    // 1. Map Emails
    let emailsVal = findValue(data, ['emails', 'email', 'email_address', 'mail', 'emails_found']);
    let emails = 'Not Found';
    if (Array.isArray(emailsVal)) {
      emails = emailsVal.join(', ');
    } else if (emailsVal) {
      emails = String(emailsVal);
    }

    // 2. Map Phone
    let phoneVal = findValue(data, ['phone', 'phone_number', 'telephone', 'contact_number', 'phones']);
    let phone = 'Not Found';
    if (Array.isArray(phoneVal)) {
      phone = phoneVal.join(', ');
    } else if (phoneVal) {
      phone = String(phoneVal);
    }

    // 3. Map Social Links
    let socialVal = findValue(data, ['social_links', 'social_media', 'socials', 'social_profiles']);
    let linkedin = 'Not Found';
    let instagram = 'Not Found';
    let facebook = 'Not Found';

    if (socialVal && typeof socialVal === 'object') {
      if (Array.isArray(socialVal)) {
        socialVal.forEach((url: string) => {
          if (typeof url === 'string') {
            if (url.includes('linkedin.com')) linkedin = url;
            else if (url.includes('instagram.com')) instagram = url;
            else if (url.includes('facebook.com')) facebook = url;
          }
        });
      } else {
        linkedin = findValue(socialVal, ['linkedin', 'linkedin_url', 'lnk']) || 'Not Found';
        instagram = findValue(socialVal, ['instagram', 'instagram_url', 'insta']) || 'Not Found';
        facebook = findValue(socialVal, ['facebook', 'facebook_url', 'fb']) || 'Not Found';
      }
    } else {
      linkedin = findValue(data, ['linkedin', 'linkedin_url', 'social_linkedin']) || 'Not Found';
      instagram = findValue(data, ['instagram', 'instagram_url', 'social_instagram']) || 'Not Found';
      facebook = findValue(data, ['facebook', 'facebook_url', 'social_facebook']) || 'Not Found';
    }

    // 4. Map Company Services
    let servicesVal = findValue(data, ['company_services', 'extracted_services', 'services', 'focus', 'business_focus', 'tags']);
    let company_services: string[] = [];
    if (Array.isArray(servicesVal)) {
      company_services = servicesVal.map(s => String(s));
    } else if (typeof servicesVal === 'string') {
      company_services = servicesVal.split(',').map(s => s.trim()).filter(Boolean);
    }

    // 5. Map Cold Emails
    let cold_email_english = findValue(data, ['cold_email_english', 'email_english', 'english_pitch', 'english_email', 'cold_email', 'pitch_english']) || '';
    let cold_email_spanish = findValue(data, ['cold_email_spanish', 'email_spanish', 'spanish_pitch', 'spanish_email', 'pitch_spanish']) || '';

    // Fallback if flat text is returned
    if (!cold_email_english && !cold_email_spanish) {
      const fallbackText = findValue(data, ['email_text', 'email_body', 'generated_email', 'text', 'output']);
      if (fallbackText) {
        cold_email_english = String(fallbackText);
      }
    }

    return {
      emails,
      phone,
      social_links: {
        linkedin: String(linkedin),
        instagram: String(instagram),
        facebook: String(facebook)
      },
      company_services,
      cold_email_english: String(cold_email_english),
      cold_email_spanish: String(cold_email_spanish)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetUrl) {
      alert('Please provide a valid target company URL.');
      return;
    }

    if (!webhookUrl || webhookUrl.trim() === '') {
      console.error('Webhook URL is not configured. Please set it in your .env file.');
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);
    setResult(null);

    // Dynamic loading timer
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 3000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5-minute timeout

    // Normalize webhookUrl: if absolute localhost:5678 path is loaded from cache/env, rewrite to relative proxy path to bypass CORS
    let activeUrl = webhookUrl;
    if (activeUrl.startsWith('http://localhost:5678')) {
      activeUrl = activeUrl.replace('http://localhost:5678', '');
    }

    let cleanedUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(cleanedUrl)) {
      cleanedUrl = 'https://' + cleanedUrl;
    }

    try {
      const response = await fetch(activeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ company_url: cleanedUrl }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error(`n8n webhook responded with status ${response.status}`);
      }

      const rawData = await response.json();
      
      // Normalize rawData using the robust normalizer
      const formattedData = normalizeWebhookResponse(rawData);

      // Check if response contains any valid content
      const hasLeadData = formattedData.emails !== 'Not Found' || 
                          formattedData.phone !== 'Not Found' ||
                          formattedData.social_links.linkedin !== 'Not Found' ||
                          formattedData.social_links.instagram !== 'Not Found' ||
                          formattedData.social_links.facebook !== 'Not Found' ||
                          formattedData.company_services.length > 0 ||
                          formattedData.cold_email_english !== '' ||
                          formattedData.cold_email_spanish !== '';

      if (!hasLeadData) {
        throw new Error(`No valid content found in response payload. Received: ${JSON.stringify(rawData)}`);
      }

      setResult(formattedData);

      const parsedEn = parseEmailDraft(formattedData.cold_email_english);
      const parsedEs = parseEmailDraft(formattedData.cold_email_spanish);

      setEditedEnglishSubject(parsedEn.subject);
      setEditedEnglishBody(parsedEn.body);
      setEditedSpanishSubject(parsedEs.subject);
      setEditedSpanishBody(parsedEs.body);

      const emailList = formattedData.emails && formattedData.emails !== 'Not Found'
        ? formattedData.emails.split(',').map(e => e.trim()).filter(Boolean)
        : [];
      setRecipientEmail(emailList[0] || '');
    } catch (err: any) {
      console.error('SERP Hawk scan execution error:', err);
    } finally {
      clearTimeout(timeoutId);
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!result) return;

    const targetRecipient = recipientEmail.trim();
    if (!targetRecipient) {
      setEmailSendError('No recipient email available.');
      setEmailSendStatus('error');
      return;
    }

    const subject = selectedLanguage === 'en' ? editedEnglishSubject : editedSpanishSubject;
    const body = selectedLanguage === 'en' ? editedEnglishBody : editedSpanishBody;

    setIsSendingEmail(true);
    setEmailSendStatus('idle');
    setEmailSendError('');

    try {
      const emailWebhookUrl = import.meta.env.VITE_SEND_EMAIL_WEBHOOK_URL || 'http://localhost:5678/webhook/trigger-cold-email';
      
      // Normalize emailWebhookUrl: if absolute localhost:5678 path is loaded, rewrite to relative proxy path to bypass CORS
      let activeSendUrl = emailWebhookUrl;
      if (activeSendUrl.startsWith('http://localhost:5678')) {
        activeSendUrl = activeSendUrl.replace('http://localhost:5678', '');
      }

      const response = await fetch(activeSendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_email: targetRecipient,
          email_subject: subject,
          email_body: body
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const rawData = await response.json();
      
      let sendResponse = rawData;
      if (Array.isArray(rawData)) {
        sendResponse = rawData[0];
      }

      if (sendResponse && sendResponse.status === 'success') {
        setEmailSendStatus('success');
        setShowSuccessFlash(true);

        // Save to localStorage
        try {
          const existingStr = localStorage.getItem('sent_emails') || '[]';
          const existing = JSON.parse(existingStr);
          const newEmail = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            recipient: targetRecipient,
            subject: subject,
            body: body,
            sentAt: new Date().toISOString(),
            method: 'api',
            companyUrl: targetUrl
          };
          existing.unshift(newEmail);
          localStorage.setItem('sent_emails', JSON.stringify(existing));
        } catch (err) {
          console.error('Failed to save sent email to local storage:', err);
        }

        setTimeout(() => {
          setEmailSendStatus('idle');
          setShowSuccessFlash(false);
        }, 3000);
      } else {
        throw new Error(sendResponse?.message || 'Server did not return success status.');
      }
    } catch (err: any) {
      console.error(err);
      setEmailSendError(err.message || 'Failed to trigger email webhook');
      setEmailSendStatus('error');
      setTimeout(() => {
        setEmailSendStatus('idle');
      }, 5000);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendManually = () => {
    if (!result) return;
    const targetRecipient = recipientEmail.trim();
    const subject = selectedLanguage === 'en' ? editedEnglishSubject : editedSpanishSubject;
    const body = selectedLanguage === 'en' ? editedEnglishBody : editedSpanishBody;

    // Save to localStorage
    try {
      const existingStr = localStorage.getItem('sent_emails') || '[]';
      const existing = JSON.parse(existingStr);
      const newEmail = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        recipient: targetRecipient,
        subject: subject,
        body: body,
        sentAt: new Date().toISOString(),
        method: 'manual',
        companyUrl: targetUrl
      };
      existing.unshift(newEmail);
      localStorage.setItem('sent_emails', JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to save manual sent email to local storage:', err);
    }

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetRecipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };


  return (
    <div className="animate-fade-in" style={{ zIndex: 1, position: 'relative' }}>
      
      {/* Dashboard Header Panel */}
      <div className="glass-panel console-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-green)', boxShadow: '0 0 8px var(--primary-green)' }}></div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-gray-light)', fontWeight: 500 }}>Console Session Active</span>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-gray-muted)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '8px 12px'
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>


      {/* Search Console Input Form */}
      <section style={{ maxWidth: '750px', margin: '0 auto 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>
          Analyze & Target <span className="text-neon-glow">Leads</span>
        </h2>
        <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Enter a corporate website address below to run our extraction and copywriting pipeline.
        </p>

        <form onSubmit={handleSubmit} className="scan-form">
          <div className="scan-input-wrapper">
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray-muted)', zIndex: 2 }}>
              <Globe size={18} />
            </span>
            <input 
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="e.g. https://targetcompany.com"
              className="custom-input scan-input"
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit"
            className="btn-primary scan-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Scanning...' : 'Launch Scan'}
          </button>
        </form>

      </section>


      {/* Loading Progress State */}
      {isLoading && (
        <div className="glass-panel animate-fade-in loading-panel">
          {/* Laser Scan Line */}
          <div style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
            boxShadow: '0 0 12px rgba(255, 255, 255, 0.4)',
            animation: 'scan-line 2.5s linear infinite',
            pointerEvents: 'none'
          }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            
            {/* Spinning AI Radar / Scanning Visual */}
            <div style={{
              position: 'relative',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.01)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {/* Rotating outer compass ring */}
              <div style={{
                position: 'absolute',
                top: '-5px', left: '-5px', right: '-5px', bottom: '-5px',
                borderRadius: '50%',
                border: '1px dashed rgba(255, 255, 255, 0.3)',
                animation: 'spin 12s linear infinite'
              }}></div>
              {/* Pulsing glow ring */}
              <div style={{
                position: 'absolute',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                opacity: 0.2,
                animation: 'pulse-ring 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite'
              }}></div>
              <Loader2 size={36} style={{ color: '#ffffff', animation: 'spin 1.5s linear infinite' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ 
                fontSize: '1.35rem', 
                fontFamily: 'var(--mono)', 
                color: '#ffffff', 
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '0 0 8px rgba(255, 255, 255, 0.2)'
              }}>
                Awaiting n8n Response
              </h3>
              <p style={{ color: 'var(--text-gray-light)', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
                Connecting to backend n8n outreach workflow... waiting for the AI extraction and compilation response node.
              </p>
            </div>

            {/* Live Progress Logs */}
            <div style={{ 
              width: '100%', 
              maxWidth: '460px', 
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: 'inset 0 4px 15px rgba(0, 0, 0, 0.8)'
            }}>
              {loadingSteps.map((stepText, idx) => {
                const isActive = idx === loadingStep;
                const isCompleted = idx < loadingStep;
                return (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    fontSize: '0.85rem',
                    opacity: isCompleted || isActive ? 1 : 0.25,
                    color: isActive ? '#ffffff' : 'var(--text-gray-muted)',
                    transition: 'all 0.4s ease'
                  }}>
                    {isCompleted ? (
                      <span style={{ color: '#ffffff', display: 'inline-flex', alignItems: 'center', fontWeight: 'bold' }}>
                        [✓]
                      </span>
                    ) : isActive ? (
                      <span style={{ 
                        color: '#ffffff', 
                        animation: 'pulse 1s infinite',
                        fontWeight: 'bold'
                      }}>
                        [&gt;]
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-gray-muted)' }}>[ ]</span>
                    )}
                    <span style={{ 
                      fontFamily: 'var(--mono)',
                      textShadow: isActive ? '0 0 10px rgba(255, 255, 255, 0.4)' : 'none'
                    }}>
                      {stepText}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff', animation: 'pulse 1s infinite' }}></div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontFamily: 'var(--mono)',
                color: 'var(--text-gray-muted)',
                letterSpacing: '0.5px'
              }}>
                STATE: AWAITING_RESPOND_TO_WEBHOOK_NODE
              </span>
            </div>
          </div>
        </div>
      )}


      {/* Structured Results Display */}
      {result && !isLoading && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '30px',
          alignItems: 'start',
          marginTop: '20px'
        }} className="dashboard-grid">
          
          {/* Left Column (Section A): Target Intelligence Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Contact Coordinates Card */}
            <div className="glass-panel" style={{ padding: '28px', border: '1px solid var(--border-green-bright)' }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                marginBottom: '20px', 
                borderBottom: '1px solid var(--border-green-dim)', 
                paddingBottom: '12px', 
                fontFamily: 'var(--mono)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px' 
              }}>
                <Terminal size={20} className="text-neon-glow" style={{ color: 'var(--primary-green)' }} />
                <span>Target Profile</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                
                {/* Emails Panel */}
                <div>
                  <span style={{ 
                    fontFamily: 'var(--mono)', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-gray-muted)', 
                    display: 'block', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Emails Panel
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(() => {
                      const emailList = result.emails && result.emails !== 'Not Found' 
                        ? result.emails.split(',').map(e => e.trim()).filter(Boolean) 
                        : [];
                      
                      if (emailList.length === 0) {
                        return (
                          <span style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--text-gray-muted)', 
                            fontStyle: 'italic',
                            padding: '6px 12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '6px',
                            border: '1px dashed var(--border-green-dim)',
                            width: '100%',
                            display: 'block'
                          }}>
                            No Profile Linked
                          </span>
                        );
                      }
                      
                      return emailList.map((email, idx) => {
                        const isSelected = email === recipientEmail;
                        return (
                          <button 
                            key={idx}
                            type="button"
                            onClick={() => setRecipientEmail(email)}
                            className="glass-panel-hover email-recipient-btn"
                            style={{
                              background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                              border: isSelected ? '1px solid #10b981' : '1px solid var(--border-green-bright)'
                            }}
                          >
                            <Mail size={12} style={{ color: isSelected ? '#10b981' : 'var(--text-gray-muted)' }} />
                            <span>{email}</span>
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Phone Panel */}
                <div>
                  <span style={{ 
                    fontFamily: 'var(--mono)', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-gray-muted)', 
                    display: 'block', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Phone Panel
                  </span>
                  <div>
                    {result.phone && result.phone !== 'Not Found' ? (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        padding: '10px 14px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--border-green-dim)',
                        fontFamily: 'var(--mono)',
                        fontSize: '0.9rem',
                        width: 'fit-content'
                      }}>
                        <Phone size={14} style={{ color: 'var(--text-gray-muted)' }} />
                        <span>{result.phone}</span>
                      </div>
                    ) : (
                      <span style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--text-gray-muted)', 
                        fontStyle: 'italic',
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '6px',
                        border: '1px dashed var(--border-green-dim)',
                        width: '100%',
                        display: 'block'
                      }}>
                        No Profile Linked
                      </span>
                    )}
                  </div>
                </div>

                {/* Social Connectivity Hub */}
                <div>
                  <span style={{ 
                    fontFamily: 'var(--mono)', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-gray-muted)', 
                    display: 'block', 
                    marginBottom: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Social Connectivity Hub
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* LinkedIn */}
                    {(() => {
                      const hasLnk = result.social_links?.linkedin && result.social_links.linkedin !== 'Not Found';
                      return (
                        <div className="social-link-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <LinkedinIcon 
                              size={16} 
                              style={{ 
                                color: hasLnk ? '#0077b5' : 'var(--text-gray-muted)',
                                opacity: hasLnk ? 1 : 0.5
                              }} 
                            />
                            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', fontWeight: 500 }}>LinkedIn</span>
                          </div>
                          {hasLnk ? (
                            <a 
                              href={result.social_links.linkedin} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn-secondary"
                              style={{ 
                                padding: '4px 10px', 
                                fontSize: '0.75rem', 
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>View</span>
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-muted)', fontStyle: 'italic' }}>
                              No Profile Linked
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Instagram */}
                    {(() => {
                      const hasInsta = result.social_links?.instagram && result.social_links.instagram !== 'Not Found';
                      return (
                        <div className="social-link-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <InstagramIcon 
                              size={16} 
                              style={{ 
                                color: hasInsta ? '#e1306c' : 'var(--text-gray-muted)',
                                opacity: hasInsta ? 1 : 0.5
                              }} 
                            />
                            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', fontWeight: 500 }}>Instagram</span>
                          </div>
                          {hasInsta ? (
                            <a 
                              href={result.social_links.instagram} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn-secondary"
                              style={{ 
                                padding: '4px 10px', 
                                fontSize: '0.75rem', 
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>View</span>
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-muted)', fontStyle: 'italic' }}>
                              No Profile Linked
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Facebook */}
                    {(() => {
                      const hasFb = result.social_links?.facebook && result.social_links.facebook !== 'Not Found';
                      return (
                        <div className="social-link-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FacebookIcon 
                              size={16} 
                              style={{ 
                                color: hasFb ? '#1877f2' : 'var(--text-gray-muted)',
                                opacity: hasFb ? 1 : 0.5
                              }} 
                            />
                            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', fontWeight: 500 }}>Facebook</span>
                          </div>
                          {hasFb ? (
                            <a 
                              href={result.social_links.facebook} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn-secondary"
                              style={{ 
                                padding: '4px 10px', 
                                fontSize: '0.75rem', 
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>View</span>

                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-gray-muted)', fontStyle: 'italic' }}>
                              No Profile Linked
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Services tag grid */}
            <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-green-bright)' }}>
              <h3 style={{ 
                fontSize: '1.1rem', 
                marginBottom: '16px', 
                borderBottom: '1px solid var(--border-green-dim)', 
                paddingBottom: '10px', 
                fontFamily: 'var(--mono)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <Sparkles size={18} className="text-neon-glow" style={{ color: 'var(--primary-green)' }} />
                <span>Detected Business Focus</span>
              </h3>
              
              {result.company_services && result.company_services.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.company_services.map((service, idx) => (
                    <div 
                      key={idx} 
                      className="glass-panel-hover"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid var(--border-green-bright)', 
                        borderRadius: '6px', 
                        padding: '6px 12px', 
                        fontSize: '0.8rem', 
                        color: '#ffffff',
                        fontFamily: 'var(--mono)',
                        textTransform: 'lowercase'
                      }}
                    >
                      {service}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-gray-muted)', fontStyle: 'italic' }}>
                  No services identified.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Section B): Dual-Pitch Generation Workspace */}
          <div className="glass-panel" style={{ 
            padding: '28px', 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '520px',
            border: '1px solid var(--border-green-bright)'
          }}>
            
            {/* Header Tabs & Toolbar */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1px solid var(--border-green-dim)', 
              paddingBottom: '16px', 
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setSelectedLanguage('en')}
                  style={{
                    background: selectedLanguage === 'en' ? '#ffffff' : 'rgba(0, 0, 0, 0.4)',
                    color: selectedLanguage === 'en' ? '#000000' : '#ffffff',
                    border: '1px solid ' + (selectedLanguage === 'en' ? '#ffffff' : 'var(--border-green-dim)'),
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontFamily: 'var(--mono)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  English Pitch
                </button>
                <button 
                  onClick={() => setSelectedLanguage('es')}
                  style={{
                    background: selectedLanguage === 'es' ? '#ffffff' : 'rgba(0, 0, 0, 0.4)',
                    color: selectedLanguage === 'es' ? '#000000' : '#ffffff',
                    border: '1px solid ' + (selectedLanguage === 'es' ? '#ffffff' : 'var(--border-green-dim)'),
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontFamily: 'var(--mono)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Spanish Pitch
                </button>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={() => {
                    const subject = selectedLanguage === 'en' ? editedEnglishSubject : editedSpanishSubject;
                    const body = selectedLanguage === 'en' ? editedEnglishBody : editedSpanishBody;
                    handleCopy(`Subject: ${subject}\n\n${body}`, 'email_copy');
                  }}
                  className="btn-secondary"
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.8rem', 
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Copy Full Email"
                >
                  {copiedField === 'email_copy' ? <Check size={14} /> : <Clipboard size={14} />}
                  <span>{copiedField === 'email_copy' ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>

                {result && (
                  <>
                    <button 
                      onClick={handleSendManually}
                      className="btn-secondary"
                      style={{ 
                        padding: '8px 16px', 
                        fontSize: '0.8rem', 
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>📧 Send Manually</span>
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <button 
                        onClick={handleSendEmail}
                        className="btn-primary"
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '0.8rem', 
                          borderRadius: '6px', 
                          boxShadow: 'none',
                          backgroundColor: emailSendStatus === 'success' ? '#10b981' : emailSendStatus === 'error' ? '#ef4444' : '#ffffff',
                          color: '#000000',
                          cursor: isSendingEmail ? 'not-allowed' : 'pointer'
                        }}
                        disabled={isSendingEmail}
                      >
                        {isSendingEmail ? (
                          <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                        ) : emailSendStatus === 'success' ? (
                          <Check size={14} />
                        ) : (
                          <Send size={14} />
                        )}
                        <span>
                          {isSendingEmail ? 'Sending...' : emailSendStatus === 'success' ? 'Sent!' : emailSendStatus === 'error' ? 'Failed!' : 'Send Email'}
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Email Send Error Toast inside workspace */}
            {emailSendStatus === 'error' && emailSendError && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                color: '#ef4444', 
                padding: '8px 12px', 
                borderRadius: '6px', 
                fontSize: '0.8rem', 
                fontFamily: 'var(--mono)',
                marginBottom: '12px'
              }}>
                Error sending email: {emailSendError}
              </div>
            )}

            {/* Recipient & Subject Input Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
              {/* Recipient Email Input Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-gray-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Recipient Email
                </label>
                <input 
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="custom-input"
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.85rem', fontFamily: 'var(--mono)' }}
                  placeholder="recipient@example.com"
                />
              </div>

              {/* Subject Input Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-gray-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Subject Line
                </label>
                <input 
                  type="text"
                  value={selectedLanguage === 'en' ? editedEnglishSubject : editedSpanishSubject}
                  onChange={(e) => {
                    if (selectedLanguage === 'en') {
                      setEditedEnglishSubject(e.target.value);
                    } else {
                      setEditedSpanishSubject(e.target.value);
                    }
                  }}
                  className="custom-input"
                  style={{ width: '100%', height: '40px', padding: '0 12px', fontSize: '0.85rem', fontFamily: 'var(--mono)' }}
                  placeholder="Email Subject"
                />
              </div>
            </div>

            {/* Spacious Text Area Field for Email Body */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <label style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--text-gray-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Email Body
              </label>
              <textarea
                value={selectedLanguage === 'en' ? editedEnglishBody : editedSpanishBody}
                onChange={(e) => {
                  if (selectedLanguage === 'en') {
                    setEditedEnglishBody(e.target.value);
                  } else {
                    setEditedSpanishBody(e.target.value);
                  }
                }}
                className="custom-input"
                style={{ 
                  width: '100%',
                  height: '100%',
                  minHeight: '280px',
                  background: 'rgba(0, 0, 0, 0.4)', 
                  border: '1px solid var(--border-green-dim)', 
                  borderRadius: '8px', 
                  padding: '20px', 
                  fontFamily: 'var(--mono)', 
                  fontSize: '0.9rem', 
                  lineHeight: '1.6', 
                  color: '#ffffff',
                  resize: 'vertical',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.8)'
                }}
                placeholder="No email template loaded. Run the scan first."
              />
              <div style={{ 
                position: 'absolute', 
                bottom: '10px', 
                right: '15px', 
                fontSize: '0.75rem', 
                color: 'var(--text-gray-muted)',
                pointerEvents: 'none',
                fontFamily: 'var(--mono)'
              }}>
                [Editable Field]
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS FLASH OVERLAY */}
      {showSuccessFlash && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 8, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fade-in-overlay 0.3s ease-out forwards'
        }}>
          <div style={{
            background: 'rgba(10, 10, 15, 0.95)',
            border: '2px solid #10b981',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.25)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            maxWidth: '400px',
            width: '90%',
            animation: 'scale-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}>
            {/* Pulsing checkmark ring */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
              position: 'relative'
            }}>
              <Check size={40} style={{ color: '#10b981' }} />
              {/* Outer pulsing animation ring */}
              <div style={{
                position: 'absolute',
                top: '-6px', left: '-6px', right: '-6px', bottom: '-6px',
                borderRadius: '50%',
                border: '2px solid rgba(16, 185, 129, 0.5)',
                animation: 'pulse-ring-green 1.5s cubic-bezier(0.215, 0.610, 0.355, 1) infinite'
              }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ 
                fontFamily: 'var(--mono)', 
                fontSize: '1.4rem', 
                color: '#ffffff', 
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '1.5px'
              }}>
                Pitch Dispatched
              </h4>
              <p style={{ color: 'var(--text-gray-light)', fontSize: '0.9rem', margin: 0 }}>
                Cold email webhook trigger successfully returned status response code.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SENDING OVERLAY */}
      {isSendingEmail && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 5, 8, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fade-in-overlay 0.2s ease-out forwards'
        }}>
          <div style={{
            background: 'rgba(10, 10, 15, 0.95)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'spin 4s linear infinite',
              position: 'relative'
            }}>
              <Loader2 size={36} style={{ color: '#ffffff', animation: 'spin 1.5s linear infinite' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ 
                fontFamily: 'var(--mono)', 
                fontSize: '1.4rem', 
                color: '#ffffff', 
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}>
                Sending...
              </h4>
              <p style={{ color: 'var(--text-gray-muted)', fontSize: '0.85rem', margin: 0 }}>
                Forwarding approved pitch template to recipient email endpoint.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* CSS Animation imports keyframes and grid layout */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes scan-line {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 0; }
          40% { opacity: 0.2; }
          80%, 100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes fade-in-overlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-ring-green {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @media (min-width: 992px) {
          .dashboard-grid {
            grid-template-columns: 380px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
