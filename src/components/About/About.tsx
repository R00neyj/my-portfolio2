import { Fragment, useRef } from 'react'
import { gsap, useGSAP } from '../../motion/gsap'
import { DUR, EASE, MEDIA, RISE, STAGGER } from '../../motion/tokens'
import shared from '../../styles/shared.module.css'
import styles from './About.module.css'

// 큰 문장 — accent가 붙은 단어만 포인트 색으로 칠한다
const statement: { text: string; accent?: boolean }[] = [
  { text: '실무' },
  { text: '경력보다' },
  { text: '완성한', accent: true },
  { text: '프로젝트로', accent: true },
  { text: '말합니다.' },
  { text: '요구사항을' },
  { text: '정리하고,' },
  { text: '설계하고,' },
  { text: '성능과' },
  { text: '접근성' },
  { text: '기준까지' },
  { text: '맞춰' },
  { text: '하나를' },
  { text: '끝까지' },
  { text: '만듭니다.' },
]

const notes = [
  {
    label: '01 — Why',
    text: '이력과 프로젝트, 글을 한 곳에 모아 방문자가 목적에 따라 필요한 정보만 빠르게 꺼내갈 수 있도록 이 사이트를 직접 기획하고 만들었습니다.',
  },
  {
    label: '02 — Next',
    text: '지금은 이 사이트 자체의 코드 품질과 완성도로 말합니다. 배포는 끝이 아니라 시작이며, 새로운 프로젝트로 계속 채워 나갑니다.',
  },
]

function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const statementRef = useRef<HTMLParagraphElement>(null)
  const notesRef = useRef<HTMLDivElement>(null)

  // docs/MOTION.md §4 — 모션 줄이기 환경에서는 타임라인을 만들지 않아 처음부터 다 보인다
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        // 4.1 섹션 머리
        gsap
          .timeline({
            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
          })
          .from(labelRef.current, {
            clipPath: 'inset(0 100% 0 0)',
            duration: DUR.label,
            ease: EASE.soft,
          })
          .from(
            titleRef.current,
            {
              clipPath: 'inset(100% 0 0 0)',
              duration: DUR.reveal,
              ease: EASE.soft,
            },
            0.1,
          )

        // 4.2 문장 채색 — 단어마다 --paint를 0→1로, 스크롤 진행률과 단어 순서가 1:1
        const words = gsap.utils.toArray<HTMLElement>(`.${styles.word}`, statementRef.current)
        gsap.set(words, { '--paint': 0 })
        const paint = gsap.timeline({
          scrollTrigger: {
            trigger: statementRef.current,
            start: 'top 75%',
            end: 'bottom 45%',
            scrub: 0.4,
          },
        })
        paint.to(words, { '--paint': 1, duration: 1, ease: EASE.none, stagger: 1 }, 0)
        // 포인트 단어는 칠해지는 순간 살짝 튕긴다
        words.forEach((word, index) => {
          if (!word.classList.contains(styles.accent)) return
          paint
            .to(word, { scale: 1.04, duration: 0.15, ease: EASE.fade }, index + 0.5)
            .to(word, { scale: 1, duration: 0.3, ease: EASE.bounce }, index + 0.65)
        })

        // 4.3 아래 두 문단 — 선이 먼저 그어지고, 라벨과 본문이 차례로 떠오른다
        const root = notesRef.current
        gsap
          .timeline({
            scrollTrigger: { trigger: root, start: 'top 85%', once: true },
          })
          .from(`.${styles.rule}`, {
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 0.8,
            ease: EASE.expo,
          })
          .from(
            `.${styles.note} > :not(.${styles.rule})`,
            {
              y: RISE,
              autoAlpha: 0,
              duration: 0.8,
              ease: EASE.soft,
              stagger: STAGGER,
            },
            0.15,
          )
      })
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} id="about" className={shared.section}>
      <div className={shared.sideWrap}>
        {/* 섹션 머리를 왼쪽 2열로 작게 접어 큰 문장에 자리를 내준다 */}
        <div className={shared.sideLabel}>
          <p ref={labelRef} className={shared.label}>(01) About</p>
          <h2 ref={titleRef} className={shared.h3}>소개</h2>
        </div>

        <div className={shared.sideBody}>
          <p ref={statementRef} className={styles.statement}>
            {statement.map(({ text, accent }, index) => (
              <Fragment key={index}>
                <span className={accent ? `${styles.word} ${styles.accent}` : styles.word}>
                  {text}
                </span>
                {index < statement.length - 1 && ' '}
              </Fragment>
            ))}
          </p>

          <div ref={notesRef} className={styles.notes}>
            {notes.map(({ label, text }) => (
              <div key={label} className={styles.note}>
                <span className={styles.rule} aria-hidden="true" />
                <p className={shared.label}>{label}</p>
                <p className={styles.noteText}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
