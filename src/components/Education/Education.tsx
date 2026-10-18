import { useRef } from 'react'
import { education } from '../../data/education'
import { gsap, SplitText, useGSAP } from '../../motion/gsap'
import { DUR, EASE, MEDIA } from '../../motion/tokens'
import shared from '../../styles/shared.module.css'
import styles from './Education.module.css'

// 데이터의 '2025-09'를 화면용 '2025.09'로 바꾼다
const formatDate = (date: string) => date.replace(/-/g, '.')

function Education() {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const listRef = useRef<HTMLOListElement>(null)

  // MOTION.md §7 — 섹션 머리(처음 한 번) + 항목마다 재생형 등장.
  // 숨김 상태는 여기서만 만든다. 모션 줄이기 환경에서는 아무것도 만들지 않아 처음부터 다 보인다.
  useGSAP(
    () => {
      const head = headRef.current
      const label = labelRef.current
      const title = titleRef.current
      const list = listRef.current
      if (!head || !label || !title || !list) return

      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        const trigger = { trigger: head, start: 'top 80%', once: true }

        gsap.from(label, {
          clipPath: 'inset(0 100% 0 0)',
          duration: DUR.label,
          ease: EASE.soft,
          scrollTrigger: trigger,
        })
        // 한글이라 글자가 아닌 단어 단위로만 쪼갠다
        SplitText.create(title, {
          type: 'words',
          mask: 'words',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 110,
              duration: 0.8,
              ease: EASE.expo,
              stagger: 0.07,
              delay: 0.1,
              scrollTrigger: trigger,
            }),
        })

        const q = (item: Element, cls: string) =>
          Array.from(item.querySelectorAll(`.${cls}`))
        const restore: Array<() => void> = []

        Array.from(list.children).forEach((item, index) => {
          // 짝수 항목(.item:nth-child(2n))은 좌우가 엇갈려 있으므로 x 방향을 반대로
          const dir = index % 2 === 1 ? 1 : -1
          const frame = q(item, styles.frame)
          const year = item.querySelector<HTMLElement>(`.${styles.year}`)
          const metaItems = q(item, styles.meta).flatMap((meta) =>
            Array.from(meta.children),
          )
          const badge = item.querySelector(`.${styles.badge}`)
          const heading = [
            item.querySelector('h3'),
            item.querySelector(`.${styles.org}`),
          ]
          const highlights = q(item, styles.highlights).flatMap((ul) =>
            Array.from(ul.children),
          )

          const tl = gsap.timeline({
            scrollTrigger: { trigger: item, start: 'top 80%', once: true },
          })
          tl.from(
            frame,
            { scaleY: 0, transformOrigin: '0 0', duration: 0.8, ease: EASE.expo },
            0,
          )

          if (year) {
            const end = parseInt(year.textContent ?? '', 10)
            if (Number.isFinite(end)) {
              const counter = { value: end - 10 }
              year.textContent = String(counter.value)
              tl.to(
                counter,
                {
                  value: end,
                  duration: 0.9,
                  ease: EASE.soft,
                  onUpdate: () => {
                    year.textContent = String(Math.round(counter.value))
                  },
                  onComplete: () => {
                    year.textContent = String(end)
                  },
                },
                0.1,
              )
              restore.push(() => {
                year.textContent = String(end)
              })
            }
            tl.from(year, { yPercent: 40, duration: 0.9, ease: EASE.soft }, 0.1)
          }

          tl.from(
            metaItems,
            { autoAlpha: 0, duration: DUR.fade, ease: EASE.fade },
            0.25,
          )
          // 진행 중 배지는 나타난 뒤 한 번 튕긴다
          if (badge) {
            tl.to(badge, { scale: 1.12, duration: 0.15, ease: EASE.fade }, 0.55)
            tl.to(badge, { scale: 1, duration: 0.3, ease: EASE.bounce }, 0.7)
          }
          tl.from(
            heading,
            { y: 20, autoAlpha: 0, duration: 0.6, ease: EASE.soft, stagger: 0.06 },
            0.3,
          )
          tl.from(
            highlights,
            {
              x: dir * 12,
              autoAlpha: 0,
              duration: 0.5,
              ease: EASE.soft,
              stagger: 0.05,
            },
            0.45,
          )
        })

        return () => restore.forEach((fn) => fn())
      })
    },
    { scope: sectionRef },
  )

  // FR-E3: 항목이 2건 미만이면 제목만 남은 빈 섹션을 만들지 않는다.
  if (education.length < 2) {
    return null
  }

  return (
    <section ref={sectionRef} id="education" className={shared.section}>
      <div ref={headRef} className={shared.head}>
        <p ref={labelRef} className={shared.label}>(04) Education & Activities</p>
        <h2 ref={titleRef} className={shared.title}>배운 곳과 한 일</h2>
      </div>
      <ol ref={listRef} className={styles.list}>
        {education.map((item, index) => (
          <li key={item.title} className={styles.item}>
            <article className={styles.card}>
              <span className={styles.frame} aria-hidden="true" />
              <div className={styles.meta}>
                <span className={shared.label}>
                  {formatDate(item.start)} —{' '}
                  {item.end ? formatDate(item.end) : '현재'}
                </span>
                {item.end === null ? (
                  <span className={`${shared.label} ${styles.badge}`}>
                    진행 중
                  </span>
                ) : (
                  <span className={shared.label}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}
              </div>
              <p className={styles.year}>{item.start.slice(0, 4)}</p>
              <h3 className={shared.h3}>{item.title}</h3>
              <p className={styles.org}>{item.organization}</p>
              <ul className={styles.highlights}>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Education
