interface Project {
  slug: string
  title: string
  tagline: string
  period: { start: string; end: string | null }
  role: string
  problem: string
  decisions: string[]
  outcome: string[]
  stack: string[]
  thumbnail?: string
  links: {
    demo?: string
    repo?: string
    article?: string
  }
  featured: boolean
}

const projects: Project[] = [
  {
    slug: 'portfolio-site',
    title: '개인 포트폴리오 사이트 (이 사이트)',
    tagline: '요구사항 정의부터 설계·구현·배포까지 직접 진행한 1인 프로젝트',
    period: { start: '2026-09', end: null },
    role: '요구사항 정의, 설계, 구현, 성능·접근성 튜닝을 모두 담당',
    problem:
      '경력 증거가 부족한 상태에서 채용담당자가 5분 안에 무엇을 할 수 있는지 파악할 수 있는 단일 허브가 필요했습니다.',
    decisions: [
      '라우터 없는 단일 페이지 구조 — 프로젝트가 아직 적어 상세 페이지를 채울 내용이 없고, GitHub Pages에서 SPA 라우팅이 까다로워 라우터를 정당화할 근거가 사라졌습니다.',
      'CSS Modules + CSS 커스텀 프로퍼티 — 런타임 의존성 없이 다크 모드를 토큰화하면서 CSS 역량도 함께 보여줄 수 있는 방식을 선택했습니다.',
      'GitHub Pages + GitHub Actions 자동 배포 — 무료 정적 호스팅만으로 충분한 구성이라 판단했고, 경로·서버 기능 제약을 설계에 미리 반영했습니다.',
    ],
    outcome: [
      'Lighthouse Performance·Accessibility 95점 이상을 목표로 설계',
      '요구사항을 문서로 먼저 정리해, 판단 과정 자체가 이 프로젝트의 증거로 남음',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'CSS Modules'],
    links: {},
    featured: true,
  },
]

function Projects() {
  return (
    <section id="projects" className="section projects">
      <h2 className="section-heading">Projects</h2>
      <ul className="projects__list">
        {projects.map((project) => (
          <li key={project.slug}>
            <article className="project-card">
              <h3 className="project-card__title">{project.title}</h3>
              <p className="project-card__tagline">{project.tagline}</p>
              <p className="project-card__period">
                {project.period.start} – {project.period.end ?? '진행 중'}
              </p>
              <p className="project-card__role">{project.role}</p>
              <p className="project-card__problem">{project.problem}</p>
              <ul className="project-card__decisions">
                {project.decisions.map((decision) => (
                  <li key={decision}>{decision}</li>
                ))}
              </ul>
              <ul className="project-card__outcome">
                {project.outcome.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <ul className="project-card__stack">
                {project.stack.map((tech) => (
                  <li key={tech} className="project-card__stack-item">
                    {tech}
                  </li>
                ))}
              </ul>
              <p className="project-card__links">
                {project.links.demo ? (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card__link"
                  >
                    데모 보기
                  </a>
                ) : (
                  '데모: 준비 중'
                )}
                {project.links.repo ? (
                  <a
                    href={project.links.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-card__link"
                  >
                    소스 코드
                  </a>
                ) : (
                  '소스 코드: 준비 중'
                )}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Projects
