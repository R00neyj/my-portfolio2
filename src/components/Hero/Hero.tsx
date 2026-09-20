import { ExternalLink } from 'lucide-react'
import styles from './Hero.module.css'

function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.name}>당신의 이름</h1>
        <p className={styles.role}>Frontend Engineer · 신입 지원</p>
        <p className={styles.tagline}>
          만든 것으로 이야기하는 프론트엔드 개발자입니다.
        </p>
        <div className={styles.ctaGroup}>
          <a href="#projects" className={`${styles.button} ${styles.buttonPrimary}`}>
            프로젝트 보기
          </a>
          <a
            href="https://github.com/R00neyj"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            <ExternalLink size={16} aria-hidden="true" />
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
