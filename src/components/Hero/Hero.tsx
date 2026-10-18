import { Fragment, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { profile } from '../../data/profile'
import styles from './Hero.module.css'

// three.js는 별도 청크로 나눠 초기 JS 예산(NFR-PF3)에서 뺀다
const ClawdScene = lazy(() => import('../ClawdScene/ClawdScene'))

function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const [showScene, setShowScene] = useState(false)

  // 첫 화면 텍스트(LCP)가 먼저 그려지도록, 브라우저가 한가해진 뒤에 3D를 불러온다 (FR-H4)
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setShowScene(true), { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(() => setShowScene(true), 300)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <section ref={heroRef} id="hero" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.background} aria-hidden="true">
        {showScene && (
          <Suspense fallback={null}>
            <ClawdScene containerRef={heroRef} />
          </Suspense>
        )}
      </div>

      <div className={styles.inner}>
        <p className={styles.label}>
          {profile.name} · {profile.role}
        </p>
        <h1 id="hero-title" className={styles.title}>
          <span>{profile.year}</span> <span>PORTFOLIO</span>
        </h1>
        <p className={styles.tagline}>
          {profile.tagline.map((phrase, index) => (
            <Fragment key={phrase}>
              {index > 0 && ' '}
              <span>{phrase}</span>
            </Fragment>
          ))}
        </p>
      </div>

      <div className={styles.scrollArea}>
        <a href="#about" className={styles.scrollCue}>
          Scroll
          <ArrowDown size={20} aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}

export default Hero
