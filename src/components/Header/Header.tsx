import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useActiveSection } from '../../hooks/useActiveSection'
import { education } from '../../data/education'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  // FR-E3: Education 섹션이 렌더되지 않으면(항목 2건 미만) 내비게이션에도 노출하지 않는다.
  ...(education.length >= 2
    ? [{ id: 'education', label: 'Education & Activities' }]
    : []),
  { id: 'contact', label: 'Contact' },
]

const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const activeId = useActiveSection(SECTION_IDS)

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
      <div className={styles.bar}>
        <a href="#hero" className={styles.logo}>
          <span className={styles.logoMark} aria-hidden="true">
            P
          </span>
          Portfolio
        </a>

        <div className={styles.controls}>
          <nav className={styles.nav} aria-label="주요 섹션 이동">
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`${styles.navLink} ${activeId === item.id ? styles.navLinkActive : ''}`}
                    aria-current={activeId === item.id ? 'true' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ThemeToggle />

          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-nav"
          className={styles.mobilePanel}
          aria-label="주요 섹션 이동 (모바일)"
        >
          <ul className={styles.mobileList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={styles.mobileLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

export default Header
