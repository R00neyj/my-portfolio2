import type { Project, ProjectCategory } from './types'

// 썸네일은 public/projects/에 있다. 배포 경로(vite.config.ts의 base)가 앞에 붙도록 BASE_URL을 쓴다
const thumb = (file: string) => `${import.meta.env.BASE_URL}projects/${file}`

// 분류 칩에 표시되는 순서
export const projectCategories: ProjectCategory[] = ['웹앱', '웹사이트', '디자인']

// docs/project.md 목록 기준
export const projects: Project[] = [
  {
    slug: 'my-sns',
    category: '웹앱',
    title: 'SNS 구현',
    tagline: 'TODO: 한 줄 소개',
    period: { start: 'TODO', end: 'TODO' },
    role: 'TODO: 맡은 역할',
    stack: [],
    thumbnail: thumb('my-sns.jpg'),
    links: {
      demo: 'https://r00neyj.github.io/my-sns/',
      repo: 'https://github.com/R00neyj/my-sns',
    },
    featured: false,
  },
  {
    slug: 'blog-demo',
    category: '웹사이트',
    title: '블로그 구현',
    tagline: 'TODO: 한 줄 소개',
    period: { start: 'TODO', end: 'TODO' },
    role: 'TODO: 맡은 역할',
    stack: [],
    thumbnail: thumb('blog-demo.jpg'),
    links: {
      demo: 'https://r00neyj.github.io/blog-demo/',
      repo: 'https://github.com/R00neyj/blog-demo',
    },
    featured: false,
  },
  {
    slug: 'portfolio-site',
    category: '웹사이트',
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
  {
    slug: 'design-1',
    category: '디자인',
    title: '예시 디자인 작업물',
    tagline: 'TODO: 한 줄 소개',
    period: { start: 'TODO', end: 'TODO' },
    role: '디자인',
    stack: [],
    thumbnail: thumb('design-1.jpg'),
    links: {},
    featured: false,
  },
  {
    slug: 'design-2',
    category: '디자인',
    title: '예시 디자인 작업물2',
    tagline: 'TODO: 한 줄 소개',
    period: { start: 'TODO', end: 'TODO' },
    role: '디자인',
    stack: [],
    thumbnail: thumb('design-2.jpg'),
    links: {},
    featured: false,
  },
  {
    slug: 'design-3',
    category: '디자인',
    title: '예시 디자인 작업물3',
    tagline: 'TODO: 한 줄 소개',
    period: { start: 'TODO', end: 'TODO' },
    role: '디자인',
    stack: [],
    thumbnail: thumb('design-3.jpg'),
    links: {},
    featured: false,
  },
]
