
function NavBar({ name, activeSection, sections = ['home', 'about', 'skills', 'projects'] }) {
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => handleScrollTo('home')}>
        <span className="dot"></span>
        {name || 'Portfolio'}
      </div>
      <div className="nav-links">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => handleScrollTo(section)}
            className={`nav-link ${activeSection === section ? 'active' : ''}`}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
