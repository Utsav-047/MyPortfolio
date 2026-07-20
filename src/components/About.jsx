import profileImg from '../assets/profile.jpeg';

function About({ 
  aboutTitle, 
  aboutBio, 
  location, 
  studies, 
  focusArea, 
  availability, 
  color 
}) {
  const floatingBadges = [
    { label: 'Python', emoji: '🐍', position: 'badge-pos-1' },
    { label: 'React', emoji: '⚛️', position: 'badge-pos-2' },
    { label: 'ML', emoji: '🧠', position: 'badge-pos-3' },
    { label: 'SQL', emoji: '🗄️', position: 'badge-pos-4' },
    { label: 'AI', emoji: '⚡', position: 'badge-pos-5' },
    { label: 'CSS', emoji: '🎨', position: 'badge-pos-6' },
  ];

  return (
    <div className="page-view">
      <section className="section-card">
        <div className="section-tag" style={{ color }}>Who Am I</div>
        <h2 className="section-title">About Me</h2>

        <div className="about-grid-layout">
          {/* Left: Circular Photo with Glow Ring + Floating Badges */}
          <div className="about-photo-area">
            <div className="photo-orbit-container">
              {/* Glowing ring layers */}
              <div className="glow-ring ring-outer" style={{ borderColor: `${color}25` }}></div>
              <div className="glow-ring ring-middle" style={{ borderColor: `${color}40` }}></div>
              <div className="glow-ring ring-inner" style={{ borderColor: `${color}70` }}></div>
              
              {/* The actual photo */}
              <div className="photo-circle" style={{ boxShadow: `0 0 40px ${color}30, 0 0 80px ${color}15` }}>
                <img src={profileImg} alt="Utsav Patel" className="photo-img" />
              </div>

              {/* Floating skill badges */}
              {floatingBadges.map((badge, idx) => (
                <div 
                  key={idx} 
                  className={`floating-skill-badge ${badge.position}`}
                  style={{ animationDelay: `${idx * 0.4}s` }}
                >
                  <span className="floating-badge-emoji">{badge.emoji}</span>
                  <span className="floating-badge-label">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Status indicator below photo */}
            <div className="photo-status-pill" style={{ backgroundColor: `${color}12`, color }}>
              <span className="status-dot-pulse" style={{ backgroundColor: color }}></span>
              {availability || 'Open to Opportunities'}
            </div>
          </div>

          {/* Right: About Content */}
          <div className="about-info-area">
            <h3 className="about-heading-styled">
              {aboutTitle ? (
                <>
                  {aboutTitle.split(',')[0]}
                  {aboutTitle.includes(',') && (
                    <span className="about-heading-accent" style={{ color }}>
                      , {aboutTitle.split(',').slice(1).join(',')}
                    </span>
                  )}
                </>
              ) : (
                <>
                  AI Developer
                  <span className="about-heading-accent" style={{ color }}>, Data Storyteller</span>
                </>
              )}
            </h3>
            
            <p className="about-bio-text">
              {aboutBio || "Hey there! I'm Utsav, a B.Tech AI & ML student at CHARUSAT. I enjoy building AI-powered applications, full-stack web apps and solving real-world problems using Machine Learning. My passion lies in transforming complex data into meaningful insights and building tools that make a real impact."}
            </p>

            {/* Highlights ribbon */}
            <div className="about-highlights">
              <div className="highlight-chip" style={{ borderColor: `${color}30` }}>
                <span className="highlight-icon">🎓</span>
                <div>
                  <div className="highlight-label">Education</div>
                  <div className="highlight-value">{studies || 'B.Tech AI & ML'}</div>
                </div>
              </div>
              <div className="highlight-chip" style={{ borderColor: `${color}30` }}>
                <span className="highlight-icon">📍</span>
                <div>
                  <div className="highlight-label">Location</div>
                  <div className="highlight-value">{location || 'India'}</div>
                </div>
              </div>
              <div className="highlight-chip" style={{ borderColor: `${color}30` }}>
                <span className="highlight-icon">🎯</span>
                <div>
                  <div className="highlight-label">Focus</div>
                  <div className="highlight-value">{focusArea || 'AI / ML / Web Dev'}</div>
                </div>
              </div>
            </div>

            {/* What I do section */}
            <div className="about-what-i-do">
              <h4 className="what-i-do-title">What I Do</h4>
              <div className="what-i-do-grid">
                <div className="what-i-do-item">
                  <span className="what-i-do-icon" style={{ background: `${color}12`, color }}>🤖</span>
                  <div>
                    <strong>Machine Learning</strong>
                    <p>Building predictive models and intelligent pipelines</p>
                  </div>
                </div>
                <div className="what-i-do-item">
                  <span className="what-i-do-icon" style={{ background: `${color}12`, color }}>💻</span>
                  <div>
                    <strong>Web Development</strong>
                    <p>Crafting responsive, modern React applications</p>
                  </div>
                </div>
                <div className="what-i-do-item">
                  <span className="what-i-do-icon" style={{ background: `${color}12`, color }}>📊</span>
                  <div>
                    <strong>Data Analysis</strong>
                    <p>Turning raw data into actionable business insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;