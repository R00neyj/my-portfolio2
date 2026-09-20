import type { ExternalLink } from './types'

// 두 조각으로 나눠 두어 단순 크롤러의 이메일 수집을 최소한으로 방해한다 (FR-C2).
export const EMAIL_USER = 'you'
export const EMAIL_DOMAIN = 'example.com'

export const links: ExternalLink[] = [
  {
    label: 'GitHub',
    url: 'https://github.com/R00neyj',
  },
  {
    label: 'Blog',
    url: 'https://example.com/blog',
    description: '아직 글이 없습니다',
  },
]
