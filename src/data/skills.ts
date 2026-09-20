import type { SkillCategory } from './types'

// TODO: 실제 기술 스택으로 교체 — FR-S4: 면접에서 질문받을 각오가 된 것만 남길 것
export const skills: SkillCategory[] = [
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
