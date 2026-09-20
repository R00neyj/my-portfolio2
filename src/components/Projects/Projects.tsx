import { ExternalLink as ExternalLinkIcon, Image as ImageIcon } from 'lucide-react'
import { projects } from '../../data/projects'
import shared from '../../styles/shared.module.css'
import styles from './Projects.module.css'

function Projects() {
  return (
    <section id="projects" className={shared.section}>
      <h2 className={shared.sectionHeading}>Projects</h2>
      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project.slug}>
            <article className={styles.card}>
              {project.thumbnail ? (
                <img
                  src={project.thumbnail}
                  alt={`${project.title} 스크린샷`}
                  className={styles.thumbnailImage}
                  loading="lazy"
                  width={640}
                  height={360}
                />
              ) : (
                <div className={styles.thumbnail} aria-hidden="true">
                  <ImageIcon size={32} strokeWidth={1.5} />
                </div>
              )}

              <div className={styles.body}>
                <h3 className={styles.title}>{project.title}</h3>
                <p className={styles.tagline}>{project.tagline}</p>
                <p className={styles.meta}>
                  <span>
                    {project.period.start} – {project.period.end ?? '진행 중'}
                  </span>
                  <span>{project.role}</span>
                </p>

                <p className={styles.field}>
                  <span className={styles.fieldLabel}>문제</span>
                  {project.problem}
                </p>

                <div>
                  <span className={styles.fieldLabel}>기술적 선택과 이유</span>
                  <ul className={styles.decisions}>
                    {project.decisions.map((decision) => (
                      <li key={decision}>{decision}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className={styles.fieldLabel}>결과</span>
                  <ul className={styles.outcome}>
                    {project.outcome.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <ul className={styles.stack}>
                  {project.stack.map((tech) => (
                    <li key={tech} className={styles.stackItem}>
                      {tech}
                    </li>
                  ))}
                </ul>

                <p className={styles.links}>
                  {project.links.demo ? (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      <ExternalLinkIcon size={16} aria-hidden="true" />
                      데모 보기
                    </a>
                  ) : (
                    <span className={styles.linkDisabled}>데모: 준비 중</span>
                  )}
                  {project.links.repo ? (
                    <a
                      href={project.links.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      <ExternalLinkIcon size={16} aria-hidden="true" />
                      소스 코드
                    </a>
                  ) : (
                    <span className={styles.linkDisabled}>소스 코드: 준비 중</span>
                  )}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Projects
