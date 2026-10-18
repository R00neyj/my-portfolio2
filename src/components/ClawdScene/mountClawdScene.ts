// Hero 배경의 Claw'd(Claude Code 캐릭터) 3D 장면 — docs/wireframe/hero.html ⑦을 옮긴 것
// 형태: 픽셀 스프라이트 1칸 = 1 단위로 돌출 · 재질: 반투명 젤리 + 림 라이트 (docs/logo_ref)
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

// 몸통 색과 배경색은 토큰에서 읽는다 (DS6). 아래는 3D 재질 전용 보조 색이다.
const ATTENUATION_COLOR = '#b8452a'
const SHEEN_COLOR = '#ffd8c4'
const RIM_LIGHT_COLOR = 0xffd9c7
const GROUND_COLOR = 0x3a1d16
const EYE_COLOR = 0x0b0b0d
const BLUSH_COLOR = 0xff6f6f

const MAX_PIXEL_RATIO = 1.5
const MAX_CANVAS_SIZE = 2560

// 클릭 반응: 웃으면서 통통 튀어오르기
const JUMP_DURATION = 1.25 // 웅크리기 → 점프 → 착지 → 작은 되튐
const SMILE_HOLD = 1.9 // 웃는 얼굴 유지 시간

interface Jump {
  y: number // 높이
  stretch: number // +면 위아래로 늘어남, -면 눌림
  arm: number // 팔 들어 올림
}

const NO_JUMP: Jump = { y: 0, stretch: 0, arm: 0 }

function jumpAt(r: number): Jump {
  if (r < 0 || r > JUMP_DURATION) return NO_JUMP
  if (r < 0.12) {
    // 1) 웅크리기
    const k = Math.sin(((r / 0.12) * Math.PI) / 2)
    return { y: -0.35 * k, stretch: -0.16 * k, arm: -0.2 * k }
  }
  if (r < 0.66) {
    // 2) 점프: 오를 때 늘어나고 내려오며 눌림
    const u = (r - 0.12) / 0.54
    return {
      y: 2.8 * Math.sin(Math.PI * u),
      stretch: 0.14 * Math.cos(Math.PI * u),
      arm: 0.7 * Math.sin(Math.PI * u),
    }
  }
  if (r < 0.84) {
    // 3) 착지: 한 번 더 찌그러졌다 돌아옴
    const v = (r - 0.66) / 0.18
    return { y: 0, stretch: -0.14 * (1 - v) - 0.08 * Math.sin(Math.PI * v), arm: 0 }
  }
  // 4) 작은 되튐
  const w = (r - 0.84) / (JUMP_DURATION - 0.84)
  return {
    y: 0.7 * Math.sin(Math.PI * w),
    stretch: 0.04 * Math.sin(Math.PI * w),
    arm: 0.25 * Math.sin(Math.PI * w),
  }
}

function smileAt(r: number) {
  if (r < 0) return 0
  return (
    Math.min(1, r / 0.12) *
    (1 - THREE.MathUtils.smoothstep(r, SMILE_HOLD, SMILE_HOLD + 0.25))
  )
}

function canvasTexture(size: number, paint: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) paint(ctx, size)
  return new THREE.CanvasTexture(canvas)
}

function readTheme() {
  const style = getComputedStyle(document.documentElement)
  const bg = new THREE.Color(style.getPropertyValue('--color-bg').trim() || '#ffffff')
  const mascot = new THREE.Color(style.getPropertyValue('--color-mascot').trim() || '#d97757')
  const isDark = bg.getHSL({ h: 0, s: 0, l: 0 }).l < 0.5
  return { bg, mascot, isDark }
}

/**
 * canvas에 Claw'd 장면을 그리고, container(Hero 섹션)에서 포인터·클릭을 받는다.
 * 정리 함수를 돌려준다. WebGL을 쓸 수 없으면 아무것도 그리지 않는다 (Hero 텍스트는 그대로 보임).
 */
export function mountClawdScene(canvas: HTMLCanvasElement, container: HTMLElement) {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' })
  } catch {
    return () => {}
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO))
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 32)

  // 유리·젤리 재질에 비칠 주변 환경 (반사 하이라이트용)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
  keyLight.position.set(-6, 10, 8)
  const rimLight = new THREE.DirectionalLight(RIM_LIGHT_COLOR, 3)
  rimLight.position.set(8, 3, -6)
  const hemiLight = new THREE.HemisphereLight(0xffffff, GROUND_COLOR, 0.6)
  scene.add(keyLight, rimLight, hemiLight)

  // ── 텍스처: 프로스트 유리의 미세한 오돌토돌함 / 발광·그림자·홍조용 원형 그라디언트 ──
  const grainTexture = canvasTexture(128, (ctx, size) => {
    const img = ctx.createImageData(size, size)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 110 + Math.random() * 40
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
  })
  grainTexture.wrapS = grainTexture.wrapT = THREE.RepeatWrapping
  grainTexture.repeat.set(3, 3)

  const radialTexture = canvasTexture(256, (ctx, size) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.45, 'rgba(255,255,255,0.35)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  })

  // ── 재질 ──
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    roughness: 0.32,
    transmission: 0.55,
    thickness: 2.5,
    ior: 1.42,
    attenuationColor: new THREE.Color(ATTENUATION_COLOR),
    attenuationDistance: 3,
    clearcoat: 0.7,
    clearcoatRoughness: 0.3,
    sheen: 0.6,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(SHEEN_COLOR),
    bumpMap: grainTexture,
    bumpScale: 0.6,
  })
  const eyeMaterial = new THREE.MeshPhysicalMaterial({
    color: EYE_COLOR,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  })
  const blushMaterial = new THREE.MeshBasicMaterial({
    map: radialTexture,
    color: BLUSH_COLOR,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })
  const glowMaterial = new THREE.MeshBasicMaterial({
    map: radialTexture,
    transparent: true,
    depthWrite: false,
  })
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: radialTexture,
    transparent: true,
    depthWrite: false,
  })

  // ── Claw'd: 몸통 8×5.6, 팔 2×2, 눈 1×1, 다리 0.9×2.4 × 4개 ──
  const anchor = new THREE.Group() // 화면 안 위치·크기
  const crab = new THREE.Group() // 회전·애니메이션
  anchor.add(crab)
  scene.add(anchor)

  const geometries: THREE.BufferGeometry[] = []
  const geometry = <T extends THREE.BufferGeometry>(g: T) => {
    geometries.push(g)
    return g
  }
  const part = (g: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(g, material)
    mesh.position.set(x, y, z)
    crab.add(mesh)
    return mesh
  }

  part(geometry(new RoundedBoxGeometry(8, 5.6, 3.8, 5, 0.55)), bodyMaterial, 0, 1.05, 0)
  const armGeometry = geometry(new RoundedBoxGeometry(2.2, 2, 2.4, 4, 0.45))
  const arms = [-1, 1].map((s) => part(armGeometry, bodyMaterial, s * 4.95, 0.85, 0))
  const legGeometry = geometry(new RoundedBoxGeometry(0.9, 2.4, 1.8, 3, 0.3))
  const legs = [-2.75, -1.25, 1.25, 2.75].map((x) => part(legGeometry, bodyMaterial, x, -2.65, 0))
  const eyeGeometry = geometry(new RoundedBoxGeometry(1, 1, 0.44, 3, 0.12))
  const eyes = [-1, 1].map((s) => part(eyeGeometry, eyeMaterial, s * 2.5, 2.35, 1.95))

  // 웃는 눈(^ ^): 막대 두 개를 기울여 붙인다. 평소에는 크기를 0에 가깝게 숨겨 둔다
  const smileBarGeometry = geometry(new RoundedBoxGeometry(0.75, 0.24, 0.3, 2, 0.1))
  const smileEyes = [-1, 1].map((s) => {
    const group = new THREE.Group()
    for (const side of [-1, 1]) {
      const bar = new THREE.Mesh(smileBarGeometry, eyeMaterial)
      bar.position.x = side * 0.25
      bar.rotation.z = -side * 0.75
      group.add(bar)
    }
    group.position.set(s * 2.5, 2.25, 2.0)
    group.scale.setScalar(0.001)
    crab.add(group)
    return group
  })

  // 볼 홍조: 웃을 때만 나타난다
  const blushGeometry = geometry(new THREE.PlaneGeometry(1.6, 0.9))
  for (const s of [-1, 1]) part(blushGeometry, blushMaterial, s * 2.9, 1.3, 1.93)

  // 뒤쪽 발광, 바닥 그림자 (회전하지 않도록 anchor에 붙인다)
  const glow = new THREE.Mesh(geometry(new THREE.PlaneGeometry(26, 20)), glowMaterial)
  glow.position.z = -6
  const shadow = new THREE.Mesh(geometry(new THREE.PlaneGeometry(12, 1.6)), shadowMaterial)
  shadow.position.set(0, -4.9, 0)
  anchor.add(glow, shadow)

  // ── 상태 ──
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const schemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const timer = new THREE.Timer()
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let needsRender = true
  let isVisible = true
  let frameId = 0
  let reactStart = -Infinity
  const nowSec = () => performance.now() / 1000
  const isReacting = () => nowSec() - reactStart < SMILE_HOLD + 0.4

  const applyTheme = () => {
    const { bg, mascot, isDark } = readTheme()
    scene.background = bg
    bodyMaterial.color.copy(mascot)
    glowMaterial.color.copy(mascot)
    glowMaterial.opacity = isDark ? 0.4 : 0.22
    shadowMaterial.color.set(isDark ? mascot : 0x000000)
    shadowMaterial.opacity = isDark ? 0.35 : 0.16
    rimLight.intensity = isDark ? 4.5 : 3
    renderer.toneMappingExposure = isDark ? 1.05 : 1
    needsRender = true
  }

  // 넓은 화면은 오른쪽 위, 좁은 화면은 제목 위쪽에 놓는다
  const resize = () => {
    const w = Math.min(container.clientWidth, MAX_CANVAS_SIZE)
    const h = Math.min(container.clientHeight, MAX_CANVAS_SIZE)
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()

    const visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
    const visW = visH * camera.aspect
    if (camera.aspect >= 1) {
      anchor.position.set(visW * 0.25, visH * 0.13, 0)
      anchor.scale.setScalar(Math.min((visH * 0.4) / 8, (visW * 0.34) / 12))
    } else {
      anchor.position.set(visW * 0.1, visH * 0.31, 0)
      anchor.scale.setScalar((visW * 0.55) / 12)
    }
    needsRender = true
  }

  const pose = (t: number, still: boolean) => {
    if (!still) {
      pointer.x += (pointer.tx - pointer.x) * 0.05
      pointer.y += (pointer.ty - pointer.y) * 0.05
    }
    const px = still ? 0 : pointer.x
    const py = still ? 0 : pointer.y

    // 동작 줄이기 설정이면 튀어오르지 않고 웃기만 한다 (FR-X3)
    const r = nowSec() - reactStart
    const jump = still ? NO_JUMP : jumpAt(r)
    const smile = smileAt(r)

    crab.rotation.y = -0.42 + Math.sin(t * 0.45) * 0.28 + px * 0.45
    crab.rotation.x = 0.28 + Math.sin(t * 0.33) * 0.05 + py * 0.18
    // 클릭 전에는 r이 Infinity라 sin(r)이 NaN이 되므로 웃는 동안에만 계산한다
    crab.rotation.z = !still && smile > 0 ? Math.sin(r * 9) * 0.06 * smile : 0
    const bob = Math.sin(t * 1.3) * 0.22
    crab.position.y = bob + jump.y
    shadow.scale.setScalar((1 - bob * 0.15) * (1 - jump.y * 0.1))

    // 젤리처럼 살짝 눌렸다 늘어난다
    const squash = Math.sin(t * 2.6) * 0.018 + jump.stretch
    crab.scale.set(1 - squash * 0.6, 1 + squash, 1 - squash * 0.6)

    arms[0].position.y = 0.85 + Math.sin(t * 2) * 0.12 + jump.arm
    arms[1].position.y = 0.85 - Math.sin(t * 2) * 0.12 + jump.arm
    legs.forEach((leg, i) => {
      leg.position.y = -2.65 + Math.max(0, Math.sin(t * 3 + i * 1.7)) * 0.08
    })

    // 4.2초마다 깜빡. 웃는 동안에는 네모 눈 대신 ^ ^ 눈과 홍조를 보여 준다
    const b = t % 4.2
    const closed =
      THREE.MathUtils.smoothstep(b, 0, 0.07) * (1 - THREE.MathUtils.smoothstep(b, 0.1, 0.2))
    for (const eye of eyes) eye.scale.y = Math.max(0.001, (1 - closed * 0.9) * (1 - smile))
    for (const eye of smileEyes) eye.scale.setScalar(Math.max(0.001, smile))
    blushMaterial.opacity = smile * 0.55
  }

  const loop = (timestamp: number) => {
    frameId = requestAnimationFrame(loop)
    timer.update(timestamp)
    const still = motionQuery.matches
    if (still && !needsRender && !isReacting()) return
    pose(still ? 0 : timer.getElapsed(), still)
    renderer.render(scene, camera)
    needsRender = false
    canvas.dataset.ready = 'true'
  }

  // 화면 밖이거나 탭이 숨겨지면 렌더를 멈춘다
  const start = () => {
    cancelAnimationFrame(frameId)
    if (isVisible && !document.hidden) frameId = requestAnimationFrame(loop)
  }

  // ── 상호작용: 캔버스는 클릭을 받지 않으므로 Hero에서 받아 광선으로 판정한다 ──
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const hitsClawd = (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )
    raycaster.setFromCamera(ndc, camera)
    return raycaster.intersectObject(crab, true).length > 0
  }
  const isControl = (event: Event) =>
    event.target instanceof Element && event.target.closest('a, button') !== null

  const handlePointerMove = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect()
    pointer.tx = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
    pointer.ty = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1)
    container.style.cursor = !isControl(event) && hitsClawd(event) ? 'pointer' : ''
  }

  const handleClick = (event: MouseEvent) => {
    if (isControl(event) || !hitsClawd(event)) return
    // 점프 중에 또 누르면 무시하고, 착지한 뒤에는 다시 튀어오른다
    if (nowSec() - reactStart > JUMP_DURATION) reactStart = nowSec()
  }

  const handleVisibility = () => start()
  const handleMotionChange = () => {
    needsRender = true
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting
    start()
  })
  intersectionObserver.observe(container)
  // 다크 모드 토글(data-theme)과 시스템 설정 변경을 모두 따라간다
  const themeObserver = new MutationObserver(applyTheme)
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  container.addEventListener('pointermove', handlePointerMove)
  container.addEventListener('click', handleClick)
  document.addEventListener('visibilitychange', handleVisibility)
  motionQuery.addEventListener('change', handleMotionChange)
  schemeQuery.addEventListener('change', applyTheme)

  applyTheme()
  resize()
  start()

  return () => {
    cancelAnimationFrame(frameId)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    themeObserver.disconnect()
    container.removeEventListener('pointermove', handlePointerMove)
    container.removeEventListener('click', handleClick)
    container.style.cursor = ''
    document.removeEventListener('visibilitychange', handleVisibility)
    motionQuery.removeEventListener('change', handleMotionChange)
    schemeQuery.removeEventListener('change', applyTheme)

    for (const g of geometries) g.dispose()
    for (const m of [bodyMaterial, eyeMaterial, blushMaterial, glowMaterial, shadowMaterial]) m.dispose()
    grainTexture.dispose()
    radialTexture.dispose()
    environment.dispose()
    pmrem.dispose()
    timer.dispose()
    renderer.dispose()
  }
}
