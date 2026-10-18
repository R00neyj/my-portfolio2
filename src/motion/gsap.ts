import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

// 플러그인 등록은 여기서 한 번만 한다. 컴포넌트는 'gsap' 대신 이 파일에서 가져다 쓴다 (docs/MOTION.md §0)
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP)
// 데이터에 따라 빈 목록이 올 수 있다 (예: 단어 하나뿐인 Skills 그룹엔 구분자가 없음) — 정상이므로 경고하지 않는다
gsap.config({ nullTargetWarn: false })

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP }
