import { useState } from 'react';

function Contact({ email, phone, location, github, linkedin, color }) {
  const qaData = [
    {
      question: 'What is your current focus?',
      answer: 'I am currently focusing on building high-performance web applications using React, Node.js, and integrating AI microservices using Python and Machine Learning models.'
    },
    {
      question: 'What are your career goals?',
      answer: 'I aim to work at the intersection of AI/ML and Frontend Engineering, developing intelligent user interfaces that make machine learning models accessible and useful for everyday users.'
    },
    {
      question: 'Are you open to internships?',
      answer: 'Yes! I am actively looking for software engineering or AI/ML intern roles. Feel free to contact me via email or LinkedIn!'
    },
    {
      question: 'What are your favorite tools?',
      answer: 'My favorite stack includes React/Vite, Python for data science, VS Code, Git, and Figma for quick UI prototyping.'
    }
  ];

  const [activeQA, setActiveQA] = useState(qaData[0]);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="page-view">
      <section className="section-card">
        <div className="section-tag" style={{ color }}>Get In Touch</div>
        <h2 className="section-title">Contact Me</h2>
        <p className="section-subtitle">
          Feel free to reach out for internship opportunities, project collaborations, or just to say hello!
        </p>

        <div className="contact-layout">
          {/* Left Column: Contact Info + Form */}
          <div className="contact-left">
            {/* Contact Details Card */}
            <div className="contact-info-card" style={{ borderTop: `3px solid ${color}` }}>
              <div className="contact-info-title">
                <span className="contact-title-icon" style={{ color }}>📬</span>
                Connect Directly
              </div>
              <div className="contact-methods">
                {email && (
                  <a href={`mailto:${email}`} className="contact-method-item contact-method-link">
                    <span className="contact-method-icon" style={{ background: `${color}15`, color }}>✉️</span>
                    <div>
                      <div className="contact-method-label">Email</div>
                      <span className="contact-method-value">{email}</span>
                    </div>
                  </a>
                )}
                {phone && (
                  <a href={`tel:${phone}`} className="contact-method-item contact-method-link">
                    <span className="contact-method-icon" style={{ background: `${color}15`, color }}>📞</span>
                    <div>
                      <div className="contact-method-label">Phone</div>
                      <span className="contact-method-value">{phone}</span>
                    </div>
                  </a>
                )}
                {location && (
                  <div className="contact-method-item">
                    <span className="contact-method-icon" style={{ background: `${color}15`, color }}>📍</span>
                    <div>
                      <div className="contact-method-label">Location</div>
                      <span className="contact-method-value">{location}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="contact-social-row">
                {github && (
                  <a
                    href={github.startsWith('http') ? github : `https://github.com/${github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-pill"
                    style={{ borderColor: `${color}40`, color }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-pill"
                    style={{ borderColor: `${color}40`, color }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Quick Message Form */}
            <div className="contact-form-card" style={{ borderTop: `3px solid ${color}` }}>
              <div className="contact-info-title">
                <span className="contact-title-icon" style={{ color }}>✉️</span>
                Send a Message
              </div>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ borderColor: `${color}40` }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ borderColor: `${color}40` }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Write your message here..."
                    rows="4"
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    required
                    style={{ borderColor: `${color}40` }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary form-submit-btn"
                  style={{ backgroundColor: color, borderColor: color }}
                >
                  {sent ? '✓ Message Sent!' : 'Send Message →'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Q&A Widget */}
          <div className="contact-right">
            <div className="qa-card" style={{ borderTop: `3px solid ${color}` }}>
              <div className="contact-info-title">
                <span className="contact-title-icon" style={{ color }}>💬</span>
                Frequently Asked
              </div>
              <p className="qa-intro-text">
                Click a question to learn more about my background and goals:
              </p>
              <div className="qa-options">
                {qaData.map((qa, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`qa-option-btn ${activeQA === qa ? 'qa-option-active' : ''}`}
                    style={activeQA === qa ? { borderColor: color, color: color } : {}}
                    onClick={() => setActiveQA(qa)}
                  >
                    {qa.question}
                  </button>
                ))}
              </div>

              {activeQA && (
                <div className="qa-response-box" style={{ borderLeft: `3px solid ${color}` }}>
                  <div className="qa-response-question" style={{ color }}>{activeQA.question}</div>
                  <p className="qa-response-text">{activeQA.answer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
