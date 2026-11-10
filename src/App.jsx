import React, { useState, useEffect, lazy, Suspense } from 'react';
import LoadingFallback from './components/LoadingFallback';
import Footer from './components/Footer';
import GoogleAuthBtn from './components/GoogleAuthBtn';
import AuthGate from './components/AuthGate';
import BrandLogo from './components/BrandLogo';

// ============================================================================
// Performance Optimization & Route-Level Dynamic Code Splitting
// Converting static imports to React.lazy() chunks
// ============================================================================
const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));
const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const TaskManager = lazy(() => import('./components/TaskManager'));
const Practical4 = lazy(() => import('./components/Practical4'));
const Practical5 = lazy(() => import('./components/Practical5'));
const Practical6 = lazy(() => import('./components/Practical6'));
const Contact = lazy(() => import('./components/Contact'));

function App() {
  // Lifted auth state — shared between GoogleAuthBtn (navbar) and AuthGate (task manager)
  const [, setAuthUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; }
  });

  // Dark / Light Mode Toggle State
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);
    }
    try {
      localStorage.setItem('portfolio_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // 1. Core Profile State (Utsav Patel's details)
  const [profile] = useState({
    name: 'Utsav Patel',
    title: 'AI & ML Student • Full-Stack Web Developer',
    bio: '3rd-year B.Tech AI & ML student at CSPIT, Charusat University. Experienced in computer vision, applied machine learning pipelines, and modern full-stack web applications with React and Node.js.',
    aboutTitle: 'AI & ML Developer, Web Tech Enthusiast',
    aboutBio: 'Hey there! I am Utsav Patel, a B.Tech AI & ML student at CSPIT, Charusat. I am passionate about exploring artificial intelligence, training predictive models, and building clean, responsive web applications using modern technologies like React, Node.js, and Python.',
    location: 'Changa, Gujarat, India',
    studies: 'B.Tech AI & ML (3rd Year)',
    focusArea: 'Computer Vision & Full-Stack Web',
    availability: 'Open to Summer Internships',
    email: 'utsavpatel788190@gmail.com',
    phone: '+91 9328292343',
    github: 'Utsav-047',
    linkedin: 'https://www.linkedin.com/in/utsav-patel-422789320',
    themeColor: '#09090b'
  });

  // 2. Active View State ('portfolio' | 'taskmanager') and active section on scroll
  const [viewMode, setViewMode] = useState('portfolio');
  const [activeSection, setActiveSection] = useState('home');
  const [taskManagerInitialTab, setTaskManagerInitialTab] = useState('tasks');

  // 3. Smooth scroll handler to navigate between portfolio sections
  const scrollToSection = (sectionId) => {
    if (viewMode !== 'portfolio') {
      setViewMode('portfolio');
      setActiveSection(sectionId);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    } else {
      setActiveSection(sectionId);
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // 4. Scroll spy listener to highlight active section in navbar dynamically
  useEffect(() => {
    if (viewMode !== 'portfolio') return;
    const sections = ['home', 'about', 'skills', 'projects', 'contact'];
    
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  // Scroll to top when switching to taskmanager
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewMode]);

  // 5. Render main content: either the single-page scrollable portfolio or the Task Manager workspace
  const renderContent = () => {
    if (viewMode === 'taskmanager') {
      return (
        <AuthGate onAuthChange={setAuthUser}>
          <TaskManager color={profile.themeColor} initialTab={taskManagerInitialTab} />
        </AuthGate>
      );
    }

    if (viewMode === 'practical4') return <Practical4 />;
    if (viewMode === 'practical5') return <Practical5 />;
    if (viewMode === 'practical6') return <Practical6 />;

    // Default: Complete, seamlessly scrollable single-page developer portfolio
    return (
      <div className="portfolio-scroll-view">
        <section id="home" className="portfolio-section">
          <Home 
            name={profile.name} 
            title={profile.title} 
            bio={profile.bio} 
            color={profile.themeColor} 
            onNavigate={scrollToSection}
          />
        </section>

        <section id="about" className="portfolio-section">
          <About 
            aboutBio={profile.aboutBio} 
            location={profile.location} 
            studies={profile.studies} 
            focusArea={profile.focusArea}
            availability={profile.availability}
          />
        </section>

        <section id="skills" className="portfolio-section">
          <Skills />
        </section>

        <section id="projects" className="portfolio-section">
          <Projects />
        </section>

        <section id="contact" className="portfolio-section">
          <Contact 
            email={profile.email} 
            phone={profile.phone}
            location={profile.location}
            github={profile.github} 
            linkedin={profile.linkedin} 
          />
        </section>
      </div>
    );
  };

  return (
    <div className={`app-container ${theme}`} data-theme={theme}>
      {/* Sticky Top Header NavBar */}
      <header className="app-header">
        <div className="header-wrapper">
          <button 
            className="brand-logo" 
            onClick={() => scrollToSection('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            title="Utsav Patel Portfolio"
          >
            <BrandLogo />
          </button>
          
          <nav className="nav-menu">
            <button 
              className={`nav-item-link ${viewMode === 'portfolio' && activeSection === 'home' ? 'active' : ''}`}
              onClick={() => scrollToSection('home')}
            >
              Home
            </button>
            <button 
              className={`nav-item-link ${viewMode === 'portfolio' && activeSection === 'about' ? 'active' : ''}`}
              onClick={() => scrollToSection('about')}
            >
              About
            </button>
            <button 
              className={`nav-item-link ${viewMode === 'portfolio' && activeSection === 'skills' ? 'active' : ''}`}
              onClick={() => scrollToSection('skills')}
            >
              Skills
            </button>
            <button 
              className={`nav-item-link ${viewMode === 'portfolio' && activeSection === 'projects' ? 'active' : ''}`}
              onClick={() => scrollToSection('projects')}
            >
              Projects
            </button>
            <button 
              className={`nav-item-link ${viewMode === 'taskmanager' ? 'active' : ''}`}
              onClick={() => {
                setTaskManagerInitialTab('tasks');
                setViewMode('taskmanager');
              }}
            >
              Task Manager
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>
            
            <button 
              className={`nav-contact-btn ${viewMode === 'portfolio' && activeSection === 'contact' ? 'active' : ''}`}
              onClick={() => scrollToSection('contact')}
            >
              Contact Me
            </button>
            <GoogleAuthBtn />
          </nav>
        </div>
      </header>

      {/* Main Content with Suspense */}
      <main className="portfolio-content">
        <Suspense fallback={
          <LoadingFallback 
            title="Loading Route Chunk..." 
            subtitle="Fetching split JavaScript bundle with React.lazy() & Suspense" 
          />
        }>
          {renderContent()}
        </Suspense>

        {/* Footer (Remains rendered at the bottom of all views) */}
        <Footer 
          name={profile.name} 
          tagline={profile.bio}
          email={profile.email} 
          phone={profile.phone}
          location={profile.location}
          github={profile.github} 
          linkedin={profile.linkedin} 
          onNavigate={(target) => {
            if (target === 'taskmanager') {
              setTaskManagerInitialTab('tasks');
              setViewMode('taskmanager');
            } else {
              scrollToSection(target);
            }
          }}
        />
      </main>
    </div>
  );
}

export default App;
