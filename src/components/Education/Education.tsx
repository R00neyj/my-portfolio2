import { education } from '../../data/education'
import shared from '../../styles/shared.module.css'
import styles from './Education.module.css'

function Education() {
  // FR-E3: 항목이 2건 미만이면 제목만 남은 빈 섹션을 만들지 않는다.
  if (education.length < 2) {
    return null
  }

  return (
    <section id="education" className={shared.section}>
      <h2 className={shared.sectionHeading}>Education & Activities</h2>
      <ul className={styles.list}>
        {education.map((item) => (
          <li key={item.title} className={styles.item}>
            <h3 className={styles.itemTitle}>{item.title}</h3>
            <p className={styles.itemMeta}>
              <span>{item.organization}</span>
              <span>
                {item.start} – {item.end ?? '현재'}
              </span>
            </p>
            <ul className={styles.highlights}>
              {item.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Education
