import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ExternalLink as ExternalLinkIcon } from 'lucide-react'
import { gsap, ScrollTrigger, SplitText, Flip, useGSAP } from '../../motion/gsap'
import { DUR, EASE, MEDIA, STAGGER } from '../../motion/tokens'
import { projectCategories, projects } from '../../data/projects'
import type { Project, ProjectCategory } from '../../data/types'
import shared from '../../styles/shared.module.css'
import styles from './Projects.module.css'

type Filter = ProjectCategory | '전체'

// '전체' 칩에서 한 번에 보여 줄 작업물 수 — 넘치면 '더보기' 버튼으로 이어서 보여 준다
const PAGE_SIZE = 6

// 계단 패럴랙스는 CSS가 3열인 구간(1001px~)에서만 쓴다 (CSS 브레이크포인트 1000px과 맞춤)
const MEDIA_STAIRS = '(prefers-reduced-motion: no-preference) and (min-width: 1001px)'

// 열(1·2·3번째)마다 스크롤하는 동안 올라가는 거리(px) — MOTION.md §6.3
const STAIR_SHIFT = [-40, -80, -120]

// 카드 한 장 등장 — 테두리 박스 → 썸네일 → 메타 → 제목·소개·스택 (MOTION.md §6.2)
// 카드(li)는 Flip이, 패럴랙스는 안쪽 래퍼가 쓰므로 여기서는 article과 그 안쪽만 움직인다
function revealCard(item: HTMLElement, delay = 0) {
  const card = item.querySelector<HTMLElement>('article')
  if (!card) return null
  const thumb = card.querySelector<HTMLElement>(`.${styles.thumbnail} > *`)
  const meta = card.querySelector(`.${styles.meta}`)
  const texts = [styles.title, styles.tagline, styles.stack]
    .map((name) => card.querySelector(`.${name}`))
    .filter(Boolean)

  const tl = gsap.timeline({ delay })
  tl.fromTo(
    card,
    { clipPath: 'inset(100% 0 0 0)' },
    { clipPath: 'inset(0% 0 0 0)', duration: DUR.reveal, ease: EASE.soft, clearProps: 'clipPath' },
    0,
  )
  if (thumb) {
    // 썸네일의 CSS 호버 전환이 GSAP 값을 따라 늦게 움직이지 않도록 끄고, 끝나면 되돌린다
    tl.fromTo(
      thumb,
      { scale: 1.25 },
      {
        scale: 1,
        duration: 1,
        ease: EASE.soft,
        clearProps: 'transform,transition',
        onStart: () => {
          thumb.style.transition = 'none'
        },
      },
      0.1,
    )
  }
  if (meta) {
    tl.from(meta, { autoAlpha: 0, duration: DUR.fade, ease: EASE.fade, clearProps: 'opacity,visibility' }, 0.3)
  }
  if (texts.length > 0) {
    tl.from(
      texts,
      {
        y: 20,
        autoAlpha: 0,
        duration: DUR.reveal - 0.02,
        ease: EASE.soft,
        stagger: 0.06,
        clearProps: 'transform,opacity,visibility',
      },
      0.35,
    )
  }
  return tl
}

// '자세히 보기' — 높이 0 → auto로 펼치고, 닫을 때는 애니메이션이 끝난 뒤 open을 뗀다
// 모션 줄이기 환경에서는 가로채지 않아 브라우저 기본 동작을 그대로 쓴다
function Details({ project }: { project: Project }) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)
  const { contextSafe } = useGSAP({ scope: detailsRef })

  const toggle = contextSafe((event: MouseEvent<HTMLElement>) => {
    const details = detailsRef.current
    const body = bodyRef.current
    if (!details || !body || !window.matchMedia(MEDIA.motion).matches) return
    event.preventDefault()
    gsap.killTweensOf(body)

    if (details.open && !closingRef.current) {
      closingRef.current = true
      gsap.to(body, {
        height: 0,
        overflow: 'hidden',
        duration: DUR.slow,
        ease: EASE.soft,
        onComplete: () => {
          details.removeAttribute('open')
          closingRef.current = false
          gsap.set(body, { clearProps: 'height,overflow' })
        },
      })
      return
    }

    // 닫히는 도중에 다시 누르면 지금 높이에서 이어서 펼친다
    const from = closingRef.current ? body.offsetHeight : 0
    closingRef.current = false
    details.open = true
    gsap.fromTo(
      body,
      { height: from, overflow: 'hidden' },
      {
        height: 'auto',
        duration: DUR.slow,
        ease: EASE.soft,
        clearProps: 'height,overflow',
      },
    )
  })

  return (
    <details ref={detailsRef} className={styles.details}>
      <summary className={styles.summary} onClick={toggle}>
        자세히 보기
      </summary>
      <div ref={bodyRef} className={styles.detailsBody}>
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
  )
}

interface ProjectItemProps {
  project: Project
  // 보이는 카드 기준 순서 — 계단 열(0·1·2)과 2열 배치의 짝홀을 CSS에 알려 준다. 숨긴 카드는 null
  position: number | null
}

// 모든 작업물을 렌더하고 안 보이는 것은 hidden으로 숨긴다 (Flip이 빠지는 카드를 그릴 수 있게)
// li = Flip 대상, .stair = 패럴랙스 y, article = 등장 clip-path
function ProjectItem({ project, position }: ProjectItemProps) {
  return (
    <li
      hidden={position === null}
      data-col={position === null ? undefined : position % 3}
      data-odd={position === null ? undefined : position % 2 === 1}
    >
      <div className={styles.stair}>
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

            {project.problem && <Details project={project} />}

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
      </div>
    </li>
  )
}

function Projects() {
  const [selected, setSelected] = useState<Filter>('전체')
  const [limit, setLimit] = useState(PAGE_SIZE)

  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  // '더보기'로 새로 나타난 첫 카드에 포커스를 옮기기 위한 위치
  const focusIndexRef = useRef<number | null>(null)

  // 모션이 켜져 있는지(모션 줄이기가 아닌지) — Flip 전환을 만들지 판단
  const motionRef = useRef(false)
  // 칩·더보기를 누르기 직전에 찍어 둔 카드 위치 / 그때 보이던 카드들
  const flipStateRef = useRef<Flip.FlipState | null>(null)
  const beforeShownRef = useRef<HTMLElement[]>([])
  const flipRef = useRef<gsap.core.Timeline | null>(null)
  const batchRef = useRef<ScrollTrigger[]>([])
  const revealedRef = useRef<Set<Element>>(new Set())
  const prevSelectedRef = useRef<Filter>('전체')

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
  const positions = new Map(shown.map((project, index) => [project.slug, index]))

  // 지금 보이는 카드(li)들
  function shownItems() {
    return Array.from(
      listRef.current?.querySelectorAll<HTMLElement>(':scope > li:not([hidden])') ?? [],
    )
  }

  // 진행 중인 전환을 끝내고 지금 카드 위치를 기억해 둔다 (다음 렌더 뒤 Flip이 쓴다)
  function captureState() {
    flipRef.current?.progress(1)
    const list = listRef.current
    if (!list) return
    beforeShownRef.current = shownItems()
    flipStateRef.current = Flip.getState(list.querySelectorAll(':scope > li'))
  }

  function selectFilter(name: Filter) {
    if (name === selected) return
    captureState()
    setSelected(name)
    setLimit(PAGE_SIZE)
  }

  function showMore() {
    captureState()
    focusIndexRef.current = limit
    setLimit(limit + PAGE_SIZE)
  }

  // 섹션 머리 + 칩 + 카드 첫 등장 (MOTION.md §6.1, §6.2)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MEDIA.motion, () => {
        motionRef.current = true
        const header = headRef.current
        const chips = chipsRef.current
        const status = statusRef.current
        const list = listRef.current
        if (!header || !chips || !status || !list) return
        const trigger = { trigger: header, start: 'top 80%', once: true }
        const label = header.querySelector<HTMLElement>('p')
        const title = header.querySelector<HTMLElement>('h2')

        const tl = gsap.timeline({ scrollTrigger: trigger })
        if (label) {
          tl.from(
            label,
            { clipPath: 'inset(0 100% 0 0)', duration: DUR.label, ease: EASE.soft, clearProps: 'clipPath' },
            0,
          )
        }
        tl.from(
          chips.children,
          {
            y: 16,
            autoAlpha: 0,
            duration: DUR.label,
            ease: EASE.bounce,
            stagger: 0.05,
            clearProps: 'transform,opacity,visibility',
          },
          0.4,
        )
        tl.from(status, { autoAlpha: 0, duration: DUR.fade, ease: EASE.fade, clearProps: 'opacity,visibility' }, 0.55)

        // 한글은 단어 단위로만 쪼갠다
        if (title) {
          SplitText.create(title, {
            type: 'words',
            mask: 'words',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.words, {
                yPercent: 110,
                duration: 0.8,
                ease: EASE.expo,
                stagger: 0.06,
                delay: 0.08,
                scrollTrigger: trigger,
              }),
          })
        }

        // 카드: 처음 보이는 카드는 가려 두었다가 같이 화면에 들어온 카드끼리 묶어서 재생
        const items = shownItems()
        gsap.set(
          items.map((item) => item.querySelector('article')),
          { clipPath: 'inset(100% 0 0 0)' },
        )
        batchRef.current = ScrollTrigger.batch(items, {
          start: 'top 85%',
          once: true,
          onEnter: (batch) =>
            batch.forEach((item, index) => {
              revealedRef.current.add(item)
              revealCard(item as HTMLElement, index * STAGGER)
            }),
        })

        return () => {
          motionRef.current = false
          batchRef.current = []
        }
      })
    },
    { scope: sectionRef },
  )

  // 필터·더보기가 바뀌면: 카드를 넣고 빼는 Flip 전환 (MOTION.md §6.4)
  useGSAP(
    () => {
      const state = flipStateRef.current
      const list = listRef.current
      const count = countRef.current
      flipStateRef.current = null
      if (!state || !list || !motionRef.current) return

      // 처음 등장을 기다리던 카드가 있으면 여기서 함께 보여 준다
      batchRef.current.forEach((st) => st.kill())
      batchRef.current = []

      const now = shownItems()
      const staying = now.filter((item) => beforeShownRef.current.includes(item))
      staying
        .filter((item) => !revealedRef.current.has(item))
        .forEach((item, index) => {
          revealedRef.current.add(item)
          revealCard(item, 0.25 + index * 0.06)
        })

      flipRef.current = Flip.from(state, {
        absolute: true,
        duration: 0.6,
        ease: EASE.inOut,
        onEnter: (elements) => {
          const tl = gsap.timeline()
          elements.forEach((item, index) => {
            revealedRef.current.add(item)
            const card = revealCard(item as HTMLElement, 0.25 + index * 0.06)
            if (card) tl.add(card, 0)
          })
          return tl
        },
        onLeave: (elements) =>
          gsap.to(elements, {
            scale: 0.9,
            autoAlpha: 0,
            duration: 0.25,
            ease: 'power2.in',
          }),
        onComplete: () => {
          flipRef.current = null
          // 빠졌다 다시 들어오는 카드가 투명한 채 남지 않도록 정리
          gsap.set(list.querySelectorAll(':scope > li'), {
            clearProps: 'opacity,visibility,transform',
          })
          ScrollTrigger.refresh()
        },
      })

      // 남는 카드는 움직이는 동안 살짝 기울었다 펴진다 (짝수 카드는 반대 방향)
      const cards = staying
        .map((item) => item.querySelector('article'))
        .filter((card): card is HTMLElement => card !== null)
      gsap.fromTo(
        cards,
        { rotate: (index: number) => (index % 2 === 0 ? -1.5 : 1.5) },
        { rotate: 0, duration: 0.6, ease: EASE.bounce, clearProps: 'rotate' },
      )

      // 상태 문구의 숫자만 아래에서 올라와 바뀐다
      if (count && prevSelectedRef.current !== selected) {
        gsap.fromTo(
          count,
          { yPercent: 100 },
          { yPercent: 0, duration: DUR.fade, ease: EASE.soft, delay: 0.25, clearProps: 'transform' },
        )
      }
      prevSelectedRef.current = selected
    },
    { scope: sectionRef, dependencies: [selected, limit] },
  )

  // 계단 패럴랙스 — 보이는 카드의 열이 바뀌면 다시 만든다 (MOTION.md §6.3)
  useGSAP(
    () => {
      const list = listRef.current
      if (!list) return
      const mm = gsap.matchMedia()
      mm.add(MEDIA_STAIRS, () => {
        STAIR_SHIFT.forEach((shift, col) => {
          const targets = list.querySelectorAll(
            `:scope > li[data-col='${col}'] > .${styles.stair}`,
          )
          if (targets.length === 0) return
          gsap.fromTo(
            targets,
            { y: 0 },
            {
              y: shift,
              ease: EASE.none,
              scrollTrigger: {
                trigger: list,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            },
          )
        })
      })
    },
    { scope: sectionRef, dependencies: [selected, limit], revertOnUpdate: true },
  )

  // '더보기'로 새로 나타난 첫 카드로 포커스를 옮긴다
  useEffect(() => {
    const index = focusIndexRef.current
    if (index === null) return
    focusIndexRef.current = null
    const items = listRef.current?.querySelectorAll<HTMLElement>(':scope > li:not([hidden])')
    items?.[index]?.querySelector('article')?.focus()
  }, [limit])

  return (
    <section id="projects" ref={sectionRef} className={shared.section}>
      <header ref={headRef} className={shared.head}>
        <p className={shared.label}>(03) Projects</p>
        <h2 className={shared.title}>만든 것으로 말합니다</h2>
      </header>

      <div ref={chipsRef} className={styles.chips} role="group" aria-label="프로젝트 분류">
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
      <p ref={statusRef} className={styles.status} aria-live="polite">
        {selected} ·{' '}
        <span className={styles.statusMask}>
          <span ref={countRef} className={styles.statusNum}>
            {visible.length}
          </span>
        </span>
        개 작업물
        {remaining > 0 && ` 중 ${shown.length}개 표시`}
      </p>

      <ul ref={listRef} className={styles.list}>
        {projects.map((project) => (
          <ProjectItem
            key={project.slug}
            project={project}
            position={positions.get(project.slug) ?? null}
          />
        ))}
      </ul>

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
