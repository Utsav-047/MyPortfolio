import React, { useState } from 'react';

function Contact({ 
  email = 'utsavpatel788190@gmail.com', 
  phone = '+91 9328292343', 
  location = 'Changa, Gujarat, India', 
  github = 'Utsav-047', 
  linkedin = 'https://www.linkedin.com/in/utsav-patel-422789320' 
}) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Send real email directly to Utsav's inbox via FormSubmit AJAX service
      const res = await fetch('https://formsubmit.co/ajax/utsavpatel788190@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `Portfolio Message from ${formData.name}`,
          _captcha: 'false'
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      // 2. Also record message in backend database
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await fetch(`${apiBase}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } catch {
        // Backend logging is supplementary
      }

      setSent(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      console.error('Failed to deliver message:', err);
      setErrorMsg('Network delivery failed. Please send an email directly using the button on the left.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-view">
      <section className="contact-human-section">
        {/* Header */}
        <div className="section-header-compact">
          <span className="section-kicker">Get In Touch</span>
          <h2 className="section-title-human">Contact &amp; Connect</h2>
          <p className="contact-header-desc">
            Whether you have an internship opportunity, project collaboration, or technical inquiry &mdash; my inbox is open.
          </p>
        </div>

        <div className="contact-human-grid">
          {/* Left Column: Direct Communication Cards */}
          <div className="contact-info-col">
            <div className="contact-card-box">
              <h3 className="contact-box-title">Direct Contact Channels</h3>

              <div className="contact-channel-item">
                <div className="channel-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </div>
                <div className="channel-text">
                  <span className="channel-label">Email Address</span>
                  <a href={`mailto:${email}`} className="channel-value email-link">
                    {email}
                  </a>
                </div>
                <button 
                  onClick={handleCopyEmail}
                  className="channel-copy-btn"
                  title="Copy email to clipboard"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="contact-channel-item">
                <div className="channel-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="channel-text">
                  <span className="channel-label">Phone &amp; WhatsApp</span>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="channel-value">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="contact-channel-item">
                <div className="channel-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="channel-text">
                  <span className="channel-label">Location</span>
                  <span className="channel-value">{location}</span>
                </div>
              </div>
            </div>

            {/* Social & Code Profiles */}
            <div className="contact-card-box">
              <h3 className="contact-box-title">Professional Profiles</h3>
              <div className="contact-social-row">
                <a
                  href={`https://github.com/${github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-profile-pill"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>GitHub @{github}</span>
                </a>

                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-profile-pill"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn Profile</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Message Form */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              <h3 className="form-card-title">Send a Direct Message</h3>
              <p className="form-card-subtitle">
                Fill out the form below &mdash; messages are delivered straight to my email inbox.
              </p>

              {sent && (
                <div className="contact-success-banner">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Thank you! Your message was sent successfully to utsavpatel788190@gmail.com.</span>
                </div>
              )}

              {errorMsg && (
                <div className="contact-error-banner">
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form-element">
                <div className="form-field-group">
                  <label htmlFor="contact-name" className="form-field-label">Your Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-text-input"
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="contact-email" className="form-field-label">Your Email *</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-text-input"
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="contact-message" className="form-field-label">Your Message *</label>
                  <textarea
                    id="contact-message"
                    required
                    rows="5"
                    placeholder="Write your project details, inquiry, or internship opportunity..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-text-area"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="contact-submit-btn"
                >
                  {submitting ? (
                    <span>Delivering Message...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
