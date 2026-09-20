import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import styles from './ThemeToggle.module.css'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-pressed={isDark}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      <span className={styles.srOnly}>
        {isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      </span>
    </button>
  )
}

export default ThemeToggle
