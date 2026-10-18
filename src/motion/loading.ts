/**
 * 로딩 화면이 걷혔는지 알려 준다.
 * <html data-loading>은 index.html이 붙이고 Loader가(또는 8초 안전장치가) 뗀다.
 * 모션 줄이기 환경에서는 처음부터 붙지 않으므로 바로 '끝남'이다.
 */
export function isLoading() {
  return document.documentElement.hasAttribute('data-loading')
}

/**
 * 로딩이 끝나면 callback을 한 번 부른다. 이미 끝났으면 바로 부른다.
 * 돌려준 함수를 부르면 기다리기를 취소한다 (useEffect 정리용).
 */
export function whenLoaderDone(callback: () => void): () => void {
  if (!isLoading()) {
    callback()
    return () => {}
  }
  const observer = new MutationObserver(() => {
    if (isLoading()) return
    observer.disconnect()
    callback()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-loading'],
  })
  return () => observer.disconnect()
}
