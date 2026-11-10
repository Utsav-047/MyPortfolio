import React from 'react';
import { 
  PythonLogo, 
  ReactLogo, 
  JavaScriptLogo, 
  TensorFlowLogo, 
  MySQLLogo, 
  GitLogo, 
  OpenCVLogo,
  NodeLogo,
  MongoLogo,
  CppLogo
} from './TechLogos';

function Home({ name, title, bio, onNavigate }) {
  const coreTech = [
    { name: 'Python', Logo: PythonLogo, category: 'Primary Language' },
    { name: 'TensorFlow', Logo: TensorFlowLogo, category: 'Deep Learning' },
    { name: 'OpenCV', Logo: OpenCVLogo, category: 'Computer Vision' },
    { name: 'React', Logo: ReactLogo, category: 'Frontend' },
    { name: 'Node.js', Logo: NodeLogo, category: 'Backend' },
    { name: 'JavaScript', Logo: JavaScriptLogo, category: 'Web' },
    { name: 'MongoDB', Logo: MongoLogo, category: 'Database' },
    { name: 'MySQL', Logo: MySQLLogo, category: 'Relational DB' },
    { name: 'C++', Logo: CppLogo, category: 'Systems & DSA' },
    { name: 'Git', Logo: GitLogo, category: 'Version Control' }
  ];

  return (
    <div className="page-view">
      <section className="hero-human-section">
        {/* Availability & Role Status Pill */}
        <div className="hero-status-pill-container">
          <span className="hero-status-badge">
            <span className="hero-status-dot"></span>
            Available for Summer 2025/2026 Internships
          </span>
          <span className="hero-location-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Gujarat, India
          </span>
        </div>

        {/* Main Headline */}
        <div className="hero-headline-block">
          <h1 className="hero-human-name">
            Hi, I'm <span className="hero-name-accent">{name || 'Utsav Patel'}</span>.
          </h1>
          <p className="hero-human-title">
            {title || 'AI & Machine Learning Student • Full-Stack Web Developer'}
          </p>
        </div>

        {/* Narrative Engineering Bio */}
        <p className="hero-human-bio">
          {bio || '3rd-year B.Tech AI & ML student at CSPIT, Charusat University. I build intelligent computer vision models, deploy machine learning pipelines, and craft high-performance full-stack web applications with React, Node.js, and modern databases.'}
        </p>

        {/* Action Buttons Row */}
        <div className="hero-actions-row">
          <button
            className="hero-primary-action"
            onClick={() => onNavigate('projects')}
          >
            <span>Explore Projects</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          <button
            className="hero-secondary-action"
            onClick={() => onNavigate('contact')}
          >
            <span>Get In Touch</span>
          </button>

          <a
            href="https://github.com/Utsav-047"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-icon-action"
            title="GitHub Profile"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>

          <a
            href="https://www.linkedin.com/in/utsav-patel-422789320"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-icon-action"
            title="LinkedIn Profile"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span>LinkedIn</span>
          </a>
        </div>

        {/* Engineering Credentials Quick Grid */}
        <div className="hero-metrics-strip">
          <div className="hero-metric-item">
            <span className="metric-label">University</span>
            <span className="metric-value">CSPIT, CHARUSAT</span>
          </div>
          <div className="hero-metric-item">
            <span className="metric-label">Degree</span>
            <span className="metric-value">B.Tech AI &amp; ML (3rd Year)</span>
          </div>
          <div className="hero-metric-item">
            <span className="metric-label">Academic CGPA</span>
            <span className="metric-value">7.44 / 10.0</span>
          </div>
          <div className="hero-metric-item">
            <span className="metric-label">Core Domains</span>
            <span className="metric-value">Computer Vision &amp; Web</span>
          </div>
        </div>

        {/* Professional Core Tech Strip */}
        <div className="hero-tech-strip">
          <div className="tech-strip-header">
            <span>Primary Technology Stack</span>
          </div>
          <div className="tech-strip-grid">
            {coreTech.map((item, idx) => {
              const Icon = item.Logo;
              return (
                <div key={idx} className="tech-badge-chip">
                  <Icon size={18} />
                  <div className="tech-badge-text">
                    <span className="tech-name">{item.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
