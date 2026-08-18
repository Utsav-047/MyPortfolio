import { useState, useEffect } from 'react';
import Home from './components/Home';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import TaskManager from './components/TaskManager';
import Contact from './components/Contact';
import Footer from './components/Footer';
import GoogleAuthBtn from './components/GoogleAuthBtn';

function App() {
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

    // Skills grouped (Matches Screenshot 2 layout)
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

  // 2. Active Page Routing State ('home' | 'about' | 'skills' | 'projects' | 'contact')
  const [currentPage, setCurrentPage] = useState('home');

  // 3. Inject dynamic CSS Custom Properties for themes
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

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // 4. Render active page component
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            name={profile.name} 
            title={profile.title} 
            bio={profile.bio} 
            stats={profile.stats} 
            color={profile.themeColor} 
            onNavigate={setCurrentPage}
          />
        );
      case 'about':
        return (
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
        );
      case 'skills':
        return (
          <Skills 
            skillList={profile.skills} 
            color={profile.themeColor} 
          />
        );
      case 'projects':
        return (
          <Projects 
            projects={profile.projects} 
            color={profile.themeColor} 
          />
        );
      case 'taskmanager':
        return (
          <TaskManager 
            color={profile.themeColor} 
          />
        );
      case 'contact':
        return (
          <Contact 
            email={profile.email} 
            phone={profile.phone}
            location={profile.location}
            github={profile.github} 
            linkedin={profile.linkedin} 
            color={profile.themeColor}
          />
        );
      default:
        return (
          <Home 
            name={profile.name} 
            title={profile.title} 
            bio={profile.bio} 
            stats={profile.stats} 
            color={profile.themeColor} 
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sticky Top Header NavBar (Matches Screenshot 1 Nav Bar styling) */}
      <header className="app-header">
        <div className="header-wrapper">
          <button 
            className="brand-logo" 
            onClick={() => setCurrentPage('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span className="brand-dot" style={{ backgroundColor: profile.themeColor }}></span>
            {profile.name ? profile.name.toLowerCase().replace(/\s+/g, '') + '.dev' : 'portfolio.dev'}
          </button>
          
          <nav className="nav-menu">
            <button 
              className={`nav-item-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>
            <button 
              className={`nav-item-link ${currentPage === 'about' ? 'active' : ''}`}
              onClick={() => setCurrentPage('about')}
            >
              About
            </button>
            <button 
              className={`nav-item-link ${currentPage === 'skills' ? 'active' : ''}`}
              onClick={() => setCurrentPage('skills')}
            >
              Skills
            </button>
            <button 
              className={`nav-item-link ${currentPage === 'projects' ? 'active' : ''}`}
              onClick={() => setCurrentPage('projects')}
            >
              Projects
            </button>
            <button 
              className={`nav-item-link ${currentPage === 'taskmanager' ? 'active' : ''}`}
              onClick={() => setCurrentPage('taskmanager')}
            >
              Task Manager
            </button>
            <button 
              className={`nav-contact-btn ${currentPage === 'contact' ? 'active' : ''}`}
              style={{ backgroundColor: profile.themeColor }}
              onClick={() => setCurrentPage('contact')}
            >
              Contact Me
            </button>
            <GoogleAuthBtn />
          </nav>
        </div>
      </header>

      {/* Main Page Routing Wrapper */}
      <main className="portfolio-content">
        {renderPage()}

        {/* Footer (Remains rendered at the bottom of all pages) */}
        <Footer 
          name={profile.name} 
          tagline={profile.bio}
          email={profile.email} 
          phone={profile.phone}
          location={profile.location}
          github={profile.github} 
          linkedin={profile.linkedin} 
          color={profile.themeColor}
          onNavigate={setCurrentPage}
        />
      </main>
    </div>
  );
}

export default App;
