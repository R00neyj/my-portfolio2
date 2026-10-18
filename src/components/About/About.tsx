import { useEffect, useRef } from 'react'
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
  const statementRef = useRef<HTMLParagraphElement>(null)
  const notesRef = useRef<HTMLDivElement>(null)

  // 스크롤 채색 + 등장 모션 (docs/DESIGN.md §8.5)
  // 숨김 클래스는 JS가 붙이므로, 스크립트가 실패하거나 모션 감소 설정이면 처음부터 다 보인다
  useEffect(() => {
    const paragraph = statementRef.current
    const notesEl = notesRef.current
    if (!paragraph || !notesEl) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // 단어가 화면 높이 60% 선을 넘어 올라오면 칠하고, 다시 내려가면 지운다
    paragraph.classList.add(styles.painting)
    const words = paragraph.querySelectorAll<HTMLElement>(`.${styles.word}`)
    const wordObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const line = entry.rootBounds?.bottom ?? window.innerHeight * 0.6
          entry.target.classList.toggle(
            styles.on,
            entry.boundingClientRect.top < line,
          )
        }
      },
      { rootMargin: '0px 0px -40% 0px' },
    )
    words.forEach((word) => wordObserver.observe(word))

    // 아래 두 문단은 화면에 들어올 때 한 번만 떠오른다
    const items = notesEl.querySelectorAll<HTMLElement>(`.${styles.note}`)
    items.forEach((item) => item.classList.add(styles.hidden))
    const noteObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.remove(styles.hidden)
          noteObserver.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    items.forEach((item) => noteObserver.observe(item))

    return () => {
      wordObserver.disconnect()
      noteObserver.disconnect()
      paragraph.classList.remove(styles.painting)
      items.forEach((item) => item.classList.remove(styles.hidden))
    }
  }, [])

  return (
    <section id="about" className={shared.section}>
      <div className={styles.layout}>
        {/* 섹션 머리를 왼쪽 2열로 작게 접어 큰 문장에 자리를 내준다 */}
        <div className={styles.head}>
          <p className={styles.label}>(01) About</p>
          <h2 className={styles.heading}>소개</h2>
        </div>

        <div className={styles.body}>
          <p ref={statementRef} className={styles.statement}>
            {statement.map(({ text, accent }, index) => (
              <span
                key={index}
                className={accent ? `${styles.word} ${styles.accent}` : styles.word}
              >
                {text}
                {index < statement.length - 1 && ' '}
              </span>
            ))}
          </p>

          <div ref={notesRef} className={styles.notes}>
            {notes.map(({ label, text }, index) => (
              <div
                key={label}
                className={styles.note}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <p className={styles.label}>{label}</p>
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
