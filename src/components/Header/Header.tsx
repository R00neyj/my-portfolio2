import { useEffect, useRef, useState } from 'react'
import { useActiveSection } from '../../hooks/useActiveSection'
import { gsap, ScrollTrigger, useGSAP } from '../../motion/gsap'
import { DUR, EASE, MEDIA } from '../../motion/tokens'
import { whenLoaderDone } from '../../motion/loading'
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

  const headerRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const nowRef = useRef<HTMLSpanElement>(null)
  // 스크롤 숨김 로직이 최신 상태를 읽도록 ref로 들고 있는다
  const menuOpenRef = useRef(false)
  const showHeaderRef = useRef<(() => void) | null>(null)
  const prevLabelRef = useRef(nowLabel)
  const prevMenuOpenRef = useRef(false)

  // 등장 + 스크롤 방향에 따른 숨김/다시 보임 (MOTION.md §3)
  useGSAP(
    () => {
      const header = headerRef.current
      if (!header) return
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        const cells = header.querySelectorAll(
          `:scope > .${styles.cell}, :scope > .${styles.nav}`,
        )
        // 칸이 올라가 있는 동안 칸 사이 선 색(헤더 배경)이 비쳐 보이지 않게 잠시 걷는다
        gsap.set(header, { backgroundColor: 'transparent', borderBottomColor: 'transparent' })
        gsap.set(cells, { yPercent: -100 })
        const cancelWait = whenLoaderDone(() => {
          gsap.to(cells, {
            yPercent: 0,
            delay: 1.2,
            duration: 0.6,
            ease: EASE.expo,
            stagger: 0.05,
            onComplete: () => {
              gsap.set(header, { clearProps: 'backgroundColor,borderBottomColor' })
              gsap.set(cells, { clearProps: 'transform' })
            },
          })
        })

        let hidden = false
        let focusInside = false
        const move = (hide: boolean) => {
          if (hidden === hide) return
          hidden = hide
          gsap.to(header, {
            yPercent: hide ? -100 : 0,
            duration: DUR.header,
            ease: EASE.expo,
            overwrite: 'auto',
          })
        }
        showHeaderRef.current = () => move(false)

        // 헤더 안에 포커스가 있으면 키보드 사용자가 볼 수 있도록 숨기지 않는다
        const onFocusIn = () => {
          focusInside = true
          move(false)
        }
        const onFocusOut = (event: FocusEvent) => {
          if (!header.contains(event.relatedTarget as Node | null)) focusInside = false
        }
        header.addEventListener('focusin', onFocusIn)
        header.addEventListener('focusout', onFocusOut)

        const trigger = ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            if (self.scroll() <= header.offsetHeight) return move(false)
            if (menuOpenRef.current || focusInside) return move(false)
            move(self.direction === 1)
          },
        })

        return () => {
          cancelWait()
          trigger.kill()
          header.removeEventListener('focusin', onFocusIn)
          header.removeEventListener('focusout', onFocusOut)
          showHeaderRef.current = null
          gsap.set(header, { clearProps: 'transform,backgroundColor,borderBottomColor' })
          gsap.set(cells, { clearProps: 'transform' })
        }
      })
    },
    { scope: headerRef },
  )

  // 현재 섹션 라벨: 새 글자가 아래에서 올라온다 (첫 렌더에는 하지 않는다)
  useGSAP(
    () => {
      if (prevLabelRef.current === nowLabel) return
      prevLabelRef.current = nowLabel
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        gsap.from(nowRef.current, {
          yPercent: 100,
          duration: DUR.slow,
          ease: EASE.soft,
        })
      })
    },
    { dependencies: [nowLabel], scope: headerRef, revertOnUpdate: true },
  )

  // 모바일 패널: 열 때 위에서 펼치고 링크가 올라온다, 닫을 땐 짧게 접는다
  useGSAP(
    () => {
      const panel = panelRef.current
      const wasOpen = prevMenuOpenRef.current
      prevMenuOpenRef.current = isMenuOpen
      if (!panel || isMenuOpen === wasOpen) return
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        if (isMenuOpen) {
          const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
          tl.fromTo(
            panel,
            { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 0% 0)', duration: 0.5, ease: EASE.inOut, clearProps: 'clipPath' },
          )
          tl.from(
            panel.querySelectorAll('a'),
            { y: 24, autoAlpha: 0, duration: DUR.fade, ease: EASE.soft, stagger: 0.05 },
            '-=0.1',
          )
        } else {
          // 클래스가 빠져 이미 visibility:hidden이므로, 접는 동안만 인라인으로 보이게 둔다
          gsap.fromTo(
            panel,
            { visibility: 'visible', clipPath: 'inset(0 0 0% 0)' },
            {
              clipPath: 'inset(0 0 100% 0)',
              duration: DUR.fade,
              ease: EASE.inOut,
              clearProps: 'visibility,clipPath',
            },
          )
        }
      })
    },
    { dependencies: [isMenuOpen], scope: headerRef, revertOnUpdate: true },
  )

  useEffect(() => {
    menuOpenRef.current = isMenuOpen
    if (isMenuOpen) showHeaderRef.current?.()
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <header className={styles.header} ref={headerRef}>
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
        <span className={styles.nowClip}>
          <span ref={nowRef} className={styles.nowText}>
            {nowLabel}
          </span>
        </span>
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
        ref={panelRef}
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
