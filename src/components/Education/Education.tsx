import { education } from '../../data/education'
import { useReveal } from '../../hooks/useReveal'
import shared from '../../styles/shared.module.css'
import styles from './Education.module.css'

// 데이터의 '2025-09'를 화면용 '2025.09'로 바꾼다
const formatDate = (date: string) => date.replace(/-/g, '.')

function Education() {
  const ref = useReveal<HTMLOListElement>({ stagger: true })

  // FR-E3: 항목이 2건 미만이면 제목만 남은 빈 섹션을 만들지 않는다.
  if (education.length < 2) {
    return null
  }

  return (
    <section id="education" className={shared.section}>
      <div className={shared.head}>
        <p className={shared.label}>(04) Education & Activities</p>
        <h2 className={shared.title}>배운 곳과 한 일</h2>
      </div>
      <ol ref={ref} className={styles.list}>
        {education.map((item, index) => (
          <li key={item.title} className={styles.item} data-reveal>
            <article className={styles.card}>
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
