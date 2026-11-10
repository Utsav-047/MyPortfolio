import React, { useState } from 'react';
import { 
  PythonLogo, 
  ReactLogo, 
  TensorFlowLogo, 
  OpenCVLogo, 
  JavaScriptLogo, 
  HTMLLogo, 
  MySQLLogo, 
  GitLogo, 
  NodeLogo,
  CppLogo,
  MongoLogo,
  DockerLogo,
  SklearnLogo
} from './TechLogos';

function Skills() {
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'resume'

  const skillCategories = [
    {
      id: 'languages',
      title: 'Programming Languages',
      description: 'Core languages used for machine learning models, algorithms, and full-stack development.',
      skills: [
        {
          name: 'Python',
          level: 'Core Stack',
          context: 'Primary language for Machine Learning, OpenCV, automation scripts, and backend data processing.',
          Logo: PythonLogo
        },
        {
          name: 'C++',
          level: 'Proficient',
          context: 'Data structures, algorithm implementations, object-oriented programming, and system fundamentals.',
          Logo: CppLogo
        },
        {
          name: 'JavaScript (ES6+)',
          level: 'Core Stack',
          context: 'Asynchronous event handling, modern DOM manipulation, React ecosystem, and Node.js APIs.',
          Logo: JavaScriptLogo
        },
        {
          name: 'SQL',
          level: 'Proficient',
          context: 'Relational database schema modeling, queries, joins, indexes, and aggregation operations.',
          Logo: MySQLLogo
        },
        {
          name: 'HTML5 & CSS3',
          level: 'Core Stack',
          context: 'Semantic markup, accessibility standards, responsive grid/flexbox layouts, and CSS variables.',
          Logo: HTMLLogo
        }
      ]
    },
    {
      id: 'aiml',
      title: 'AI, Machine Learning & Computer Vision',
      description: 'Frameworks and libraries for training predictive models, processing images, and building AI tools.',
      skills: [
        {
          name: 'OpenCV',
          level: 'Applied in Projects',
          context: 'Real-time face detection, video frame processing, image transformations, and feature extraction.',
          Logo: OpenCVLogo
        },
        {
          name: 'TensorFlow / Keras',
          level: 'Proficient',
          context: 'Deep learning neural network architectures, image classification, and model training pipelines.',
          Logo: TensorFlowLogo
        },
        {
          name: 'Scikit-Learn',
          level: 'Core Stack',
          context: 'Regression, classification algorithms, clustering, cross-validation, and performance evaluation metrics.',
          Logo: SklearnLogo
        },
        {
          name: 'Pandas & NumPy',
          level: 'Core Stack',
          context: 'High-performance numerical computing, matrix operations, data wrangling, and exploratory analysis.',
          Logo: PythonLogo
        },
        {
          name: 'Natural Language Processing (NLP)',
          level: 'Applied in Projects',
          context: 'Tokenization, text preprocessing, embeddings, transcript summarization, and query extraction.',
          Logo: PythonLogo
        }
      ]
    },
    {
      id: 'web',
      title: 'Web & Full-Stack Engineering',
      description: 'Technologies for creating reactive user interfaces, server-side APIs, and microservices.',
      skills: [
        {
          name: 'React.js 19',
          level: 'Core Stack',
          context: 'Component lifecycles, hooks, context state management, lazy loading chunks, and responsive design.',
          Logo: ReactLogo
        },
        {
          name: 'Node.js & Express.js',
          level: 'Core Stack',
          context: 'Scalable RESTful microservices, custom middleware, rate-limiting, and error handling pipelines.',
          Logo: NodeLogo
        },
        {
          name: 'RESTful API Design',
          level: 'Proficient',
          context: 'HTTP methods, status codes, JWT Bearer authentication gates, and CORS configuration.',
          Logo: WebDevIconAlt
        },
        {
          name: 'Vite & Modern Tooling',
          level: 'Core Stack',
          context: 'ES-module fast bundling, code splitting, dynamic imports, and production asset optimization.',
          Logo: ReactLogo
        }
      ]
    },
    {
      id: 'tools',
      title: 'Databases, DevOps & Developer Tools',
      description: 'Production databases, version control workflows, containerization, and automated pipelines.',
      skills: [
        {
          name: 'MongoDB Atlas',
          level: 'Core Stack',
          context: 'NoSQL document schemas, Mongoose ODM, index optimization, and Atlas cloud clusters.',
          Logo: MongoLogo
        },
        {
          name: 'MySQL',
          level: 'Proficient',
          context: 'Relational table normalization, primary/foreign key relationships, and ACID compliance.',
          Logo: MySQLLogo
        },
        {
          name: 'Git & GitHub',
          level: 'Core Stack',
          context: 'Distributed version control, branching strategies, commit cleanliness, and pull request reviews.',
          Logo: GitLogo
        },
        {
          name: 'Docker & Compose',
          level: 'Applied in Projects',
          context: 'Multi-container orchestration, Dockerfiles, isolated network bridges, and persistent volumes.',
          Logo: DockerLogo
        },
        {
          name: 'GitHub Actions (CI/CD)',
          level: 'Applied in Projects',
          context: 'Automated workflow pipelines, ESLint quality checks, Jest test suites, and build validation.',
          Logo: GitLogo
        }
      ]
    }
  ];

  return (
    <div className="page-view">
      <section className="skills-human-section">
        {/* Section Header with View Mode Switcher */}
        <div className="skills-header-row">
          <div>
            <span className="section-kicker">Technical Competencies</span>
            <h2 className="section-title-human">Skills &amp; Technologies</h2>
            <p className="skills-header-desc">
              Organized according to industry standard engineering resume categories — with verified project applications.
            </p>
          </div>

          {/* Mode Switcher: Grid View vs Clean Resume View */}
          <div className="skills-view-toggle">
            <button
              className={`toggle-view-btn ${activeTab === 'grid' ? 'active' : ''}`}
              onClick={() => setActiveTab('grid')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>Category Grid</span>
            </button>
            <button
              className={`toggle-view-btn ${activeTab === 'resume' ? 'active' : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span>Resume Format</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: CATEGORY GRID */}
        {activeTab === 'grid' && (
          <div className="skills-categories-wrapper">
            {skillCategories.map((category) => (
              <div key={category.id} className="skill-category-block">
                <div className="category-header-bar">
                  <h3 className="category-title">{category.title}</h3>
                  <span className="category-desc">{category.description}</span>
                </div>

                <div className="skills-cards-grid">
                  {category.skills.map((skill, sIdx) => {
                    const Icon = skill.Logo;
                    return (
                      <div key={sIdx} className="skill-item-card">
                        <div className="skill-card-top">
                          <div className="skill-logo-wrap">
                            <Icon size={24} />
                          </div>
                          <span className={`skill-level-badge level-${skill.level.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                            {skill.level}
                          </span>
                        </div>

                        <h4 className="skill-name-human">{skill.name}</h4>
                        <p className="skill-context-text">{skill.context}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: RECRUITER RESUME FORMAT */}
        {activeTab === 'resume' && (
          <div className="resume-skills-sheet">
            <div className="resume-sheet-header">
              <span className="sheet-badge">TECHNICAL RESUME SPECIFICATION</span>
              <h3 className="sheet-title">Technical Skill Summary</h3>
              <p className="sheet-desc">
                Concise, standardized format ready for engineering recruitment and technical evaluation.
              </p>
            </div>

            <div className="resume-skills-table">
              <div className="resume-table-row">
                <div className="resume-col-label">Languages</div>
                <div className="resume-col-content">
                  <strong>Python</strong> (Primary), <strong>C++</strong>, <strong>JavaScript (ES6+)</strong>, <strong>SQL</strong> (MySQL, PostgreSQL basics), <strong>HTML5 / CSS3</strong>
                </div>
              </div>

              <div className="resume-table-row">
                <div className="resume-col-label">AI &amp; Machine Learning</div>
                <div className="resume-col-content">
                  <strong>OpenCV</strong> (Face Detection &amp; Computer Vision), <strong>TensorFlow / Keras</strong>, <strong>Scikit-Learn</strong>, Deep Learning (CNNs), Natural Language Processing (NLP), Pandas, NumPy
                </div>
              </div>

              <div className="resume-table-row">
                <div className="resume-col-label">Web &amp; Frameworks</div>
                <div className="resume-col-content">
                  <strong>React.js</strong> (Hooks, Context, Dynamic Imports), <strong>Node.js</strong>, <strong>Express.js</strong>, RESTful API Architecture, JWT Authentication, CORS, Vite
                </div>
              </div>

              <div className="resume-table-row">
                <div className="resume-col-label">Databases &amp; Storage</div>
                <div className="resume-col-content">
                  <strong>MongoDB Atlas</strong> (Mongoose ODM, Document Collections), <strong>MySQL</strong> (Relational Modeling &amp; Normalization)
                </div>
              </div>

              <div className="resume-table-row">
                <div className="resume-col-label">Tools &amp; DevOps</div>
                <div className="resume-col-content">
                  <strong>Git &amp; GitHub</strong>, <strong>Docker &amp; Docker Compose</strong>, <strong>GitHub Actions (CI/CD)</strong>, Postman, Linux / Bash fundamentals, VS Code
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// Simple fallback icon for REST APIs
function WebDevIconAlt({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  );
}

export default Skills;
