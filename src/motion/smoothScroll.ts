import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { MEDIA } from './tokens'
import { whenLoaderDone } from './loading'

let lenis: Lenis | null = null

/** 지금 쓰는 Lenis (모션 줄이기 환경이면 null) */
export function getLenis() {
  return lenis
}

const headerHeight = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0

/**
 * 같은 페이지 안 앵커(#about 등)로 이동한다. Lenis가 있으면 부드럽게, 없으면 브라우저 기본 이동.
 * Hero 고정 구간처럼 ScrollTrigger가 만든 여백도 Lenis가 실제 위치를 재서 이동하므로 그대로 건너뛴다.
 */
export function scrollToHash(hash: string) {
  const target = hash === '#' ? null : document.querySelector<HTMLElement>(hash)
  if (!target) return
  if (lenis) {
    lenis.scrollTo(target, { offset: -headerHeight(), duration: 1.2 })
  } else {
    target.scrollIntoView()
  }
}

/**
 * DESIGN.md §8.2 스크롤 스무더 — Lenis를 GSAP 박자에 묶는다.
 * 모션 줄이기 환경에서는 켜지 않는다. 돌려준 함수로 정리한다.
 */
export function setupSmoothScroll(): () => void {
  if (!window.matchMedia(MEDIA.motion).matches) return () => {}

  const instance = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false })
  lenis = instance
  instance.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  // 로딩 화면이 떠 있는 동안은 멈춰 두고, 걷히면 풀면서 고정 구간 위치를 다시 잰다
  instance.stop()
  const cancelWait = whenLoaderDone(() => {
    instance.start()
    ScrollTrigger.refresh()
  })

  // 페이지 안 앵커 클릭을 Lenis 이동으로 바꾼다.
  // 건너뛰기 링크는 포커스 이동이 중요하므로 브라우저 기본 동작에 맡긴다 (FR-X4)
  const handleClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
    if (!link || link.classList.contains('skip-link')) return
    const hash = link.getAttribute('href') ?? ''
    if (!document.querySelector(hash)) return
    event.preventDefault()
    scrollToHash(hash)
    history.pushState(null, '', hash)
  }
  document.addEventListener('click', handleClick)

  return () => {
    cancelWait()
    document.removeEventListener('click', handleClick)
    gsap.ticker.remove(tick)
    instance.destroy()
    lenis = null
  }
}
