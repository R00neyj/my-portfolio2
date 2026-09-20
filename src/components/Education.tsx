interface EducationItem {
  title: string
  organization: string
  start: string
  end: string | null
  highlights: string[]
}

// TODO: 실제 학력/부트캠프/스터디/수상 등으로 교체 (역순 정렬 — FR-E1)
const education: EducationItem[] = [
  {
    title: 'TODO: 부트캠프·교육과정명',
    organization: 'TODO: 기관명',
    start: '2025-09',
    end: null,
    highlights: ['TODO: 무엇을 했는지 1~2줄'],
  },
  {
    title: 'TODO: 학교/전공 또는 스터디명',
    organization: 'TODO: 기관명',
    start: '2021-03',
    end: '2025-02',
    highlights: ['TODO: 무엇을 했는지 1~2줄'],
  },
]

function Education() {
  if (education.length < 2) {
    return null
  }

  return (
    <section id="education" className="section education">
      <h2 className="section-heading">Education & Activities</h2>
      <ul className="education__list">
        {education.map((item) => (
          <li key={item.title}>
            <h3 className="education__item-title">{item.title}</h3>
            <p className="education__item-org">{item.organization}</p>
            <p className="education__item-period">
              {item.start} – {item.end ?? '현재'}
            </p>
            <ul className="education__item-highlights">
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
