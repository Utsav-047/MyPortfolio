import React, { useState, useEffect } from 'react';

// Language color mapping (matches GitHub's language colors)
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  R: '#198CE7',
  Lua: '#000080',
  Perl: '#0298c3',
  Scala: '#c22d40',
  'Jupyter Notebook': '#DA5B0B',
  Vue: '#41b883',
  SCSS: '#c6538c',
  Dockerfile: '#384d54',
  Unknown: '#8b949e',
};

function Projects({ color = '#6366f1' }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/users/Utsav-047/repos?per_page=100&sort=updated'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch GitHub repositories');
        }

        const data = await response.json();

        // Sort by latest updated, exclude forked repos
        const sortedProjects = data
          .filter((repo) => !repo.fork)
          .sort(
            (a, b) =>
              new Date(b.updated_at) - new Date(a.updated_at)
          );

        setProjects(sortedProjects);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="page-view">
        <section className="section-card">
          <div className="section-tag" style={{ color: color }}>My Work</div>
          <h2 className="section-title">Projects</h2>
          <p className="section-subtitle">Fetching repositories from GitHub...</p>
          <div className="gh-projects-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="gh-project-card gh-skeleton-card">
                <div className="gh-skeleton-line gh-skeleton-title"></div>
                <div className="gh-skeleton-line gh-skeleton-desc"></div>
                <div className="gh-skeleton-line gh-skeleton-desc short"></div>
                <div className="gh-skeleton-meta"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-view">
        <section className="section-card">
          <div className="section-tag" style={{ color: color }}>My Work</div>
          <h2 className="section-title">Projects</h2>
          <div className="gh-error-state">
            <span className="gh-error-icon">⚠️</span>
            <p>Unable to load repositories: {error}</p>
            <button
              className="gh-retry-btn"
              style={{ backgroundColor: color }}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-view">
      <section className="section-card">
        <div className="section-tag" style={{ color: color }}>My Work</div>
        <h2 className="section-title">Projects</h2>
        <p className="section-subtitle">
          All my public repositories fetched live from GitHub — showcasing AI, ML, and web development work.
        </p>

        <div className="gh-projects-grid">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="gh-project-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Card Header: Repo icon + name */}
              <div className="gh-card-header">
                <svg className="gh-repo-icon" viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
                </svg>
                <h3 className="gh-card-title">{project.name}</h3>
              </div>

              {/* Description */}
              <p className="gh-card-desc">
                {project.description || 'No description available.'}
              </p>

              {/* Bottom meta: language, stars, forks, watchers */}
              <div className="gh-card-meta">
                {project.language && (
                  <span className="gh-meta-item gh-meta-lang">
                    <span
                      className="gh-lang-dot"
                      style={{
                        backgroundColor:
                          LANGUAGE_COLORS[project.language] ||
                          LANGUAGE_COLORS['Unknown'],
                      }}
                    ></span>
                    {project.language}
                  </span>
                )}

                <span className="gh-meta-item" title="Stars">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                    <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                  </svg>
                  {project.stargazers_count}
                </span>

                <span className="gh-meta-item" title="Forks">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                    <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 0-1.5 0v.878h-3v-.878a2.25 2.25 0 1 0-1.5 0ZM8 1.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm-2.75 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm5.5 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5ZM8 14a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm0-1.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                  </svg>
                  {project.forks_count}
                </span>

                <span className="gh-meta-item" title="Watchers">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                    <path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.831.88 9.577.43 8.899a1.62 1.62 0 0 1 0-1.798c.45-.678 1.367-1.932 2.637-3.023C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.824.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 10Z" />
                  </svg>
                  {project.watchers_count}
                </span>
              </div>

              {/* View on GitHub link */}
              <a
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="gh-view-link"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                </svg>
                View GitHub
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Projects;
