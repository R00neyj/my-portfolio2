import { useEffect, useRef, useState } from 'react'
import { EMAIL_DOMAIN, EMAIL_USER, links } from '../../data/links'
import { useReveal } from '../../hooks/useReveal'
import shared from '../../styles/shared.module.css'
import styles from './Contact.module.css'

const EMAIL = `${EMAIL_USER}@${EMAIL_DOMAIN}`

type CopyState = 'idle' | 'done' | 'fail'

const COPY_MESSAGE: Record<CopyState, string> = {
  idle: '주소 복사 ⧉',
  done: '복사했습니다 ✓',
  fail: '복사 실패 — 주소를 직접 선택하세요',
}

function Contact() {
  const statementRef = useReveal<HTMLHeadingElement>()
  const [copy, setCopy] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)

  // 언마운트 시 대기 중인 타이머를 정리한다
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handleCopy = async () => {
    let next: CopyState = 'done'
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      next = 'fail'
    }
    setCopy(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopy('idle'), 1600)
  }

  return (
    <section id="contact" className={shared.section}>
      <p className={shared.label}>(05) Contact</p>
      {/* 큰 문장이 섹션의 h2 역할을 한다 */}
      <h2
        ref={statementRef}
        data-reveal=""
        className={styles.statement}
      >
        좋은 제품을 <span className={styles.dim}>함께</span> 만들 팀을 찾고
        있습니다.
      </h2>
      <a href={`mailto:${EMAIL}`} className={styles.mail}>
        {EMAIL}
        <span className={styles.arrow} aria-hidden="true">
          {' '}
          ↗
        </span>
      </a>
      <div className={styles.sub}>
        {links.map((link) => (
          <span key={link.label} className={styles.item}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${shared.label} ${shared.underline} ${styles.action}`}
            >
              {link.label} <span aria-hidden="true">↗</span>
            </a>
            {link.description && (
              <span className={styles.muted}> — {link.description}</span>
            )}
          </span>
        ))}
        <button
          type="button"
          onClick={handleCopy}
          className={`${shared.label} ${shared.underline} ${styles.action} ${styles.copy}`}
        >
          {COPY_MESSAGE[copy]}
        </button>
        <span className={styles.srOnly} role="status" aria-live="polite">
          {copy === 'idle' ? '' : COPY_MESSAGE[copy]}
        </span>
      </div>
    </section>
  )
}

export default Contact
