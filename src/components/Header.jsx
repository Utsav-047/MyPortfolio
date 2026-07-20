
function Header({ name, title, bio, stats, color }) {
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const defaultStats = [
    { label: 'ML Models Built', value: '5+' },
    { label: 'Tech Stack', value: '10+' },
    { label: 'Experience', value: 'Fresher' },
    { label: 'Datasets Analysed', value: '5+' }
  ];

  const statsToRender = Array.isArray(stats) ? stats : defaultStats;

  return (
    <header id="home" className="section-card">
      <div className="hero-layout">
        {/* Left Side: Personal Info & CTAs */}
        <div className="hero-left">
          <a href="#" className="hero-logo-btn" onClick={(e) => { e.preventDefault(); handleScrollTo('home'); }}>
            <span className="hero-logo-dot" style={{ backgroundColor: color }}></span>
            {name ? name.toLowerCase() + '.dev' : 'portfolio.dev'}
          </a>
          
          <h1 className="hero-name-big">{name || 'Your Name'}</h1>
          <p className="hero-headline" style={{ color: color }}>{title || 'AI & ML Developer • Full Stack'}</p>
          <p className="hero-desc">
            {bio || 'I build intelligent systems and data-driven applications - from machine learning models and FastAPI backends to interactive React dashboards and cloud-deployed pipelines.'}
          </p>

          <div className="hero-ctas">
            <button 
              className="btn-primary" 
              style={{ backgroundColor: color, borderColor: color }}
              onClick={() => handleScrollTo('ask-me')}
            >
              Let's Talk &rarr;
            </button>
            <button 
              className="btn-secondary"
              onClick={() => handleScrollTo('about')}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Right Side: Quick Stats Card (Matches Screenshot 1 Right) */}
        <div className="hero-right">
          <div className="quick-stats-card">
            <div className="stats-card-header">Quick Stats</div>
            {statsToRender.map((stat, idx) => (
              <div key={idx} className="stat-item">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value" style={{ color: color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;