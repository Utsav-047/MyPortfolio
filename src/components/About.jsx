import profileImg from '../assets/profile.jpeg';
import { 
  PythonLogo, 
  ReactLogo, 
  TensorFlowLogo, 
  OpenCVLogo, 
  MySQLLogo, 
  JavaScriptLogo,
  MLNeuralIcon,
  WebDevIcon,
  DataAnalysisIcon
} from './TechLogos';

function About({ 
  aboutTitle, 
  aboutBio, 
  location, 
  studies, 
  focusArea, 
  availability, 
  color = '#4f46e5'
}) {
  const floatingBadges = [
    { label: 'Python', Logo: PythonLogo, position: 'badge-pos-1' },
    { label: 'React', Logo: ReactLogo, position: 'badge-pos-2' },
    { label: 'TensorFlow', Logo: TensorFlowLogo, position: 'badge-pos-3' },
    { label: 'MySQL', Logo: MySQLLogo, position: 'badge-pos-4' },
    { label: 'OpenCV', Logo: OpenCVLogo, position: 'badge-pos-5' },
    { label: 'JavaScript', Logo: JavaScriptLogo, position: 'badge-pos-6' },
  ];

  return (
    <div className="page-view">
      <section className="section-card">
        <div className="section-tag" style={{ color }}>Who Am I</div>
        <h2 className="section-title">About Me</h2>

        <div className="about-grid-layout">
          {/* Left: Circular Photo with Glow Ring + Floating Real SVG Badges */}
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

              {/* Floating skill badges with real logos */}
              {floatingBadges.map((badge, idx) => {
                const Icon = badge.Logo;
                return (
                  <div 
                    key={idx} 
                    className={`floating-skill-badge ${badge.position}`}
                    style={{ 
                      animationDelay: `${idx * 0.35}s`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '999px'
                    }}
                  >
                    <Icon size={16} />
                    <span className="floating-badge-label" style={{ fontWeight: 700, fontSize: '12px', color: '#1e293b' }}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
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

            {/* Highlights ribbon with clean SVG vector badges */}
            <div className="about-highlights">
              <div className="highlight-chip" style={{ borderColor: `${color}30` }}>
                <span className="highlight-icon" style={{ fontSize: '18px' }}>🎓</span>
                <div>
                  <div className="highlight-label">Education</div>
                  <div className="highlight-value">{studies || 'B.Tech AI & ML'}</div>
                </div>
              </div>
              <div className="highlight-chip" style={{ borderColor: `${color}30` }}>
                <span className="highlight-icon" style={{ fontSize: '18px' }}>📍</span>
                <div>
                  <div className="highlight-label">Location</div>
                  <div className="highlight-value">{location || 'India'}</div>
                </div>
              </div>
              <div className="highlight-chip" style={{ borderColor: `${color}30` }}>
                <span className="highlight-icon" style={{ fontSize: '18px' }}>🎯</span>
                <div>
                  <div className="highlight-label">Focus</div>
                  <div className="highlight-value">{focusArea || 'AI / ML / Web Dev'}</div>
                </div>
              </div>
            </div>

            {/* What I do section with authentic vector icons */}
            <div className="about-what-i-do">
              <h4 className="what-i-do-title">What I Do</h4>
              <div className="what-i-do-grid">
                <div className="what-i-do-item" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <span className="what-i-do-icon" style={{ background: `${color}12`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '10px' }}>
                    <MLNeuralIcon size={24} color={color} />
                  </span>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>Machine Learning</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Building predictive models and intelligent pipelines</p>
                  </div>
                </div>
                <div className="what-i-do-item" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <span className="what-i-do-icon" style={{ background: '#3b82f615', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '10px' }}>
                    <WebDevIcon size={24} color="#2563eb" />
                  </span>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>Web Development</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Crafting responsive, modern React applications</p>
                  </div>
                </div>
                <div className="what-i-do-item" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <span className="what-i-do-icon" style={{ background: '#10b98115', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '10px' }}>
                    <DataAnalysisIcon size={24} color="#059669" />
                  </span>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>Data Analysis</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Turning raw data into actionable business insights</p>
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