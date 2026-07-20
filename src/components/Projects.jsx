function Projects({ projects, color }) {
  return (
    <div className="page-view">
      <section className="section-card">
        <div className="section-tag" style={{ color: color }}>My Work</div>
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-subtitle">
          A showcase of some of my favorite developments in AI, ML, and web technology.
        </p>
        
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-header">
                <span className="project-icon">{project.icon || '🚀'}</span>
              </div>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>
              {project.tags && project.tags.length > 0 && (
                <div className="project-tags">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="project-tag">{tag}</span>
                  ))}
                </div>
              )}
              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="project-link-btn"
                  style={{ color: color }}
                >
                  View Project 
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Projects;
