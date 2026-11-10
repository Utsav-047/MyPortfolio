import React from 'react';
import profileImg from '../assets/profile.jpeg';
import { 
  MLNeuralIcon, 
  WebDevIcon, 
  DataAnalysisIcon 
} from './TechLogos';

function About({ 
  aboutBio, 
  location = 'Changa, Gujarat, India', 
  studies = 'B.Tech AI & ML (3rd Year)', 
  focusArea = 'Computer Vision & Full-Stack Web', 
  availability = 'Open to Internships' 
}) {
  return (
    <div className="page-view">
      <section className="about-human-section">
        <div className="section-header-compact">
          <span className="section-kicker">Background &amp; Profile</span>
          <h2 className="section-title-human">About Me</h2>
        </div>

        <div className="about-human-grid">
          {/* Left Column: Portrait & Verified Identity Card */}
          <div className="about-profile-card">
            <div className="about-portrait-frame">
              <img src={profileImg} alt="Utsav Patel" className="about-portrait-img" />
              <div className="about-portrait-overlay"></div>
            </div>

            <div className="about-profile-meta">
              <h3 className="about-profile-name">Utsav Patel</h3>
              <p className="about-profile-tagline">AI &amp; ML Student • Web Developer</p>
              
              <div className="about-status-indicator">
                <span className="status-dot-active"></span>
                <span>{availability}</span>
              </div>

              <div className="about-quick-specs">
                <div className="spec-row">
                  <span className="spec-icon">🎓</span>
                  <div>
                    <div className="spec-label">Education</div>
                    <div className="spec-value">{studies}</div>
                  </div>
                </div>

                <div className="spec-row">
                  <span className="spec-icon">🏛️</span>
                  <div>
                    <div className="spec-label">Institution</div>
                    <div className="spec-value">CSPIT, CHARUSAT</div>
                  </div>
                </div>

                <div className="spec-row">
                  <span className="spec-icon">📍</span>
                  <div>
                    <div className="spec-label">Location</div>
                    <div className="spec-value">{location}</div>
                  </div>
                </div>

                <div className="spec-row">
                  <span className="spec-icon">🎯</span>
                  <div>
                    <div className="spec-label">Focus Area</div>
                    <div className="spec-value">{focusArea}</div>
                  </div>
                </div>

                <div className="spec-row">
                  <span className="spec-icon">📊</span>
                  <div>
                    <div className="spec-label">Academic CGPA</div>
                    <div className="spec-value">7.44 / 10.0</div>
                  </div>
                </div>
              </div>

              <div className="about-card-links">
                <a 
                  href="https://github.com/Utsav-047" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="profile-link-btn"
                >
                  GitHub
                </a>
                <a 
                  href="https://www.linkedin.com/in/utsav-patel-422789320" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="profile-link-btn"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Bio Narrative, Education, and Engineering Pillars */}
          <div className="about-details-col">
            <div className="about-bio-card">
              <h3 className="about-col-heading">
                Engineering intelligent systems at the intersection of Machine Learning &amp; Web Development.
              </h3>
              <p className="about-narrative-text">
                {aboutBio || "I am a 3rd-year Artificial Intelligence and Machine Learning undergraduate at Charusat University (CSPIT). My technical journey focuses on building practical computer vision models, training predictive machine learning pipelines, and developing clean, responsive full-stack web applications."}
              </p>
              <p className="about-narrative-text">
                I enjoy engineering solutions where machine learning algorithms integrate seamlessly into intuitive web interfaces. Whether training an OpenCV face-recognition pipeline, developing an automated task management platform, or fine-tuning conversational AI workflows, I value clean code, reproducible experiments, and user-centric software design.
              </p>
            </div>

            {/* Education & Academic Credentials */}
            <div className="about-education-card">
              <div className="edu-card-header">
                <div className="edu-badge">ACADEMIC BACKGROUND</div>
              </div>
              <div className="edu-item">
                <div className="edu-title-row">
                  <h4 className="edu-degree">Bachelor of Technology in Artificial Intelligence &amp; Machine Learning</h4>
                  <span className="edu-duration">2023 &ndash; 2027</span>
                </div>
                <div className="edu-institution">Chandubhai S. Patel Institute of Technology (CSPIT) &bull; Charusat University</div>
                <div className="edu-details">
                  <span><strong>Current CGPA:</strong> 7.44 / 10.0</span> &bull; 
                  <span><strong>Department:</strong> Department of Artificial Intelligence &amp; Machine Learning</span>
                </div>
                <div className="edu-coursework">
                  <span className="coursework-label">Relevant Coursework:</span>
                  <div className="coursework-tags">
                    <span className="course-chip">Data Structures &amp; Algorithms</span>
                    <span className="course-chip">Machine Learning</span>
                    <span className="course-chip">Computer Vision</span>
                    <span className="course-chip">Deep Learning</span>
                    <span className="course-chip">Database Systems (MySQL/MongoDB)</span>
                    <span className="course-chip">Web Engineering</span>
                    <span className="course-chip">Operating Systems</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What I Focus On (Engineering Pillars) */}
            <div className="about-pillars-card">
              <div className="edu-badge" style={{ marginBottom: '14px' }}>CORE ENGINEERING PILLARS</div>
              <div className="pillars-grid">
                <div className="pillar-item">
                  <div className="pillar-icon-box">
                    <MLNeuralIcon size={22} color="var(--theme-color)" />
                  </div>
                  <div>
                    <h5 className="pillar-title">Computer Vision &amp; Applied ML</h5>
                    <p className="pillar-desc">
                      Building real-time face detection with OpenCV, training predictive Scikit-Learn models, and developing automated classification workflows.
                    </p>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-icon-box">
                    <WebDevIcon size={22} color="var(--theme-color)" />
                  </div>
                  <div>
                    <h5 className="pillar-title">Full-Stack Web Architecture</h5>
                    <p className="pillar-desc">
                      Developing scalable single-page apps with React 19, building RESTful Express backends, JWT and Google OAuth authentication, and database schemas.
                    </p>
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-icon-box">
                    <DataAnalysisIcon size={22} color="#10b981" />
                  </div>
                  <div>
                    <h5 className="pillar-title">Data Engineering &amp; APIs</h5>
                    <p className="pillar-desc">
                      Transforming raw data into actionable dashboards, integrating external LLM endpoints with graceful fallbacks, and managing MongoDB Atlas clusters.
                    </p>
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
