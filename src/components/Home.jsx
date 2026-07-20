import { useState, useEffect } from 'react';

function Home({ name, title, bio, color, onNavigate }) {
  // Typewriter effect for roles
  const roles = ['AI & ML Student', 'Web Developer', 'Data Enthusiast', 'Problem Solver'];
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const currentRole = roles[roleIndex];
    let timeout;

    if (!isDeleting && charIndex <= currentRole.length) {
      timeout = setTimeout(() => {
        setDisplayText(currentRole.substring(0, charIndex));
        setCharIndex(prev => prev + 1);
      }, 80);
    } else if (!isDeleting && charIndex > currentRole.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setDisplayText(currentRole.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      }, 40);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setRoleIndex(prev => (prev + 1) % roles.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, roleIndex]);

  return (
    <div className="page-view">
      <section className="section-card home-hero-section">
        {/* Decorative background shapes */}
        <div className="hero-bg-shapes">
          <div className="hero-shape shape-1" style={{ background: `${color}08` }}></div>
          <div className="hero-shape shape-2" style={{ background: `${color}06` }}></div>
          <div className="hero-shape shape-3" style={{ background: `${color}10` }}></div>
        </div>

        <div className="hero-centered-layout">
          {/* Greeting badge */}
          <div className="hero-greeting-badge" style={{ backgroundColor: `${color}10`, color }}>
            <span className="greeting-wave">👋</span> Welcome to my portfolio
          </div>

          {/* Name with highlight */}
          <h1 className="hero-mega-name">
            Hi, I'm{' '}
            <span className="hero-name-highlight" style={{ 
              backgroundImage: `linear-gradient(135deg, ${color}, ${color}aa)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {name || 'Utsav Patel'}
            </span>
          </h1>

          {/* Typewriter headline */}
          <div className="hero-typewriter-row">
            <span className="typewriter-prefix">I'm a </span>
            <span className="typewriter-text" style={{ color }}>
              {displayText}
              <span className="typewriter-cursor" style={{ borderColor: color }}>|</span>
            </span>
          </div>

          {/* Bio text */}
          <p className="hero-bio-centered">
            {bio || 'A 3rd year AI & ML student at CSPIT, CHARUSAT — passionate about building intelligent systems, crafting modern web experiences, and turning data into impact.'}
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta-row">
            <button
              className="hero-btn-primary"
              style={{ backgroundColor: color }}
              onClick={() => onNavigate('contact')}
            >
              <span>Get In Touch</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button
              className="hero-btn-secondary"
              style={{ borderColor: `${color}40`, color }}
              onClick={() => onNavigate('about')}
            >
              About Me
            </button>
            <button
              className="hero-btn-secondary"
              style={{ borderColor: `${color}40`, color }}
              onClick={() => onNavigate('projects')}
            >
              View Projects
            </button>
          </div>

          {/* Scroll-down tech stack marquee */}
          <div className="hero-tech-marquee">
            <div className="marquee-label">Tech Stack</div>
            <div className="marquee-track">
              <div className="marquee-inner">
                {[
                  { name: 'Python', emoji: '🐍' },
                  { name: 'React', emoji: '⚛️' },
                  { name: 'JavaScript', emoji: '📜' },
                  { name: 'TensorFlow', emoji: '🔥' },
                  { name: 'HTML/CSS', emoji: '🎨' },
                  { name: 'MySQL', emoji: '🗄️' },
                  { name: 'Git', emoji: '📦' },
                  { name: 'OpenCV', emoji: '👁️' },
                  // Duplicate for seamless loop
                  { name: 'Python', emoji: '🐍' },
                  { name: 'React', emoji: '⚛️' },
                  { name: 'JavaScript', emoji: '📜' },
                  { name: 'TensorFlow', emoji: '🔥' },
                  { name: 'HTML/CSS', emoji: '🎨' },
                  { name: 'MySQL', emoji: '🗄️' },
                  { name: 'Git', emoji: '📦' },
                  { name: 'OpenCV', emoji: '👁️' },
                ].map((tech, idx) => (
                  <div key={idx} className="marquee-chip" style={{ borderColor: `${color}20` }}>
                    <span>{tech.emoji}</span>
                    <span>{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
