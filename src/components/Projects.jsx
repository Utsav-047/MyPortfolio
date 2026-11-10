import React, { useState, useEffect } from 'react';

// Language color mapping (matches GitHub's official colors)
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  'Jupyter Notebook': '#DA5B0B',
  Unknown: '#8b949e',
};

// Rich curated project repository catalog with human-written descriptions and tech tags
const CURATED_PROJECT_DETAILS = {
  'myportfolio': {
    title: 'MyPortfolio & Task Management Hub',
    description: 'Production-grade full-stack developer portfolio and role-based task management platform. Features JWT authentication, MongoDB Atlas, in-memory caching, SSE streaming, and FormSubmit contact delivery.',
    tags: ['React 19', 'Node.js', 'Express', 'MongoDB Atlas', 'JWT'],
    category: 'web',
    featured: true,
    liveUrl: 'https://myportfolio-frontend-6xmm.onrender.com'
  },
  'smart-attendance-system': {
    title: 'Smart Attendance System (OpenCV & Python)',
    description: 'Real-time facial recognition attendance automation software built with OpenCV, Haar Cascades, and Python Tkinter GUI for automated student and workplace presence logging.',
    tags: ['Python', 'OpenCV', 'Computer Vision', 'Tkinter'],
    category: 'aiml',
    featured: true,
    liveUrl: null
  },
  'video-summeriser-and-quiz-generator': {
    title: 'Video Summarizer & Quiz Generator',
    description: 'AI-driven educational tool that extracts video transcripts, synthesizes key concepts into structured bullet-point summaries, and automatically generates interactive quizzes for active learning.',
    tags: ['Python', 'NLP', 'React', 'Transcript API', 'AI'],
    category: 'aiml',
    featured: true,
    liveUrl: null
  },
  'baja-rulebot': {
    title: 'BAJA RuleBot (Conversational AI)',
    description: 'Intelligent conversational assistant trained on BAJA SAE vehicle engineering rules, compliance standards, and mechanical competition guidelines for automotive student teams.',
    tags: ['Python', 'NLP', 'LlamaIndex', 'Conversational AI'],
    category: 'aiml',
    featured: true,
    liveUrl: null
  },
  'khata-manager': {
    title: 'Khata Manager (Ledger & Bookkeeping)',
    description: 'Full-stack bookkeeping and merchant credit management application. Enables small business owners to track credit/debit histories, record payments, and monitor outstanding customer balances.',
    tags: ['TypeScript', 'React', 'Node.js', 'Express', 'Tailwind'],
    category: 'web',
    featured: true,
    liveUrl: null
  },
  'ai-study-assistant': {
    title: 'AI Study Assistant',
    description: 'Interactive study companion utilizing language models to answer course questions, break down complex concepts, and generate custom revision cards for students.',
    tags: ['JavaScript', 'React', 'Node.js', 'AI API'],
    category: 'aiml',
    featured: false,
    liveUrl: null
  },
  'ai-personal-finance-tracker': {
    title: 'AI Personal Finance Tracker',
    description: 'Expense tracking application with automated transaction categorization, monthly spending forecasting, and interactive data visualization charts.',
    tags: ['React', 'Express', 'Scikit-Learn', 'Chart.js'],
    category: 'aiml',
    featured: true,
    liveUrl: null
  }
};

// Fallback list of curated projects for offline or initial display
const DEFAULT_PROJECTS = [
  {
    id: 'repo-myportfolio',
    name: 'MyPortfolio',
    cleanName: 'MyPortfolio & Task Management Hub',
    description: CURATED_PROJECT_DETAILS['myportfolio'].description,
    tags: CURATED_PROJECT_DETAILS['myportfolio'].tags,
    category: 'web',
    featured: true,
    language: 'JavaScript',
    stargazers_count: 5,
    forks_count: 1,
    html_url: 'https://github.com/Utsav-047/MyPortfolio',
    liveUrl: 'https://myportfolio-frontend-6xmm.onrender.com'
  },
  {
    id: 'repo-smart-attendance',
    name: 'Smart-Attendance-System',
    cleanName: 'Smart Attendance System (OpenCV & Python)',
    description: CURATED_PROJECT_DETAILS['smart-attendance-system'].description,
    tags: CURATED_PROJECT_DETAILS['smart-attendance-system'].tags,
    category: 'aiml',
    featured: true,
    language: 'Python',
    stargazers_count: 4,
    forks_count: 2,
    html_url: 'https://github.com/Utsav-047',
    liveUrl: null
  },
  {
    id: 'repo-video-quiz',
    name: 'VIDEO-SUMMERISER-AND-QUIZ-GENERATOR',
    cleanName: 'Video Summarizer & Quiz Generator',
    description: CURATED_PROJECT_DETAILS['video-summeriser-and-quiz-generator'].description,
    tags: CURATED_PROJECT_DETAILS['video-summeriser-and-quiz-generator'].tags,
    category: 'aiml',
    featured: true,
    language: 'Python',
    stargazers_count: 3,
    forks_count: 1,
    html_url: 'https://github.com/Utsav-047/VIDEO-SUMMERISER-AND-QUIZ-GENERATOR',
    liveUrl: null
  },
  {
    id: 'repo-baja-rulebot',
    name: 'baja-rulebot',
    cleanName: 'BAJA RuleBot (Conversational AI)',
    description: CURATED_PROJECT_DETAILS['baja-rulebot'].description,
    tags: CURATED_PROJECT_DETAILS['baja-rulebot'].tags,
    category: 'aiml',
    featured: true,
    language: 'Python',
    stargazers_count: 4,
    forks_count: 1,
    html_url: 'https://github.com/Utsav-047/baja-rulebot',
    liveUrl: null
  },
  {
    id: 'repo-khata-manager',
    name: 'Khata-manager',
    cleanName: 'Khata Manager (Ledger & Bookkeeping)',
    description: CURATED_PROJECT_DETAILS['khata-manager'].description,
    tags: CURATED_PROJECT_DETAILS['khata-manager'].tags,
    category: 'web',
    featured: true,
    language: 'TypeScript',
    stargazers_count: 3,
    forks_count: 0,
    html_url: 'https://github.com/Utsav-047/Khata-manager',
    liveUrl: null
  },
  {
    id: 'repo-ai-study-assistant',
    name: 'AI-STUDY-ASSISTANT',
    cleanName: 'AI Study Assistant',
    description: CURATED_PROJECT_DETAILS['ai-study-assistant'].description,
    tags: CURATED_PROJECT_DETAILS['ai-study-assistant'].tags,
    category: 'aiml',
    featured: false,
    language: 'JavaScript',
    stargazers_count: 2,
    forks_count: 0,
    html_url: 'https://github.com/Utsav-047/AI-STUDY-ASSISTANT',
    liveUrl: null
  }
];

function Projects() {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'featured' | 'aiml' | 'web'
  const [refreshing, setRefreshing] = useState(false);

  // Helper to enrich raw GitHub repo data with human-written descriptions
  const enrichRepo = (repo) => {
    const key = repo.name.toLowerCase();
    const curated = CURATED_PROJECT_DETAILS[key];

    let cleanName = repo.name
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    let description = repo.description;
    let tags = [repo.language || 'Software'];
    let category = 'web';
    let featured = false;
    let liveUrl = repo.homepage || null;

    if (curated) {
      cleanName = curated.title;
      description = curated.description;
      tags = curated.tags;
      category = curated.category;
      featured = curated.featured;
      if (curated.liveUrl) liveUrl = curated.liveUrl;
    } else {
      if (!description || description.trim() === '') {
        if (key.includes('exam') || key.includes('itue')) {
          description = 'Coursework repository containing academic engineering practical implementations, algorithm solutions, and lab evaluations.';
          category = 'web';
        } else if (key.includes('ai') || key.includes('ml')) {
          description = 'Applied machine learning and artificial intelligence project investigating neural networks, datasets, and predictive modeling.';
          category = 'aiml';
        } else {
          description = 'Software engineering project repository focusing on clean code principles, modular architecture, and modern developer workflows.';
          category = 'web';
        }
      }
    }

    return {
      ...repo,
      cleanName,
      description,
      tags,
      category,
      featured,
      liveUrl
    };
  };

  const fetchLiveRepos = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('https://api.github.com/users/Utsav-047/repos?per_page=100&sort=updated');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const processed = data
            .filter(r => !r.fork)
            .map(enrichRepo)
            .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
          setProjects(processed);
          localStorage.setItem('utsav_github_repos_v2', JSON.stringify({
            data: processed,
            time: Date.now()
          }));
        }
      }
    } catch (e) {
      console.warn('Could not refresh live GitHub repositories:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    try {
      const cached = localStorage.getItem('utsav_github_repos_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
          setProjects(parsed.data);
          return;
        }
      }
    } catch {}

    fetchLiveRepos();
  }, []);

  // Filter projects based on selected filter tab
  const filteredProjects = projects.filter(p => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'featured') return p.featured;
    if (selectedCategory === 'aiml') return p.category === 'aiml';
    if (selectedCategory === 'web') return p.category === 'web';
    return true;
  });

  return (
    <div className="page-view">
      <section className="projects-human-section">
        {/* Section Header */}
        <div className="projects-header-block">
          <div className="projects-title-col">
            <span className="section-kicker">Portfolio &amp; Open Source</span>
            <h2 className="section-title-human">Featured Engineering Projects</h2>
            <p className="projects-header-desc">
              Applied Machine Learning pipelines, Computer Vision systems, and modern Full-Stack web applications built with production best practices.
            </p>
          </div>

          {/* Sync status */}
          <div className="projects-sync-ctrl">
            <button
              onClick={fetchLiveRepos}
              disabled={refreshing}
              className="projects-refresh-btn"
              title="Sync with GitHub API"
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={refreshing ? 'spin-icon' : ''}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>{refreshing ? 'Syncing...' : 'Sync GitHub'}</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="projects-filter-bar">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Repositories ({projects.length})
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'featured' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('featured')}
          >
            ⭐ Featured Highlights
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'aiml' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('aiml')}
          >
            🤖 AI, ML &amp; Computer Vision
          </button>
          <button
            className={`filter-btn ${selectedCategory === 'web' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('web')}
          >
            💻 Full-Stack &amp; Web
          </button>
        </div>

        {/* Project Cards Grid */}
        <div className="projects-card-grid">
          {filteredProjects.map((project, idx) => (
            <div 
              key={project.id || idx} 
              className={`project-human-card ${project.featured ? 'is-featured' : ''}`}
            >
              {/* Card Header */}
              <div className="card-top-row">
                <div className="card-category-tag">
                  {project.category === 'aiml' ? 'AI & Machine Learning' : 'Full-Stack Web'}
                </div>

                <div className="card-metrics-row">
                  {project.stargazers_count > 0 && (
                    <span className="metric-chip" title="GitHub Stars">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      {project.stargazers_count}
                    </span>
                  )}
                  {project.language && (
                    <span className="metric-chip">
                      <span 
                        className="lang-color-circle" 
                        style={{ backgroundColor: LANGUAGE_COLORS[project.language] || '#8b949e' }}
                      />
                      {project.language}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="project-title-human">{project.cleanName}</h3>
              <p className="project-desc-human">{project.description}</p>

              {/* Tech Tags */}
              <div className="project-tags-wrap">
                {project.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="project-tech-chip">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Card Footer Actions */}
              <div className="project-actions-footer">
                <a
                  href={project.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-action-link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Source Code</span>
                </a>

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-action-link live-link"
                  >
                    <span>Live Demo</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Projects;
