import { useEffect, useRef, useState } from 'react'
import { EMAIL_DOMAIN, EMAIL_USER, links } from '../../data/links'
import { gsap, SplitText, useGSAP } from '../../motion/gsap'
import { DUR, EASE, MEDIA } from '../../motion/tokens'
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
  const sectionRef = useRef<HTMLElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const statementRef = useRef<HTMLHeadingElement>(null)
  const magnetRef = useRef<HTMLDivElement>(null)
  const [copy, setCopy] = useState<CopyState>('idle')
  // 위로 빠지는 중인 이전 문구 (모션이 있을 때만 잠깐 그린다)
  const [leaving, setLeaving] = useState<CopyState | null>(null)
  const copyRef = useRef<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)

  // 언마운트 시 대기 중인 타이머를 정리한다
  useEffect(() => () => window.clearTimeout(timer.current), [])

  // MOTION.md §8.1 등장 + §8.2 메일 링크 자석 효과
  useGSAP(
    () => {
      const section = sectionRef.current
      const label = labelRef.current
      const statement = statementRef.current
      const magnet = magnetRef.current
      if (!section || !label || !statement || !magnet) return

      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        const trigger = { trigger: section, start: 'top 70%', once: true }
        const dim = statement.querySelector(`.${styles.dim}`)
        const mailText = magnet.querySelector(`.${styles.mailText}`)
        const rule = magnet.querySelector(`.${styles.rule}`)
        const arrow = magnet.querySelector(`.${styles.arrow}`)
        const rows = gsap.utils.toArray<HTMLElement>(
          `.${styles.sub} > :not(.${styles.srOnly})`,
          section,
        )

        const tl = gsap.timeline({ scrollTrigger: trigger })
        tl.from(
          label,
          { clipPath: 'inset(0 100% 0 0)', duration: DUR.label, ease: EASE.soft },
          0,
        )
        if (dim) {
          // 색 전환은 클래스 토글(CSS transition), 튕김은 scale
          tl.call(() => dim.classList.add(styles.dimOn), [], 0.7)
          tl.to(dim, { scale: 1.06, duration: 0.25, ease: EASE.fade }, 0.7)
          tl.to(dim, { scale: 1, duration: 0.25, ease: EASE.bounce }, 0.95)
        }
        if (mailText) {
          tl.from(mailText, { y: 24, autoAlpha: 0, duration: 0.7, ease: EASE.expo }, 0.8)
        }
        if (rule) {
          tl.from(
            rule,
            { scaleX: 0, transformOrigin: '0 50%', duration: 0.7, ease: EASE.expo },
            0.8,
          )
        }
        if (arrow) {
          tl.from(
            arrow,
            { x: -8, y: 8, autoAlpha: 0, duration: 0.4, ease: EASE.bounce },
            0.95,
          )
        }
        tl.from(
          rows,
          { y: 12, autoAlpha: 0, duration: 0.5, ease: EASE.soft, stagger: 0.06 },
          1.05,
        )

        // 한글이라 글자가 아닌 단어 단위로만 쪼갠다
        SplitText.create(statement, {
          type: 'words',
          mask: 'words',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 110,
              duration: 0.9,
              ease: EASE.expo,
              stagger: 0.07,
              delay: 0.1,
              scrollTrigger: trigger,
            }),
        })

        return () => {
          dim?.classList.remove(styles.dimOn)
        }
      })

      // 자석 효과는 마우스 기기에서만. 등장 transform은 안쪽 요소가, 자석은 바깥 래퍼가 맡는다
      mm.add(MEDIA.hover, () => {
        const RANGE = 120
        const MAX = 10
        const clamp = gsap.utils.clamp(-MAX, MAX)
        let pulling = false
        let xTo: ((value: number) => unknown) | null = null
        let yTo: ((value: number) => unknown) | null = null

        const release = () => {
          if (!pulling) return
          pulling = false
          gsap.to(magnet, {
            x: 0,
            y: 0,
            duration: 1,
            ease: 'elastic.out(1, 0.4)',
            overwrite: true,
          })
        }

        const handleMove = (event: PointerEvent) => {
          const rect = magnet.getBoundingClientRect()
          // 이미 끌려간 만큼은 빼고 제자리 기준으로 잰다
          const left = rect.left - Number(gsap.getProperty(magnet, 'x'))
          const top = rect.top - Number(gsap.getProperty(magnet, 'y'))
          const dx = Math.max(left - event.clientX, 0, event.clientX - (left + rect.width))
          const dy = Math.max(top - event.clientY, 0, event.clientY - (top + rect.height))
          if (Math.hypot(dx, dy) > RANGE) {
            release()
            return
          }
          if (!pulling) {
            pulling = true
            xTo = gsap.quickTo(magnet, 'x', { duration: 0.4, ease: EASE.soft })
            yTo = gsap.quickTo(magnet, 'y', { duration: 0.4, ease: EASE.soft })
          }
          xTo?.(clamp((event.clientX - (left + rect.width / 2)) * 0.03))
          yTo?.(clamp((event.clientY - (top + rect.height / 2)) * 0.1))
        }

        section.addEventListener('pointermove', handleMove)
        section.addEventListener('pointerleave', release)
        return () => {
          section.removeEventListener('pointermove', handleMove)
          section.removeEventListener('pointerleave', release)
          gsap.set(magnet, { clearProps: 'x,y' })
        }
      })
    },
    { scope: sectionRef },
  )

  // 복사 버튼 글자 교체: 옛 글자는 위로 빠지고 새 글자는 아래에서 올라온다
  useGSAP(
    () => {
      const swap = sectionRef.current?.querySelector(`.${styles.swap}`)
      const incoming = swap?.querySelector('[data-face="in"]')
      const outgoing = swap?.querySelector('[data-face="out"]')
      if (!incoming || !outgoing) return
      gsap.to(outgoing, {
        yPercent: -100,
        duration: 0.35,
        ease: EASE.soft,
        onComplete: () => setLeaving(null),
      })
      gsap.from(incoming, { yPercent: 100, duration: 0.35, ease: EASE.soft })
    },
    { scope: sectionRef, dependencies: [leaving, copy] },
  )

  const changeCopy = (next: CopyState) => {
    const prev = copyRef.current
    if (prev === next) return
    if (window.matchMedia(MEDIA.motion).matches) setLeaving(prev)
    copyRef.current = next
    setCopy(next)
  }

  const handleCopy = async () => {
    let next: CopyState = 'done'
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      next = 'fail'
    }
    changeCopy(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => changeCopy('idle'), 1600)
  }

  return (
    <section ref={sectionRef} id="contact" className={shared.section}>
      <p ref={labelRef} className={shared.label}>
        (05) Contact
      </p>
      {/* 큰 문장이 섹션의 h2 역할을 한다 */}
      <h2 ref={statementRef} className={styles.statement}>
        좋은 제품을 <span className={styles.dim}>함께</span> 만들 팀을 찾고
        있습니다.
      </h2>
      {/* 바깥 래퍼는 자석 효과, 안쪽 링크·글자·밑줄은 등장 모션이 맡는다 */}
      <div ref={magnetRef} className={styles.magnet}>
        <a href={`mailto:${EMAIL}`} className={styles.mail}>
          <span className={styles.mailText}>
            {EMAIL}{' '}
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
          </span>
          <span className={styles.rule} aria-hidden="true" />
        </a>
      </div>
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
          <span className={styles.swap}>
            <span key={copy} className={styles.face} data-face="in">
              {COPY_MESSAGE[copy]}
            </span>
            {leaving && (
              <span
                key={`out-${leaving}`}
                className={styles.face}
                data-face="out"
                aria-hidden="true"
              >
                {COPY_MESSAGE[leaving]}
              </span>
            )}
          </span>
        </button>
        <span className={styles.srOnly} role="status" aria-live="polite">
          {copy === 'idle' ? '' : COPY_MESSAGE[copy]}
        </span>
      </div>
    </section>
  )
}

export default Contact
