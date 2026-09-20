// 콘텐츠 데이터 모델 — docs/요구사항.md §6

export interface SkillCategory {
  category: string
  items: string[]
}

export interface Project {
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

export interface EducationItem {
  title: string
  organization: string
  start: string
  end: string | null
  highlights: string[]
}

export interface ExternalLink {
  label: string
  url: string
  description?: string
}
