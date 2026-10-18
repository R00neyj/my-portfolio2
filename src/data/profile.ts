import type { Profile } from './types'

// Hero에 쓰는 기본 정보 (FR-H1). 연도는 매년 바뀌므로 여기서만 고친다 (FR-H1a).
export const profile: Profile = {
  // TODO: 실명으로 교체
  name: '이름',
  role: 'Frontend Engineer',
  year: '2027',
  // FR-H1b: 구절 단위로만 줄을 바꾸도록 나눠 둔다
  tagline: ['디자인의 의도를 이해하고,', '코드로 끝까지 구현합니다.'],
}
