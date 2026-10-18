import { useEffect, useState } from 'react'
import { ExternalLink as ExternalLinkIcon } from 'lucide-react'
import { useReveal } from '../../hooks/useReveal'
import { projectCategories, projects } from '../../data/projects'
import type { Project, ProjectCategory } from '../../data/types'
import shared from '../../styles/shared.module.css'
import styles from './Projects.module.css'

type Filter = ProjectCategory | '전체'

// '전체' 칩에서 한 번에 보여 줄 작업물 수 — 넘치면 '더보기' 버튼으로 이어서 보여 준다
const PAGE_SIZE = 6

interface ProjectListProps {
  shown: Project[]
  // '더보기'로 새로 나타난 첫 카드의 위치 — 포커스를 옮긴 뒤 onFocused로 비운다
  focusIndex: number | null
  onFocused: () => void
}

// 분류가 바뀌면 key로 새로 마운트되어 등장 모션이 다시 재생된다
function ProjectList({ shown, focusIndex, onFocused }: ProjectListProps) {
  const listRef = useReveal<HTMLUListElement>({ stagger: true })

  useEffect(() => {
    if (focusIndex === null) return
    const item = listRef.current?.children[focusIndex]
    item?.querySelector('article')?.focus()
    onFocused()
  }, [focusIndex, onFocused, listRef])

  return (
    <ul ref={listRef} className={styles.list}>
      {shown.map((project) => (
        <li key={project.slug} data-reveal>
          <article className={styles.card} tabIndex={-1}>
            <div className={styles.thumbnail}>
              {project.thumbnail ? (
                <img
                  src={project.thumbnail}
                  alt={`${project.title} 이미지`}
                  className={styles.thumbnailImage}
                  loading="lazy"
                  width={640}
                  height={500}
                />
              ) : (
                <span className={styles.initial} aria-hidden="true">
                  {project.title.charAt(0)}
                </span>
              )}
            </div>

            <p className={styles.meta}>
              <span>{project.category}</span>
              <span>
                {project.period.start} – {project.period.end ?? '진행 중'}
              </span>
            </p>

            <div className={styles.body}>
              <h3 className={styles.title}>{project.title}</h3>
              <p className={styles.tagline}>{project.tagline}</p>

              {project.stack.length > 0 && (
                <p className={styles.stack}>{project.stack.join(' · ')}</p>
              )}

              {project.problem && (
                <details className={styles.details}>
                  <summary className={styles.summary}>자세히 보기</summary>
                  <div className={styles.detailsBody}>
                    <p className={styles.field}>
                      <span className={styles.fieldLabel}>역할</span>
                      {project.role}
                    </p>
                    <p className={styles.field}>
                      <span className={styles.fieldLabel}>문제</span>
                      {project.problem}
                    </p>
                    {project.decisions && (
                      <div>
                        <span className={styles.fieldLabel}>기술적 선택과 이유</span>
                        <ul className={styles.bullets}>
                          {project.decisions.map((decision) => (
                            <li key={decision}>{decision}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {project.outcome && (
                      <div>
                        <span className={styles.fieldLabel}>결과</span>
                        <ul className={styles.bullets}>
                          {project.outcome.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {(project.links.demo || project.links.repo) && (
                <p className={styles.links}>
                  {project.links.demo && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      데모 보기
                      <ExternalLinkIcon size={14} aria-hidden="true" />
                    </a>
                  )}
                  {project.links.repo && (
                    <a
                      href={project.links.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      소스 코드
                      <ExternalLinkIcon size={14} aria-hidden="true" />
                    </a>
                  )}
                </p>
              )}
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}

function Projects() {
  const [selected, setSelected] = useState<Filter>('전체')
  const [limit, setLimit] = useState(PAGE_SIZE)
  // '더보기'로 새로 나타난 첫 카드에 포커스를 옮기기 위한 위치
  const [focusIndex, setFocusIndex] = useState<number | null>(null)

  // 작업물이 없는 분류는 칩을 만들지 않는다
  const filters = [
    { name: '전체' as Filter, count: projects.length },
    ...projectCategories.map((name) => ({
      name,
      count: projects.filter((project) => project.category === name).length,
    })),
  ].filter((filter) => filter.count > 0)

  const visible =
    selected === '전체'
      ? projects
      : projects.filter((project) => project.category === selected)
  const shown = selected === '전체' ? visible.slice(0, limit) : visible
  const remaining = visible.length - shown.length

  function selectFilter(name: Filter) {
    setSelected(name)
    setLimit(PAGE_SIZE)
  }

  function showMore() {
    setFocusIndex(limit)
    setLimit(limit + PAGE_SIZE)
  }

  return (
    <section id="projects" className={shared.section}>
      <header className={shared.head}>
        <p className={shared.label}>(03) Projects</p>
        <h2 className={shared.title}>만든 것으로 말합니다</h2>
      </header>

      <div className={styles.chips} role="group" aria-label="프로젝트 분류">
        {filters.map(({ name, count }) => (
          <button
            key={name}
            type="button"
            className={styles.chip}
            aria-pressed={selected === name}
            onClick={() => selectFilter(name)}
          >
            {name}
            <span className={styles.chipCount}>{count}</span>
          </button>
        ))}
      </div>
      <p className={styles.status} aria-live="polite">
        {selected} · {visible.length}개 작업물
        {remaining > 0 && ` 중 ${shown.length}개 표시`}
      </p>

      <ProjectList
        key={selected}
        shown={shown}
        focusIndex={focusIndex}
        onFocused={() => setFocusIndex(null)}
      />

      {remaining > 0 && (
        <div className={styles.moreWrap}>
          <button type="button" className={styles.more} onClick={showMore}>
            더보기
            <span className={styles.moreCount}>+{remaining}</span>
          </button>
        </div>
      )}
    </section>
  )
}

export default Projects
