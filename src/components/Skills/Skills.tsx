import { Fragment, useRef } from 'react'
import { skills } from '../../data/skills'
import { gsap, useGSAP } from '../../motion/gsap'
import { DUR, EASE, MEDIA, STAGGER } from '../../motion/tokens'
import shared from '../../styles/shared.module.css'
import styles from './Skills.module.css'

function Skills() {
  const sectionRef = useRef<HTMLElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const groupsRef = useRef<HTMLUListElement>(null)

  // docs/MOTION.md §5.1 — 모션 줄이기 환경에서는 타임라인을 만들지 않아 처음부터 다 보인다
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA.motion, () => {
        const groups = gsap.utils.toArray<HTMLElement>(`.${styles.group}`, groupsRef.current)
        const counts = gsap.utils.toArray<HTMLElement>('[data-count]', groupsRef.current)
        const finals = counts.map((el) => el.textContent ?? '0')
        counts.forEach((el) => {
          el.textContent = '0'
        })

        const tl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        })

        // 섹션 머리 (§4.1과 같은 패턴)
        tl.from(labelRef.current, {
          clipPath: 'inset(0 100% 0 0)',
          duration: DUR.label,
          ease: EASE.soft,
        }).from(
          titleRef.current,
          { clipPath: 'inset(100% 0 0 0)', duration: DUR.reveal, ease: EASE.soft },
          0.1,
        )

        groups.forEach((group, index) => {
          const delay = index * STAGGER
          const rule = group.querySelector(`.${styles.rule}`)
          const label = group.querySelector('[data-group-label]')
          const words = group.querySelectorAll(`.${styles.wordInner}`)
          const seps = group.querySelectorAll(`.${styles.sep}`)

          // 그룹 사이 가로선
          tl.from(
            rule,
            { scaleX: 0, transformOrigin: 'left center', duration: 0.8, ease: EASE.expo },
            0.2 + delay,
          )
          // 그룹 라벨 + 개수 카운트업
          tl.from(label, { autoAlpha: 0, duration: 0.6, ease: EASE.fade }, 0.3 + delay)
          const proxy = { value: 0 }
          const target = Number(finals[index])
          tl.to(
            proxy,
            {
              value: target,
              duration: 0.6,
              ease: EASE.fade,
              onUpdate: () => {
                counts[index].textContent = String(Math.round(proxy.value))
              },
            },
            0.3 + delay,
          )
          // 단어가 줄 안의 마스크에서 올라온다
          tl.from(
            words,
            { yPercent: 100, duration: 0.6, ease: EASE.soft, stagger: 0.04 },
            0.35 + delay,
          )
          // 구분자
          tl.from(
            seps,
            { rotate: -90, autoAlpha: 0, duration: 0.4, ease: EASE.bounce, stagger: 0.04 },
            0.5 + delay,
          )
        })

        // 되돌릴 때(모션 설정 변경 등) 원래 숫자로 복원
        return () => {
          counts.forEach((el, i) => {
            el.textContent = finals[i]
          })
        }
      })
    },
    { scope: sectionRef },
  )

  return (
    <section ref={sectionRef} id="skills" className={`${shared.section} ${shared.sideWrap}`}>
      <div className={shared.sideLabel}>
        <p ref={labelRef} className={shared.label}>(02) Skills</p>
        <h2 ref={titleRef} className={shared.h3}>쓸 줄 아는 도구</h2>
      </div>
      <ul ref={groupsRef} className={`${shared.sideBody} ${styles.groups}`}>
        {skills.map((group, index) => (
          <li key={group.category} className={styles.group}>
            <span className={styles.rule} aria-hidden="true" />
            <span className={shared.label} data-group-label>
              {String(index + 1).padStart(2, '0')} — {group.category} ·{' '}
              <span data-count>{group.items.length}</span>
            </span>
            <ul className={styles.words}>
              {group.items.map((item, i) => (
                <Fragment key={item}>
                  {i > 0 && (
                    <li className={styles.sep} aria-hidden="true">
                      /
                    </li>
                  )}
                  <li className={styles.word}>
                    <span className={styles.wordInner}>{item}</span>
                  </li>
                </Fragment>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Skills
