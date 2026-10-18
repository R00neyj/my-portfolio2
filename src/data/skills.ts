import type { SkillCategory } from './types'

// docs/skills.md 기준 — FR-S4: 면접에서 질문받을 각오가 된 것만 남길 것
export const skills: SkillCategory[] = [
  {
    category: 'Development',
    items: ['JavaScript', 'React', 'jQuery'],
  },
  {
    category: 'Design',
    items: ['Figma', 'Photoshop', 'Illustrator'],
  },
  {
    category: 'Motion & 3D',
    items: ['After Effects', 'Blender'],
  },
  {
    category: 'AI Tools',
    items: ['Claude Code', 'Codex', 'omp'],
  },
  {
    category: 'Tooling',
    items: ['Git'],
  },
]
