interface SkillCategory {
  category: string
  items: string[]
}

// TODO: 실제 기술 스택으로 교체 — FR-S4: 면접에서 질문받을 각오가 된 것만 남길 것
const skills: SkillCategory[] = [
  {
    category: 'Language',
    items: ['JavaScript', 'TypeScript'],
  },
  {
    category: 'Framework',
    items: ['React'],
  },
  {
    category: 'Tooling',
    items: ['Vite', 'Git'],
  },
]

function Skills() {
  return (
    <section id="skills" className="section skills">
      <h2 className="section-heading">Skills</h2>
      <ul className="skills__categories">
        {skills.map((group) => (
          <li key={group.category}>
            <h3 className="skills__category-title">{group.category}</h3>
            <ul className="skills__tags">
              {group.items.map((item) => (
                <li key={item} className="skills__tag">
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
