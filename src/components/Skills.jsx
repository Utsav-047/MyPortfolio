// Official SVG icon components using SimpleIcons paths
const SKILL_ICONS = {
  python: (
    <svg viewBox="0 0 128 128" width="36" height="36">
      <linearGradient id="py-a" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientUnits="userSpaceOnUse" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)">
        <stop offset="0" stopColor="#5A9FD4"/>
        <stop offset="1" stopColor="#306998"/>
      </linearGradient>
      <linearGradient id="py-b" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientUnits="userSpaceOnUse" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)">
        <stop offset="0" stopColor="#FFD43B"/>
        <stop offset="1" stopColor="#FFE873"/>
      </linearGradient>
      <path fill="url(#py-a)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H27.544c-7.175 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.833-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z"/>
      <path fill="url(#py-b)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z"/>
    </svg>
  ),
  tensorflow: (
    <svg viewBox="0 0 128 128" width="36" height="36">
      <path d="M62.72 0L1.28 36v72L64 144l62.72-36V36zm0 19.2l44.8 25.6v12.8L62.72 32zm0 32l44.8 25.6V89.6L62.72 64v-12.8zm0 32l44.8 25.6v12.8L62.72 96zm-44.8-51.2l44.8 25.6v12.8L17.92 32V32z" fill="#FF6F00"/>
    </svg>
  ),
  sklearn: (
    <svg viewBox="0 0 128 128" width="36" height="36">
      <path fill="#F7931E" d="M63.945 114.942c-28.965 0-52.642-23.68-52.642-52.645S34.98 9.654 63.945 9.654s52.642 23.678 52.642 52.643-23.678 52.645-52.642 52.645z"/>
      <path fill="#3499CD" d="M63.945 17.826c-24.622 0-44.47 19.85-44.47 44.471 0 24.623 19.848 44.47 44.47 44.47s44.47-19.847 44.47-44.47-19.848-44.471-44.47-44.471z"/>
      <path fill="#fff" d="M62.296 40.76l-16.15 9.32v18.64l16.15 9.32 16.15-9.32V50.08z"/>
    </svg>
  ),
  opencv: (
    <svg viewBox="0 0 128 128" width="36" height="36">
      <circle cx="64" cy="64" r="56" fill="#5C3EE8"/>
      <circle cx="64" cy="64" r="30" fill="none" stroke="#fff" strokeWidth="10"/>
      <circle cx="64" cy="64" r="8" fill="#fff"/>
    </svg>
  ),
  react: (
    <svg viewBox="0 0 128 128" width="36" height="36">
      <g fill="#61DAFB">
        <circle cx="64" cy="64" r="11.4"/>
        <path d="M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13-1.2-22.3-9.6-27.2-3-.5-6.3-.8-9.8-.8-7.7 0-16.9 2.3-26.5 7.4-9.5-5.1-18.8-7.4-26.5-7.4-3.5 0-6.7.3-9.8.8-8.3 4.9-11.7 14.2-9.6 27.2.4 2.3.9 4.7 1.5 7.1-2.4.7-4.7 1.4-6.9 2.3C5.6 49.8 1 58.4 1 67.7c0 9.2 4.6 17.8 13.4 22.5 2.2.8 4.5 1.6 6.9 2.3-.6 2.4-1.1 4.8-1.5 7.1-2.1 13 1.2 22.3 9.6 27.2 3 .5 6.3.8 9.8.8 7.7 0 16.9-2.3 26.5-7.4 9.5 5.1 18.8 7.4 26.5 7.4 3.5 0 6.7-.3 9.8-.8 8.4-4.9 11.7-14.2 9.6-27.2-.4-2.3-.9-4.7-1.5-7.1 2.4-.7 4.7-1.4 6.9-2.3 8.8-4.7 13.4-13.3 13.4-22.5 0-9.3-4.6-17.9-13.4-22.5zM99.9 87.6c-1.8.7-3.8 1.3-5.9 2-1-3.2-2.3-6.6-3.9-10.2 1.6-3.6 2.9-7.1 3.9-10.3 2.1.6 4.1 1.3 5.9 2 7.8 3.4 12.3 8.9 12.3 14.2s-4.5 10.9-12.3 14.3zM89.3 56.3c1.6 3.6 2.9 7.1 3.9 10.3-2.1.6-4.1 1.3-5.9 2-7.8 3.4-12.3 8.9-12.3 14.2s4.5 10.9 12.3 14.3c1.8.7 3.8 1.3 5.9 2-1 3.2-2.3 6.6-3.9 10.2-1.3 3-2.8 5.8-4.3 8.3-7.2 1.5-15.7 1.6-24.3 0-2.5-4.5-5-9.8-7.4-16.1 2.4-6.3 4.9-11.6 7.4-16.1 7.2 1.5 15.7 1.6 24.3 0 2.5-4.5 5-9.8 7.4-16.1h-.1z"/>
      </g>
    </svg>
  ),
  javascript: (
    <svg viewBox="0 0 128 128" width="36" height="36">
      <path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z"/>
      <path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z"/>
    </svg>
  ),
  html: (
    <svg viewBox="0 0 128 128" width="36" height="36">
      <path fill="#E44D26" d="M19.037 113.876L9.032 1.661h109.936l-10.016 112.198-45.019 12.48z"/>
      <path fill="#F16529" d="M64 116.8l36.378-10.086 8.559-95.878H64z"/>
      <path fill="#EBEBEB" d="M64 52.455H45.788L44.53 38.361H64V24.599H29.489l.33 3.692 3.382 37.927H64zm0 35.743l-.061.017-15.327-4.14-.979-10.976H33.816l1.928 21.609 28.193 7.826.063-.017z"/>
      <path fill="#fff" d="M63.952 52.455v13.763h16.947l-1.597 17.849-15.35 4.143v14.319l28.215-7.82.207-2.325 3.234-36.233.335-3.696h-3.708zm0-27.856v13.762h33.244l.276-3.092.628-6.978.329-3.692z"/>
    </svg>
  ),
  mysql: (
    <svg viewBox="0 0 128 128" width="36" height="36">
      <path fill="#00758F" d="M2 109.2v9.4h3.8v-3.7h3.4v3.7h3.8v-9.4h-3.8v3.8H5.8v-3.8zm31.1 0l-2.8 5.5-2.8-5.5h-3.4v9.4h3.5v-5.2l2.3 4.4h.8l2.3-4.4v5.2h3.5v-9.4zm5.5 0v9.4h7.7v-2.9h-3.9v-6.5zm17.2 0l-4 9.4h3.8l.6-1.6h4.1l.6 1.6h3.9l-4-9.4zm-.1 5.7l1.2-3.1 1.2 3.1zm22 3.7v-9.4h-3.8v9.4zm9.3-3.4l-4.6-6h-3.4v9.4h3.6v-5.8l4.5 5.8h3.5v-9.4h-3.6zm5.8-6v9.4h8.1v-2.8h-4.3v-1.1h4.3v-2.7h-4.3v-1h4.3v-2.8z"/>
      <path fill="#F29111" d="M111.8 94.4c-5.9-.1-10.4 1.2-10.4 1.2v.6c.7.6 1.9 1.7 2.3 2.7 1 2.8-3.2 4-4 4.1-2.7.3-5.3-.4-7.5-1.9l-.5.3 1.1 8c.5.4 4.5 3.8 12.1 3.7 8.2-.1 13.4-4.5 13.9-10.1.3-3.7-1.8-6.4-7-8.6z"/>
      <path fill="#00758F" d="M48.5 8.9c-2.4 2.5-5.3 5.3-5.3 9.5 0 7.1 5.9 10.7 11.6 14.1 4.6 2.7 8.9 5.2 8.9 9.9 0 2.8-1.3 5.2-3.2 7.2 5.6-2.5 8.9-6.9 8.9-12 0-6.9-5.3-10.7-10.4-14.3-4.6-3.2-8.9-6.2-8.9-11.2.1-1.1.1-2.3.4-3.2zm3.2-8.9c-1.1 3.4-4.5 5.9-7.2 8.9-3.6 4-5.5 9.3-2.7 14.4 2.2 4.1 6.5 6.2 9.7 9.4 3.5 3.4 5.7 9.3 3.4 14.3 4.7-4 6.3-10.5 3.4-15.6-2.7-4.7-7.1-6.5-10.3-10.1-3-3.3-3.2-8.3-.5-11.9C50.9 6.4 52.5 3.7 51.7 0zm35 2.8c-1 2.5-2.9 4.5-4.9 6.5-3.4 3.5-7.2 7.5-7.2 13.6 0 7.4 5.7 11.2 11.2 14.8 4.5 3 9.1 6 9.1 11.1 0 3.6-1.8 6.7-4.7 9.1 5.5-2.5 9.3-7.6 9.3-13.3 0-6.9-5.2-10.4-10.2-13.7-4.8-3.2-9.4-6.3-9.4-11.5 0-4.4 2.1-7.3 4.8-10.3 2.4-2.7 3.5-4.3 2-6.3z"/>
    </svg>
  ),
};

function SkillIcon({ icon }) {
  if (SKILL_ICONS[icon]) {
    return <div className="skill-card-icon">{SKILL_ICONS[icon]}</div>;
  }
  // fallback
  return <div className="skill-card-icon" style={{ fontSize: '32px' }}>💻</div>;
}

function Skills({ skillList, color }) {
  const defaultSkills = [
    { name: 'Python', category: 'AI & Machine Learning', level: 'Expert', percentage: 92, icon: 'python' },
    { name: 'Machine Learning', category: 'AI & Machine Learning', level: 'Expert', percentage: 88, icon: 'sklearn' },
    { name: 'Deep Learning', category: 'AI & Machine Learning', level: 'Advanced', percentage: 78, icon: 'tensorflow' },
    { name: 'OpenCV', category: 'AI & Machine Learning', level: 'Advanced', percentage: 82, icon: 'opencv' },
    { name: 'React JS', category: 'Web & Databases', level: 'Advanced', percentage: 85, icon: 'react' },
    { name: 'JavaScript', category: 'Web & Databases', level: 'Expert', percentage: 88, icon: 'javascript' },
    { name: 'HTML & CSS', category: 'Web & Databases', level: 'Expert', percentage: 90, icon: 'html' },
    { name: 'SQL / MySQL', category: 'Web & Databases', level: 'Advanced', percentage: 80, icon: 'mysql' }
  ];

  let skillsToRender = defaultSkills;
  if (Array.isArray(skillList) && skillList.length > 0 && typeof skillList[0] === 'object') {
    skillsToRender = skillList;
  } else if (typeof skillList === 'string' && skillList.trim() !== '') {
    skillsToRender = skillList.split(',').map((skill, idx) => ({
      name: skill.trim(),
      category: idx % 2 === 0 ? 'AI & Machine Learning' : 'Web & Databases',
      level: 'Expert',
      percentage: 85 - (idx * 2),
      icon: 'python'
    }));
  }

  const categories = skillsToRender.reduce((acc, skill) => {
    const cat = skill.category || 'Core Technologies';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="page-view">
      <section className="section-card">
        <div className="section-tag" style={{ color: color }}>What I Know</div>
        <h2 className="section-title">My Skills & Expertise</h2>
        <p className="section-subtitle">
          From training ML models and building intelligent pipelines to deploying APIs and
          crafting full-stack web apps — here's my full toolkit.
        </p>

        {Object.entries(categories).map(([categoryName, items]) => (
          <div key={categoryName} className="skills-group">
            <div className="skills-group-title">{categoryName}</div>
            <div className="skills-grid-photo">
              {items.map((skill, index) => (
                <div key={index} className="skill-card-photo">
                  <SkillIcon icon={skill.icon} />
                  <span className="skill-card-name">{skill.name}</span>
                  
                  <div className="skill-progress-bar">
                    <div
                      className="skill-progress-fill"
                      style={{
                        width: `${skill.percentage}%`,
                        backgroundColor: color
                      }}
                    ></div>
                  </div>
                  <div className="skill-card-metric">
                    {skill.level} &bull; {skill.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Skills;