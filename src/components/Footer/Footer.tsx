import type { MouseEvent } from 'react'
import { useRef } from 'react'
import { getLenis } from '../../motion/smoothScroll'
import { gsap, SplitText, useGSAP } from '../../motion/gsap'
import { EASE, MEDIA, SCRUB } from '../../motion/tokens'
import shared from '../../styles/shared.module.css'
import styles from './Footer.module.css'

function Footer() {
  const year = new Date().getFullYear()
  const footerRef = useRef<HTMLElement>(null)
  const bigRef = useRef<HTMLParagraphElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // MOTION.md §9 — 큰 PORTFOLIO는 스크롤에 붙고(scrub), 하단 바는 한 번 재생된다
  useGSAP(
    () => {
      const footer = footerRef.current
      const big = bigRef.current
      const bar = barRef.current
      if (!footer || !big || !bar) return

      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        // 라틴 글자뿐이라 글자(chars) 단위로 쪼갠다. aria-hidden이라 접근성 영향은 없다
        SplitText.create(big, {
          type: 'chars',
          mask: 'chars',
          aria: 'none',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.chars, {
              yPercent: 100,
              ease: EASE.none,
              stagger: { each: 0.05, from: 'center' },
              scrollTrigger: {
                trigger: footer,
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: SCRUB,
              },
            }),
        })

        const rule = bar.querySelector(`.${styles.rule}`)
        const items = Array.from(bar.children).filter((el) => el !== rule)
        const tl = gsap.timeline({
          scrollTrigger: { trigger: bar, start: 'top 95%', once: true },
        })
        tl.from(
          rule,
          { scaleX: 0, transformOrigin: '0 50%', duration: 0.8, ease: EASE.expo },
          0,
        )
        // 항목에는 CSS opacity(0.7)가 있으므로 끝나면 인라인 값을 지워 CSS로 돌려준다
        tl.from(
          items,
          {
            autoAlpha: 0,
            duration: 0.4,
            ease: EASE.fade,
            stagger: 0.06,
            clearProps: 'opacity,visibility',
          },
          0.2,
        )
      })
    },
    { scope: footerRef },
  )

  // 맨 위로: 전역 앵커 처리 대신 더 느리고 큰 곡선으로 올라간다. Lenis가 없으면(모션 줄이기) 기본 동작
  const handleTop = (event: MouseEvent<HTMLAnchorElement>) => {
    const lenis = getLenis()
    if (!lenis || !document.querySelector('#hero')) return
    event.preventDefault()
    lenis.scrollTo(0, { duration: 1.4, easing: gsap.parseEase(EASE.inOut) })
    history.pushState(null, '', '#hero')
  }

  return (
    <footer ref={footerRef} className={styles.footer}>
      <p ref={bigRef} className={styles.big} aria-hidden="true">
        PORTFOLIO
      </p>
      <div ref={barRef} className={`${shared.label} ${styles.bar}`}>
        <span className={styles.rule} aria-hidden="true" />
        <span className={styles.dim}>© {year} Portfolio</span>
        {/* §3.3: 저장소가 어차피 공개되므로(NFR-D3) 약점이 아니라 신호로 노출한다.
            TODO: GitHub에서 my-portfolio2 → R00neyj.github.io로 이름 변경 완료 후 이 링크가 유효해진다. */}
        <a
          href="https://github.com/R00neyj/R00neyj.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className={`${shared.underline} ${styles.link}`}
        >
          이 사이트의 소스 코드 <span aria-hidden="true">↗</span>
        </a>
        <a
          href="#hero"
          onClick={handleTop}
          className={`${shared.underline} ${styles.link}`}
        >
          맨 위로 <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  )
}

export default Footer
