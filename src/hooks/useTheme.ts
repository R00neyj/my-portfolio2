import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function readSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * FR-X2: 기본값은 시스템 설정을 따르고, 수동 토글 시 localStorage에 기억한다.
 * index.html의 인라인 스크립트가 최초 렌더 전에 data-theme을 이미 적용해 두므로,
 * 여기서는 그 값을 읽어 React 상태와 동기화한 뒤 토글만 담당한다.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => readStoredTheme() ?? readSystemTheme(),
  )

  useEffect(() => {
    const stored = readStoredTheme()
    if (stored) {
      document.documentElement.dataset.theme = stored
    } else {
      delete document.documentElement.dataset.theme
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* localStorage 접근 불가 — 현재 세션 내 토글만 반영 */
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
