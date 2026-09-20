import { skills } from '../../data/skills'
import shared from '../../styles/shared.module.css'
import styles from './Skills.module.css'

function Skills() {
  return (
    <section id="skills" className={shared.section}>
      <h2 className={shared.sectionHeading}>Skills</h2>
      <ul className={styles.categories}>
        {skills.map((group) => (
          <li key={group.category}>
            <h3 className={styles.categoryTitle}>{group.category}</h3>
            <ul className={styles.tags}>
              {group.items.map((item) => (
                <li key={item} className={styles.tag}>
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Skills
