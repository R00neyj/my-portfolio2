import { useEffect, useRef, type RefObject } from 'react'
import { mountClawdScene } from './mountClawdScene'
import styles from './ClawdScene.module.css'

interface ClawdSceneProps {
  /** 포인터·클릭을 받을 영역 (Hero 섹션). 캔버스 자체는 클릭을 가로채지 않는다. */
  containerRef: RefObject<HTMLElement | null>
}

/** Hero 배경의 Claw'd 3D 캐릭터 (장식 요소, three.js) */
function ClawdScene({ containerRef }: ClawdSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    return mountClawdScene(canvas, container)
  }, [containerRef])

  return <canvas ref={canvasRef} className={styles.canvas} />
}

export default ClawdScene
