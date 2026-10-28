import React, { useState, useEffect, lazy, Suspense } from 'react';
import LoadingFallback from './components/LoadingFallback';
import Footer from './components/Footer';
import GoogleAuthBtn from './components/GoogleAuthBtn';
import AuthGate from './components/AuthGate';
import BrandLogo from './components/BrandLogo';

// ============================================================================
// Practical 8: Performance Optimization & Route-Level Dynamic Code Splitting
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
  const [authUser, setAuthUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; }
  });

  // 1. Core Profile State (Utsav Patel's details)
  const [profile] = useState({
    name: 'Utsav Patel',
    title: 'AI & ML Student & Web Developer',
    bio: 'I am a 3rd year AI & ML student at CSPIT, passionate about Web Development, Artificial Intelligence, and Machine Learning. I love building intelligent, clean interfaces that bridge the gap between machine learning and human interaction.',
    aboutTitle: 'AI & ML Developer, Web Tech Enthusiast',
    aboutBio: 'Hey there! I am Utsav Patel, a B.Tech AI & ML student at CSPIT, Charusat. I am passionate about exploring artificial intelligence, training predictive models, and building clean, responsive web applications using modern technologies like React, Node.js, and Python.',
    location: 'Changa, Gujarat, India',
    studies: 'B.Tech AI & ML (3rd Year)',
    focusArea: 'AI / ML / Web Development',
    availability: 'Open to Internships',
    email: 'utsavpatel788190@gmail.com',
    phone: '+91 9328292343',
    github: 'Utsav-047',
    linkedin: 'https://www.linkedin.com/in/utsav-patel-422789320',
    themeColor: '#4f46e5',
    
    // Quick Stats Fields
    stats: [
      { label: 'ML Projects Built', value: '4+' },
      { label: 'Tech Stack', value: '10+' },
      { label: 'Experience', value: 'Student' },
      { label: 'Academic CGPA', value: '7.44' }
    ],

    // Floating Image Badges
    badges: ['AI & ML Student', 'Web Developer'],

    // Skills grouped
    skills: [
      { name: 'Python', category: 'AI & Machine Learning', level: 'Expert', percentage: 92, icon: 'python' },
      { name: 'Machine Learning', category: 'AI & Machine Learning', level: 'Expert', percentage: 88, icon: 'sklearn' },
      { name: 'Deep Learning', category: 'AI & Machine Learning', level: 'Advanced', percentage: 78, icon: 'tensorflow' },
      { name: 'OpenCV', category: 'AI & Machine Learning', level: 'Advanced', percentage: 82, icon: 'opencv' },
      { name: 'React JS', category: 'Web & Databases', level: 'Advanced', percentage: 85, icon: 'react' },
      { name: 'JavaScript', category: 'Web & Databases', level: 'Expert', percentage: 88, icon: 'javascript' },
      { name: 'HTML & CSS', category: 'Web & Databases', level: 'Expert', percentage: 90, icon: 'html' },
      { name: 'SQL / MySQL', category: 'Web & Databases', level: 'Advanced', percentage: 80, icon: 'mysql' }
    ],

    // Projects Grid
    projects: [
      {
        title: 'Smart Attendance System',
        description: 'Real-time face recognition based attendance system using OpenCV and Python.',
        tags: ['Python', 'OpenCV', 'Tkinter'],
        link: 'https://github.com/Utsav-047',
        icon: '🧠'
      },
      {
        title: 'BAJA RuleBot',
        description: 'AI-powered rule bot trained on BAJA SAE regulations for mechanical engineers.',
        tags: ['NLP', 'Python', 'LlamaIndex'],
        link: 'https://github.com/Utsav-047',
        icon: '🤖'
      },
      {
        title: 'AI Personal Finance Tracker',
        description: 'Personal finance expense manager with automated categorization using machine learning.',
        tags: ['React', 'Express', 'Chart.js'],
        link: 'https://github.com/Utsav-047',
        icon: '💰'
      }
    ]
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

  // 5. Inject dynamic CSS Custom Properties for themes
  useEffect(() => {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '79, 70, 229';
    };

    const color = profile.themeColor || '#4f46e5';
    const rgb = hexToRgb(color);
    document.documentElement.style.setProperty('--theme-color', color);
    document.documentElement.style.setProperty('--theme-color-rgb', rgb);
    document.documentElement.style.setProperty('--theme-color-light', `rgba(${rgb}, 0.08)`);
  }, [profile.themeColor]);

  // Scroll to top when switching to taskmanager
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewMode]);

  // 6. Render main content: either the single-page scrollable portfolio or the Task Manager workspace
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
            stats={profile.stats} 
            color={profile.themeColor} 
            onNavigate={scrollToSection}
          />
        </section>

        <section id="about" className="portfolio-section">
          <About 
            aboutTitle={profile.aboutTitle}
            aboutBio={profile.aboutBio} 
            location={profile.location} 
            studies={profile.studies} 
            focusArea={profile.focusArea}
            availability={profile.availability}
            badges={profile.badges}
            color={profile.themeColor}
          />
        </section>

        <section id="skills" className="portfolio-section">
          <Skills 
            skillList={profile.skills} 
            color={profile.themeColor} 
          />
        </section>

        <section id="projects" className="portfolio-section">
          <Projects 
            projects={profile.projects} 
            color={profile.themeColor} 
          />
        </section>

        <section id="contact" className="portfolio-section">
          <Contact 
            email={profile.email} 
            phone={profile.phone}
            location={profile.location}
            github={profile.github} 
            linkedin={profile.linkedin} 
            color={profile.themeColor}
          />
        </section>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Sticky Top Header NavBar */}
      <header className="app-header">
        <div className="header-wrapper">
          <button 
            className="brand-logo" 
            onClick={() => scrollToSection('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            title="Utsav Patel Portfolio"
          >
            <BrandLogo color={profile.themeColor} />
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
            
            <button 
              className={`nav-contact-btn ${viewMode === 'portfolio' && activeSection === 'contact' ? 'active' : ''}`}
              style={{ backgroundColor: profile.themeColor }}
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
          color={profile.themeColor}
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
