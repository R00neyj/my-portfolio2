// GSAP 쪽 모션 토큰 — src/styles/tokens.css의 곡선·시간과 짝을 이룬다 (docs/MOTION.md §1.1)
// 컴포넌트는 숫자·곡선 이름을 직접 쓰지 말고 여기 이름을 가져다 쓴다 (DS6)

export const EASE = {
  /** --ease-out-expo: 커서, 헤더, 밑줄 */
  expo: 'expo.out',
  /** --ease-out-soft: 등장, 이미지 */
  soft: 'power3.out',
  /** --ease-bounce: 통통 튀는 호버·클릭 */
  bounce: 'back.out(2.2)',
  /** 화면을 덮고 걷는 큰 전환 (Loader 기둥과 같음) */
  inOut: 'expo.inOut',
  /** 가벼운 나타남 */
  fade: 'power2.out',
  /** scrub — 곡선은 스크롤이 만든다 */
  none: 'none',
} as const

/** 초(s) 단위 */
export const DUR = {
  fast: 0.2,
  base: 0.26,
  fade: 0.3,
  slow: 0.4,
  label: 0.5,
  reveal: 0.62,
  image: 0.8,
  header: 0.52,
} as const

/** 카드·항목 순서 지연 (--stagger) */
export const STAGGER = 0.1

/** 본문이 떠오르기 시작하는 거리(px) */
export const RISE = 28

/** scrub 기본 지연 */
export const SCRUB = 0.6

/** gsap.matchMedia 조건 — 이 조건 밖(모션 줄이기)에서는 타임라인을 아예 만들지 않는다 (MOTION.md §1.3) */
export const MEDIA = {
  motion: '(prefers-reduced-motion: no-preference)',
  desktop: '(prefers-reduced-motion: no-preference) and (min-width: 1024px)',
  mobile: '(prefers-reduced-motion: no-preference) and (max-width: 1023px)',
  hover: '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
} as const
