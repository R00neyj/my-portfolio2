import { useEffect, useState } from 'react'
import { useActiveSection } from '../../hooks/useActiveSection'
import { education } from '../../data/education'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  // FR-E3: Education 섹션이 렌더되지 않으면(항목 2건 미만) 내비게이션에도 노출하지 않는다.
  ...(education.length >= 2 ? [{ id: 'education', label: 'Education' }] : []),
  { id: 'contact', label: 'Contact' },
].map((item, index) => ({
  ...item,
  no: String(index + 1).padStart(2, '0'),
}))

// 맨 위(Hero)에서도 현재 섹션이 비지 않도록 hero도 감시한다.
const SECTION_IDS = ['hero', ...NAV_ITEMS.map((item) => item.id)]

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const activeId = useActiveSection(SECTION_IDS)

  const current = NAV_ITEMS.find((item) => item.id === activeId)
  const nowLabel = current ? `(${current.no}) ${current.label}` : 'Hero'

  useEffect(() => {
    if (!isMenuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <header className={styles.header}>
      <a href="#hero" className={`${styles.cell} ${styles.logo}`}>
        <span className={styles.logoMark} aria-hidden="true">
          P
        </span>
        Portfolio
      </a>

      <nav className={styles.nav} aria-label="주요 섹션 이동">
        <ul className={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={styles.navLink}
                aria-current={activeId === item.id ? 'true' : undefined}
              >
                <span className={styles.navNo}>{item.no}</span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <span className={`${styles.cell} ${styles.now}`} aria-hidden="true">
        {nowLabel}
      </span>

      <div className={`${styles.cell} ${styles.toggleCell}`}>
        <ThemeToggle />
      </div>

      <button
        type="button"
        className={`${styles.cell} ${styles.menuBtn}`}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-nav"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? 'Close' : 'Menu'}
      </button>

      <nav
        id="mobile-nav"
        className={`${styles.panel} ${isMenuOpen ? styles.panelOpen : ''}`}
        aria-label="주요 섹션 이동 (모바일)"
      >
        <ul className={styles.panelList}>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={styles.panelLink}
                aria-current={activeId === item.id ? 'true' : undefined}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={styles.panelNo}>{item.no}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header
