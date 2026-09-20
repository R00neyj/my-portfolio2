function Header() {
  return (
    <header className="site-header">
      <a href="#hero" className="site-header__logo">
        Portfolio
      </a>
      <nav className="site-header__nav" aria-label="주요 섹션 이동">
        <ul className="site-header__nav-list">
          <li>
            <a href="#about" className="site-header__nav-link">
              About
            </a>
          </li>
          <li>
            <a href="#skills" className="site-header__nav-link">
              Skills
            </a>
          </li>
          <li>
            <a href="#projects" className="site-header__nav-link">
              Projects
            </a>
          </li>
          <li>
            <a href="#education" className="site-header__nav-link">
              Education & Activities
            </a>
          </li>
          <li>
            <a href="#contact" className="site-header__nav-link">
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
