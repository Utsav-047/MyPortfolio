import React from 'react';

function Footer({ name = 'Utsav Patel', tagline, email = 'utsavpatel788190@gmail.com', phone = '+91 9328292343', location = 'Changa, Gujarat, India', github = 'Utsav-047', linkedin = 'https://www.linkedin.com/in/utsav-patel-422789320', onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-human-wrapper">
      <div className="footer-human-content">
        <div className="footer-main-row">
          {/* Brand & Purpose */}
          <div className="footer-col-brand">
            <h3 className="footer-brand-name">{name}</h3>
            <p className="footer-brand-desc">
              {tagline || 'AI & Machine Learning Student • Full-Stack Web Developer. Building reliable software with modern stacks.'}
            </p>
            <div className="footer-status-pill">
              <span className="footer-status-dot"></span>
              <span>Available for Summer 2025/2026 Internships</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="footer-col-nav">
            <h4 className="footer-col-title">Navigation</h4>
            <div className="footer-links-grid">
              <button className="footer-nav-btn" onClick={() => onNavigate('home')}>Home</button>
              <button className="footer-nav-btn" onClick={() => onNavigate('about')}>About</button>
              <button className="footer-nav-btn" onClick={() => onNavigate('skills')}>Skills</button>
              <button className="footer-nav-btn" onClick={() => onNavigate('projects')}>Projects</button>
              <button className="footer-nav-btn" onClick={() => onNavigate('contact')}>Contact</button>
            </div>
          </div>

          {/* Connect & Direct Info */}
          <div className="footer-col-connect">
            <h4 className="footer-col-title">Connect</h4>
            <div className="footer-contact-items">
              <a href={`mailto:${email}`} className="footer-contact-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <span>{email}</span>
              </a>

              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="footer-contact-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>{phone}</span>
              </a>

              <div className="footer-contact-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="footer-bottom-bar">
          <p className="footer-copy-text">
            &copy; {currentYear} Utsav Patel. Built with React &amp; Node.js.
          </p>
          <div className="footer-social-anchors">
            <a href={`https://github.com/${github}`} target="_blank" rel="noopener noreferrer">GitHub</a>
            <span className="dot-divider">&bull;</span>
            <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
