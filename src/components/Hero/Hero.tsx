import { Fragment, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { profile } from '../../data/profile'
import { EASE, DUR, MEDIA, RISE, SCRUB } from '../../motion/tokens'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '../../motion/gsap'
import { whenLoaderDone } from '../../motion/loading'
import type { Greet } from '../ClawdScene/mountClawdScene'
import styles from './Hero.module.css'

// three.js는 별도 청크로 나눠 초기 JS 예산(NFR-PF3)에서 뺀다
const ClawdScene = lazy(() => import('../ClawdScene/ClawdScene'))

function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const [showScene, setShowScene] = useState(false)
  // 스크롤 인사 값(0~1). GSAP scrub이 움직이고 3D 렌더 루프가 매 프레임 읽는다 (state로 두어 객체가 바뀌지 않는다)
  const [greet] = useState<Greet>(() => ({ turn: 0, smile: 0, raise: 0, wave: 0, hop: 0 }))

  // 첫 화면 텍스트(LCP)가 먼저 그려지도록, 브라우저가 한가해진 뒤에 3D를 불러온다 (FR-H4)
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setShowScene(true), { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(() => setShowScene(true), 300)
    return () => window.clearTimeout(id)
  }, [])

  useGSAP(
    () => {
      const hero = heroRef.current
      if (!hero) return
      const q = <T extends Element>(selector: string) => hero.querySelector<T>(selector)
      const label = q(`.${styles.label}`)
      const title = q(`.${styles.title}`)
      const tagline = q(`.${styles.tagline}`)
      const phrases = gsap.utils.toArray<HTMLElement>(`.${styles.tagline} span`, hero)
      const background = q(`.${styles.background}`)
      const scrollArea = q(`.${styles.scrollArea}`)
      const cue = q<HTMLElement>(`.${styles.scrollCue}`)
      const bubble = q(`.${styles.greeting}`)
      const lines = gsap.utils.toArray<HTMLElement>(`.${styles.greetingLine}`, hero)
      if (!label || !title || !tagline || !background || !scrollArea || !cue || !bubble) return
      if (lines.length < 2) return
      const g = greet

      const mm = gsap.matchMedia()

      // ── §2.1 heroIntro: 로딩 화면이 걷히는 순간이 0초 ──
      mm.add(MEDIA.motion, () => {
        const intro = gsap.timeline({ paused: true })
        intro
          .fromTo(
            label,
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: DUR.label + 0.1, ease: EASE.soft },
            0.05,
          )
          .from(
            phrases,
            { y: RISE, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: EASE.soft },
            0.45,
          )
          .from(background, { autoAlpha: 0, scale: 0.92, duration: 1.2, ease: EASE.soft }, 0.7)
          .from(
            cue,
            {
              y: 12,
              autoAlpha: 0,
              duration: DUR.label,
              ease: EASE.bounce,
              // 등장이 끝난 뒤부터 화살표가 반복해서 움직인다
              onComplete: () => {
                cue.dataset.cue = 'on'
              },
            },
            1.1,
          )

        // 제목 글자(라틴 글자라 chars로 쪼갠다). 폰트 로딩·리사이즈 때 알아서 다시 쪼갠다
        let titleTween: gsap.core.Tween | undefined
        const split = SplitText.create(title, {
          type: 'chars',
          mask: 'chars',
          autoSplit: true,
          onSplit: (self) => {
            titleTween = gsap.from(self.chars, {
              yPercent: 110,
              duration: 0.9,
              stagger: 0.035,
              ease: EASE.expo,
              paused: true,
            })
            return titleTween
          },
        })

        const cancelWait = whenLoaderDone(() => {
          intro.play()
          titleTween?.play()
        })

        return () => {
          cancelWait()
          intro.kill()
          split.revert()
          delete cue.dataset.cue
        }
      })

      // ── §2.2 heroGreet: Hero를 고정하고 스크롤에 맞춰 Claw'd가 인사한다 ──
      const buildGreet = (end: string) => {
        const tl = gsap.timeline({
          defaults: { ease: EASE.none },
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end,
            pin: true,
            scrub: SCRUB,
            anticipatePin: 1,
          },
        })
        const dim = [label, title, tagline]

        tl.to(scrollArea, { autoAlpha: 0, duration: 0.15 }, 0)
          .to(g, { turn: 1, duration: 0.2 }, 0)
          .to(dim, { autoAlpha: 0.25, y: -20, duration: 0.15 }, 0.1)
          .to(g, { smile: 1, duration: 0.15 }, 0.15)
          .to(g, { raise: 1, duration: 0.15 }, 0.2)
          // 흔들기 세기: 올라가고(0.30~0.40) 유지하다 내려온다(0.60~0.70). 실제 흔들림은 3D가 시간으로 만든다
          .to(g, { wave: 1, duration: 0.1 }, 0.3)
          .to(g, { wave: 0, duration: 0.1 }, 0.6)
          // 말풍선: 나타남 → 문구 교체(첫 줄은 위로 빠지고 둘째 줄이 올라옴) → 사라짐
          .fromTo(
            bubble,
            { scale: 0.6, autoAlpha: 0, transformOrigin: '100% 100%' },
            { scale: 1, autoAlpha: 1, duration: 0.13, ease: EASE.bounce },
            0.32,
          )
          .to(lines[0], { yPercent: -100, autoAlpha: 0, duration: 0.2 }, 0.4)
          .fromTo(
            lines[1],
            { yPercent: 100, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.2 },
            0.4,
          )
          .to(bubble, { scale: 0.8, autoAlpha: 0, duration: 0.15 }, 0.7)
          .to(g, { raise: 0, duration: 0.15 }, 0.7)
          // 마무리: 작게 한 번 점프하고, Claw'd는 아래로 물러나며 제목이 다시 선명해진다
          .to(g, { hop: 1, duration: 0.1 }, 0.8)
          .to(g, { hop: 0, duration: 0.1 }, 0.9)
          .to(background, { yPercent: 15, autoAlpha: 0.2, duration: 0.2 }, 0.8)
          .to(title, { autoAlpha: 1, yPercent: -30, duration: 0.2 }, 0.8)
          // 제목이 올라가며 라벨과 겹치지 않게 라벨·소개 문구는 먼저 빠진다
          .to([label, tagline], { autoAlpha: 0, duration: 0.1 }, 0.8)
          .to({}, { duration: 0.001 }, 0.999) // 총 길이를 1로 맞춘다
        return tl
      }

      // pinSpacing은 기본값(true)을 유지: #about 앵커 이동이 고정 구간을 건너뛴다
      mm.add(MEDIA.desktop, () => {
        buildGreet('+=120%')
      })
      mm.add(MEDIA.mobile, () => {
        buildGreet('+=80%')
      })

      // 모션 줄이기: 고정 없이, 웃는 얼굴로 손 하나를 든 정지 자세
      mm.add('(prefers-reduced-motion: reduce)', () => {
        Object.assign(g, { turn: 1, smile: 1, raise: 1, wave: 0, hop: 0 })
        return () => {
          Object.assign(g, { turn: 0, smile: 0, raise: 0, wave: 0, hop: 0 })
        }
      })

      return () => {
        mm.revert()
        ScrollTrigger.refresh()
      }
    },
    { scope: heroRef, dependencies: [greet] },
  )

  return (
    <section ref={heroRef} id="hero" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.background} aria-hidden="true">
        {showScene && (
          <Suspense fallback={null}>
            <ClawdScene containerRef={heroRef} greet={greet} />
          </Suspense>
        )}
      </div>

      {/* 스크롤 인사 말풍선 — 장식이라 보조기기에는 숨긴다 */}
      <div className={styles.greeting} aria-hidden="true">
        {/* 꼬리(::after)는 말풍선 밖으로 나가야 하므로, 문구 교체용 마스크는 안쪽 칸에 둔다 */}
        <span className={styles.greetingText}>
          {profile.greeting.map((text) => (
            <span key={text} className={styles.greetingLine}>
              {text}
            </span>
          ))}
        </span>
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
