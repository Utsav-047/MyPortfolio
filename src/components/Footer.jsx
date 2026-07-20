function Footer({ name, tagline, email, phone, location, github, linkedin, color, onNavigate }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-wrapper">
      <div className="footer-grid">
        {/* Column 1: Brand & Status (Matches Screenshot 1 Footer Left) */}
        <div className="footer-brand">
          <h3>{name || 'Utsav Patel'}</h3>
          <p>{tagline || 'Passionate about building intelligent and scalable web applications.'}</p>
          <div className="footer-pill-status">
            <span className="footer-pill-dot" style={{ backgroundColor: color }}></span>
            Open to Internships
          </div>
        </div>

        {/* Column 2: Quick Links (Matches Screenshot 1 Footer Center) */}
        <div>
          <div className="footer-title">Quick Links</div>
          <div className="footer-links-list">
            <button className="footer-link-item" onClick={() => onNavigate('home')}>Home</button>
            <button className="footer-link-item" onClick={() => onNavigate('about')}>About</button>
            <button className="footer-link-item" onClick={() => onNavigate('skills')}>Skills</button>
            <button className="footer-link-item" onClick={() => onNavigate('projects')}>Projects</button>
            <button className="footer-link-item" onClick={() => onNavigate('contact')}>Contact</button>
          </div>
        </div>

        {/* Column 3: Connect & Socials (Matches Screenshot 1 Footer Right) */}
        <div>
          <div className="footer-title">Connect</div>
          <div className="footer-connect-list">
            {email && (
              <div className="connect-item">
                <span className="connect-icon">📧</span>
                <span>{email}</span>
              </div>
            )}
            {phone && (
              <div className="connect-item">
                <span className="connect-icon">📞</span>
                <span>{phone}</span>
              </div>
            )}
            {location && (
              <div className="connect-item">
                <span className="connect-icon">📍</span>
                <span>{location}</span>
              </div>
            )}

            <div className="footer-social-icons">
              {github && (
                <a 
                  href={github.startsWith('http') ? github : `https://github.com/${github}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-circle-btn"
                  title="GitHub"
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              )}
              {linkedin && (
                <a 
                  href={linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-circle-btn"
                  title="LinkedIn"
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Divider & Copyright Details (Matches Screenshot 1 Bottom Row) */}
      <div className="footer-bottom-row">
        <div>
          &copy; {currentYear} {name || 'Utsav Patel'}. Built with React + Vite
        </div>
        <div style={{ fontWeight: 600 }}>
          AI & ML Developer | Web Developer
        </div>
      </div>
    </footer>
  );
}

export default Footer;