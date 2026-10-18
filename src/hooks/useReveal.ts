import { useEffect, useRef } from 'react'

/**
 * §8.5 등장 모션: 컨테이너 안의 [data-reveal] 요소가 화면에 들어올 때 한 번만 떠오른다.
 * 숨김 상태(data-reveal="hidden")는 JS가 붙이므로, 스크립트가 실패하거나
 * 모션 감소 설정이면 처음부터 다 보인다. 스타일은 src/index.css에 있다.
 *
 * stagger: 형제 순서대로 --stagger(100ms)씩 늦게 시작한다.
 */
export function useReveal<T extends HTMLElement>({ stagger = false } = {}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!('IntersectionObserver' in window)) return

    const items = root.matches('[data-reveal]')
      ? [root]
      : Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const target = entry.target as HTMLElement
          target.dataset.reveal = 'shown'
          // 등장이 끝나면 지연을 지워 호버 같은 다른 전환이 늦게 반응하지 않게 한다
          target.addEventListener(
            'transitionend',
            () => (target.style.transitionDelay = ''),
            { once: true },
          )
          observer.unobserve(target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )

    items.forEach((item, index) => {
      item.dataset.reveal = 'hidden'
      if (stagger) item.style.transitionDelay = `calc(var(--stagger) * ${index})`
      observer.observe(item)
    })

    return () => {
      observer.disconnect()
      items.forEach((item) => {
        item.dataset.reveal = ''
        item.style.transitionDelay = ''
      })
    }
  }, [stagger])

  return ref
}
