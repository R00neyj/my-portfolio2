// 콘텐츠 데이터 모델 — docs/요구사항.md §6

export interface SkillCategory {
  category: string
  items: string[]
}

// Projects 섹션의 분류 칩 — 칩 순서는 data/projects.ts의 projectCategories를 따른다
export type ProjectCategory = '웹앱' | '웹사이트' | '디자인'

export interface Project {
  slug: string
  category: ProjectCategory
  title: string
  tagline: string
  period: { start: string; end: string | null }
  role: string
  // 디자인 작업물처럼 설명이 필요 없는 항목은 아래 세 필드를 생략할 수 있다
  problem?: string
  decisions?: string[]
  outcome?: string[]
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
