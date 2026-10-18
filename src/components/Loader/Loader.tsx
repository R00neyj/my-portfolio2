import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
// 숫자 카운터 전용 픽셀 폰트 — 라틴 700 한 벌만 받는다 (NFR-PF5)
import '@fontsource/silkscreen/latin-700.css'
import styles from './Loader.module.css'

// Claw'd 픽셀 지도 (X = 몸, . = 빈칸) — docs/wireframe/loading.html 시안 D
const CLAWD = [
  '..XXXXXXXX..',
  '..X.XXXX.X..',
  '..X.XXXX.X..',
  'XXXXXXXXXXXX',
  'XXXXXXXXXXXX',
  '..XXXXXXXX..',
  '..X.X..X.X..',
  '..X.X..X.X..',
]
const CELLS = CLAWD.join('').split('')
const COLUMN_COUNT = 6
// 너무 빨리 끝나 깜빡이듯 지나가지 않게 최소한 보여 주는 시간
const MIN_SHOW_MS = 1200
// 이미지가 오래 걸려도 이 시간이 지나면 사이트를 연다
const MAX_WAIT_MS = 5000

/** 페이지(이미지 포함)와 폰트가 다 받아질 때까지 기다린다 */
function waitForPage(): Promise<void> {
  const loaded =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) =>
          window.addEventListener('load', () => resolve(), { once: true }),
        )
  const fonts = document.fonts.ready.then(() => undefined)
  const minTime = new Promise<void>((resolve) => window.setTimeout(resolve, MIN_SHOW_MS))
  const maxTime = new Promise<void>((resolve) => window.setTimeout(resolve, MAX_WAIT_MS))
  return Promise.race([Promise.all([loaded, fonts, minTime]).then(() => undefined), maxTime])
}

/** Hero 등장 모션 일시정지와 스크롤 잠금을 푼다 (index.html이 붙인 data-loading 제거) */
function finishLoading() {
  delete document.documentElement.dataset.loading
}

const pad3 = (value: number) => String(Math.round(value)).padStart(3, '0')
const random = (min: number, max: number) => () => gsap.utils.random(min, max)

/**
 * 로딩 화면 — 픽셀이 모여 Claw'd가 되는 동안 숫자가 000→100까지 오르고,
 * 다 차면 Claw'd가 흩어지며 세로 기둥이 올라가 Hero를 드러낸다.
 * 모션 줄이기 환경에서는 index.html이 data-loading을 붙이지 않으므로 아예 그려지지 않는다.
 */
function Loader() {
  const [active, setActive] = useState(() =>
    document.documentElement.hasAttribute('data-loading'),
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const colsRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const clawdRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const cols = colsRef.current
    const meta = metaRef.current
    const clawd = clawdRef.current
    const count = countRef.current
    const bar = barRef.current
    if (!active || !root || !cols || !meta || !clawd || !count || !bar) return

    let cancelled = false
    const pixels = clawd.querySelectorAll(`.${styles.px}`)
    const progress = { value: 0 }
    const render = () => {
      count.textContent = pad3(progress.value)
      gsap.set(bar, { scaleX: progress.value / 100 })
    }

    const ctx = gsap.context(() => {
      gsap.from(count, { yPercent: 100, duration: 0.6, ease: 'power3.out' })
      gsap.from(pixels, {
        x: random(-320, 320),
        y: random(-240, 240),
        rotation: random(-180, 180),
        scale: 0,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'back.out(1.6)',
        stagger: { each: 0.025, from: 'random' },
        delay: 0.1,
      })
      // 로딩이 끝날 때까지 90%까지만 천천히 오른다
      gsap.to(progress, { value: 90, duration: 2, ease: 'power1.out', onUpdate: render })
    }, root)

    waitForPage().then(() => {
      if (cancelled) return
      ctx.add(() => {
        gsap.killTweensOf(progress)
        gsap
          .timeline({
            onComplete: () => {
              finishLoading()
              setActive(false)
            },
          })
          .to(progress, { value: 100, duration: 0.4, ease: 'power2.out', onUpdate: render })
          // 100% — Claw'd가 두 번 뛰고
          .to(clawd, { y: -22, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 3 })
          // 픽셀이 흩어지면서 숫자는 위로 빠진다
          .to(
            pixels,
            {
              x: random(-400, 400),
              y: random(-300, 300),
              rotation: random(-180, 180),
              scale: 0,
              duration: 0.6,
              ease: 'power3.in',
              stagger: { each: 0.008, from: 'random' },
            },
            '+=0.05',
          )
          .to(count, { yPercent: -105, duration: 0.5, ease: 'power3.in' }, '<0.1')
          .to([meta, bar], { autoAlpha: 0, duration: 0.3 }, '<')
          // 세로 기둥이 차례로 올라가며 Hero 등장
          .to(cols.children, {
            yPercent: -100,
            duration: 0.9,
            ease: 'expo.inOut',
            stagger: 0.06,
          }, '-=0.15')
          // 기둥이 다 걷히기 전에 Hero 등장 모션을 시작해 이어지게 한다
          .call(finishLoading, [], '-=0.6')
      })
    })

    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [active])

  if (!active) return null

  return (
    <div ref={rootRef} className={styles.loader} role="status">
      <span className={styles.srOnly}>페이지를 불러오는 중입니다</span>
      <div ref={colsRef} className={styles.cols} aria-hidden="true">
        {Array.from({ length: COLUMN_COUNT }, (_, index) => (
          <div key={index} className={styles.col} />
        ))}
      </div>
      <div ref={metaRef} className={styles.meta} aria-hidden="true">
        <span>Loading</span>
        <span>Portfolio</span>
      </div>
      <div className={styles.center} aria-hidden="true">
        <div ref={clawdRef} className={styles.clawd}>
          {CELLS.map((cell, index) => (
            <span key={index} className={cell === 'X' ? styles.px : undefined} />
          ))}
        </div>
        <div className={styles.countWrap}>
          <span ref={countRef} className={styles.count}>
            000
          </span>
        </div>
      </div>
      <div ref={barRef} className={styles.bar} aria-hidden="true" />
    </div>
  )
}

export default Loader
