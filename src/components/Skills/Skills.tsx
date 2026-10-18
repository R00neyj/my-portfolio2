import { Fragment } from 'react'
import { skills } from '../../data/skills'
import { useReveal } from '../../hooks/useReveal'
import shared from '../../styles/shared.module.css'
import styles from './Skills.module.css'

function Skills() {
  const ref = useReveal<HTMLUListElement>({ stagger: true })

  return (
    <section id="skills" className={`${shared.section} ${shared.sideWrap}`}>
      <div className={shared.sideLabel}>
        <p className={shared.label}>(02) Skills</p>
        <h2 className={shared.h3}>쓸 줄 아는 도구</h2>
      </div>
      <ul ref={ref} className={`${shared.sideBody} ${styles.groups}`}>
        {skills.map((group, index) => (
          <li key={group.category} className={styles.group} data-reveal>
            <span className={shared.label}>
              {String(index + 1).padStart(2, '0')} — {group.category} ·{' '}
              {group.items.length}
            </span>
            <ul className={styles.words}>
              {group.items.map((item, i) => (
                <Fragment key={item}>
                  {i > 0 && (
                    <li className={styles.sep} aria-hidden="true">
                      /
                    </li>
                  )}
                  <li className={styles.word}>{item}</li>
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
