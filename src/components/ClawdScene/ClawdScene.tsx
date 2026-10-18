import { useEffect, useRef, type RefObject } from 'react'
import { mountClawdScene, type Greet } from './mountClawdScene'
import styles from './ClawdScene.module.css'

interface ClawdSceneProps {
  /** 포인터·클릭을 받을 영역 (Hero 섹션). 캔버스 자체는 클릭을 가로채지 않는다. */
  containerRef: RefObject<HTMLElement | null>
  /** 스크롤 인사 값 (Hero의 GSAP이 움직이고 렌더 루프가 매 프레임 읽는다) */
  greet: Greet
}

/** Hero 배경의 Claw'd 3D 캐릭터 (장식 요소, three.js) */
function ClawdScene({ containerRef, greet }: ClawdSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    return mountClawdScene(canvas, container, greet)
  }, [containerRef, greet])

  return <canvas ref={canvasRef} className={styles.canvas} />
}

export default ClawdScene
