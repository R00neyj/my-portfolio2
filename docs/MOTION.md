# MOTION.md — GSAP 인터랙티브 리디자인 타임라인

> 상태: **v0.2 — 열린 질문 모두 결정** · 작성: 2026-10-18 · 근거: [`DESIGN.md`](./DESIGN.md) §8~9, 현재 `src/components/*`
>
> 모션에 관해서는 **이 문서가 DESIGN.md §8.5·§9보다 우선**합니다 (Q-M2).
>
> 섹션별 애니메이션을 **GSAP 타임라인 단위**로 적은 설계 문서입니다. 아직 코드는 바꾸지 않았습니다.
> 시간은 초(s), 위치(position)는 GSAP 표기(`<` = 앞 동작과 동시에 시작, `-=0.2` = 앞 동작이 끝나기 0.2초 전에 시작)를 씁니다.

---

## 0. 쓰는 플러그인과 용량

**JS 용량 예산(NFR-PF3, 100KB)은 이번 리디자인에서 따지지 않는다** (Q-M1). 아래 숫자는 기록용이다.

2026-10-18 `vite build` 실측: 초기 JS **106.2KB** (gzip). Loader가 `gsap` 본체를 이미 첫 화면에 넣고 있다.

| 플러그인 | 용량 (gzip) | 쓰는 곳 |
|---|---|---|
| `gsap` 본체 | 27.8KB | 이미 들어가 있음 (Loader) |
| `ScrollTrigger` | 17.6KB | 스크롤에 맞춘 모든 등장·scrub·Hero 고정(pin) |
| `SplitText` | 3.6KB | Hero 제목 글자, Projects·Contact 문장 단어 쪼개기 |
| `Flip` | 9.5KB | Projects 필터 전환 (Q-M3) |

- 예산은 따지지 않지만, **Lighthouse 성능 점수와 첫 화면 속도(LCP)는 계속 본다.** 그래서 플러그인은 지연 로드 없이 그냥 import하되, 3D(three.js)는 지금처럼 따로 불러온다.

---

## 1. 공통 규칙

### 1.1 곡선 · 시간 (DESIGN.md §9 토큰 → GSAP 이름)

| CSS 토큰 | GSAP 곡선 | 용도 |
|---|---|---|
| `--ease-out-expo` | `expo.out` | 커서, 헤더, 밑줄 |
| `--ease-out-soft` | `power3.out` | 등장, 이미지 |
| `--ease-bounce` | `back.out(2.2)` | 통통 튀는 호버·클릭 |
| (새로) | `expo.inOut` | 화면을 덮고 걷는 큰 전환 (Loader 기둥과 같음) |
| (새로) | `none` | scrub(스크롤에 붙는 동작) — 곡선은 스크롤이 만든다 |

GSAP 쪽 숫자도 토큰처럼 한곳(`src/motion/tokens.ts` 예정)에 모아 두고 컴포넌트는 이름만 쓴다 (DS6과 같은 원칙).

### 1.2 두 종류의 모션

| 종류 | 언제 | 예 |
|---|---|---|
| **재생형** (`toggleActions: 'play none none none'`) | 화면에 들어오면 **한 번** 재생 | 제목 드러남, 카드 등장 |
| **scrub형** (`scrub: 0.6`) | 스크롤 위치에 **붙어서** 앞뒤로 움직임 | About 단어 칠하기, Footer 큰 글자 |

### 1.3 반드시 지킬 것

- **모션 줄이기**(`prefers-reduced-motion: reduce`)면 `gsap.matchMedia()`로 **아무 타임라인도 만들지 않는다**. 모든 요소는 처음부터 보인다.
- 숨김 상태는 **JS가 타임라인을 만들 때** `gsap.set` / `from`으로만 만든다. JS가 실패하면 그대로 다 보인다 (지금 `useReveal`과 같은 원칙).
- React에서는 `useGSAP()`(`@gsap/react`, 1KB 미만) 또는 지금 Loader처럼 `gsap.context()` + `revert()`로 정리한다. StrictMode에서 두 번 실행돼도 안전해야 한다.
- `transform`·`opacity`·`clip-path`만 움직인다. `width`·`top` 같은 레이아웃 속성은 움직이지 않는다 (INP·CLS).
- Lenis(DESIGN §8.2)를 쓰면 `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`로 한 박자에 묶는다.
- 기존 `useReveal`(CSS 전환)과 **같은 요소에 GSAP을 겹쳐 걸지 않는다**. 섹션 하나를 GSAP으로 옮기면 그 섹션의 `data-reveal`은 뺀다.

---

## 2. Loader → Hero (첫 화면, 시간 기반)

Loader 타임라인은 이미 구현돼 있다(`Loader.tsx`). 끝부분 `finishLoading()`이 불리는 순간을 **Hero 타임라인의 0초**로 삼는다.
지금은 CSS `@keyframes reveal`이 이 역할을 하는데, 이를 GSAP 타임라인 하나로 바꾼다.

### 2.1 Hero 등장 `heroIntro` (총 약 1.9s)

| 시점 | 대상 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 0.00 | `.title` 글자 (`2027`, `PORTFOLIO`) — SplitText `chars` + `mask` | `yPercent: 110 → 0`, 글자마다 0.035s 간격 | 0.9 | `expo.out` |
| 0.05 | `.label` (이름 · 직무) | 왼쪽에서 `clip-path: inset(0 100% 0 0) → inset(0)` | 0.6 | `power3.out` |
| 0.45 | `.tagline` 구절 2개 | `y: 28 → 0`, `autoAlpha 0 → 1`, 구절마다 0.12s | 0.8 | `power3.out` |
| 0.70 | `.background` (Claw'd 3D) | `autoAlpha 0 → 1`, `scale 0.92 → 1` | 1.2 | `power3.out` |
| 1.10 | `.scrollCue` | `y: 12 → 0`, 나타남 → 끝나면 CSS `cue` 반복 시작 | 0.5 | `back.out(2.2)` |
| 1.20 | Header (§3) | 위에서 내려옴 | 0.6 | `expo.out` |

- Loader 기둥이 걷히기 0.6초 전(지금 코드의 `-=0.6`)에 시작하므로 기둥 사이로 글자가 올라오는 것처럼 이어진다.
- 3D 장면은 `requestIdleCallback`으로 늦게 뜰 수 있다. 장면이 늦으면 0.70 동작을 **장면이 붙는 순간**으로 미룬다(장면 쪽에서 `onReady` 콜백).

### 2.2 Hero 고정 + Claw'd 인사 `heroGreet` (pin + scrub) — Q-M4

Hero를 화면에 **잠깐 붙잡아 두고**, 그동안 Claw'd가 방문자를 돌아보며 손을 흔들어 인사한다. 고정이 답답하지 않으려면 **스크롤하는 보람(인사)이 있어야 한다**는 것이 이 연출의 조건이다.

**설정:** `trigger: #hero`, `pin: true`, `start: 'top top'`, `end: '+=120%'` (모바일 `+=80%`), `scrub: 0.6`, `anticipatePin: 1`

진행률(0 → 1)에 따른 흐름:

| 진행 | 대상 | 동작 | 비고 |
|---|---|---|---|
| 0.00 → 0.15 | `.scrollCue` | `autoAlpha 1 → 0` | 스크롤을 시작했으니 안내는 퇴장 |
| 0.00 → 0.20 | Claw'd 몸 (`turn`) | 비스듬히 선 자세(`rotation.y -0.42`) → **정면**(`0`)으로 돌아봄, 마우스 따라보기는 잠시 약하게 | 3D |
| 0.10 → 0.25 | `.title`·`.label`·`.tagline` | `autoAlpha 1 → 0.25`, `y: 0 → -20` | 주인공을 Claw'd에게 넘긴다 |
| 0.15 → 0.30 | Claw'd 얼굴 (`smile`) | 네모 눈 → **^ ^ 웃는 눈**, 볼 홍조 켜짐 | 기존 클릭 반응의 웃는 얼굴 재사용 |
| 0.20 → 0.35 | Claw'd 오른팔 (`raise`) | 어깨에서 위로 들어 올림 (`rotation.z 0 → 2.2rad`, `y +1.2`) | 3D |
| 0.30 → 0.70 | Claw'd 오른팔 (`wave`) | **손 흔들기** — 들어 올린 팔이 좌우로 흔들림 | 아래 "흔들기 규칙" |
| 0.32 → 0.45 | 말풍선 `.greeting` (DOM) | `scale 0.6 → 1`, `autoAlpha`, 꼬리가 Claw'd 쪽 | `back.out(2.2)` 느낌을 scrub 구간 안에서 |
| 0.40 → 0.60 | 말풍선 글자 | `안녕하세요!` → `반가워요 👋` 글자 바뀜 (SplitText `chars`, `yPercent`) | 문구는 `data/profile.ts`에 둔다 |
| 0.70 → 0.85 | 말풍선 | `scale 1 → 0.8`, `autoAlpha → 0` | |
| 0.70 → 0.85 | 오른팔 | 내려놓기 (`raise 1 → 0`) | |
| 0.80 → 1.00 | Claw'd 전체 | 작게 한 번 점프 후 `yPercent: 0 → 15`, `autoAlpha 1 → 0.2` (아래로 물러남) | 기존 `jumpAt()` 재사용 |
| 0.80 → 1.00 | `.title` | 다시 `autoAlpha → 1`, `yPercent: 0 → -30` (위로 빠짐) | 고정이 풀리며 About으로 이어짐 |

**흔들기 규칙 — 스크롤과 시간을 섞는다:**
- 스크롤이 정하는 것은 **얼마나 인사하고 있는지(세기 0~1)**뿐이다. 실제 팔 흔들림은 three.js 렌더 루프가 **시간으로** 만든다: `arm.rotation.z = raise + Math.sin(t * 9) * 0.35 * wave`.
- 그래서 스크롤을 멈추면 팔이 **중간에 얼지 않고 계속 흔들린다**. 스크롤만 정하면 손을 든 채 굳어 버려 어색하다.

**3D 쪽에서 바꿀 것 (`mountClawdScene.ts`):**
1. 팔이 지금은 상자의 가운데를 축으로 돌아서 흔들면 어색하다. 팔을 **어깨 위치에 둔 빈 `Group`(관절)** 안에 넣어, 관절이 돌게 한다.
2. 마운트 함수가 정리 함수만 돌려주는 대신 `{ dispose, greet }`를 돌려준다. `greet`는 GSAP이 움직일 수 있는 평범한 객체 `{ turn, smile, raise, wave }`(모두 0~1)이고, `pose()`가 매 프레임 이 값을 읽어 섞는다.
3. 클릭 점프·웃음과 인사가 겹치면 **더 큰 값**을 쓴다 (`Math.max(smile, greet.smile)`).

**3D가 아직 안 떴을 때:** 장면은 늦게 불러오므로, 고정 구간에 들어왔는데 장면이 없으면 말풍선과 글자 동작만 재생된다. 장면이 뜨는 순간 현재 진행률의 `greet` 값을 바로 적용해 어긋나지 않게 한다.

**접근성:**
- 말풍선은 장식이므로 `aria-hidden="true"`. 인사 문구는 정보가 아니다.
- 메뉴·`Scroll` 링크·건너뛰기 링크로 `#about`에 가면 고정 구간을 **건너뛰어** 바로 About이 위에 오도록, 이동 위치를 ScrollTrigger의 `end` 뒤로 잡는다.
- 모션 줄이기에서는 고정하지 않는다. Claw'd는 처음부터 웃는 얼굴로 손 하나를 든 **정지 자세**로 보여 준다.

---

## 3. Header (전역)

| 이름 | 트리거 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 등장 | `heroIntro` 1.20s | `yPercent: -100 → 0`, 칸(`.cell`)마다 0.05s | 0.6 | `expo.out` |
| 숨김 / 다시 보임 | 스크롤 방향 (`ScrollTrigger.create({ onUpdate: self => self.direction })`) | 아래로 → `yPercent: -100`, 위로 → `0` | 0.52 (마커빌) | `expo.out` |
| 현재 섹션 라벨 `.now` | `activeId` 바뀔 때 | 옛 글자 `yPercent 0 → -100`, 새 글자 `100 → 0` | 0.4 | `power3.out` |
| 모바일 패널 | Menu 클릭 | 패널 `clip-path: inset(0 0 100% 0) → inset(0)` 후 링크 `y: 24 → 0` 0.05s 간격 | 0.5 + 0.3 | `expo.inOut` / `power3.out` |

- 메뉴 포커스가 패널 안에 있을 때나 Hero 안에 있을 때는 숨기지 않는다.

---

## 4. About (01) — 큰 문장 scrub

지금은 `IntersectionObserver`로 단어를 켜고 끈다(딱딱 끊김). 이를 **스크롤에 붙은 연속 채색**으로 바꾼다.

### 4.1 섹션 머리 `aboutHead` (재생형, `start: 'top 80%'`)

| 시점 | 대상 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 0.00 | `(01) About` 라벨 | `clip-path` 왼→오 | 0.5 | `power3.out` |
| 0.10 | `h2 소개` | `clip-path: inset(100% 0 0 0) → inset(0)` | 0.62 | `power3.out` |

### 4.2 문장 채색 `aboutPaint` (scrub)

- `start: 'top 75%'`, `end: 'bottom 45%'`, `scrub: 0.4`
- 단어 15개(`.word`)를 차례로 `color: var(--color-text-muted) → var(--color-text)`, 각 단어 길이 1, 간격 1 (`stagger: 1`) → 스크롤 진행률이 단어 순서에 1:1로 대응.
- `accent` 단어 2개(완성한, 프로젝트로)는 색이 칠해지는 순간 `scale 1 → 1.04 → 1` 작은 튕김 추가(`back.out(2.2)`, 0.3). scrub 안에서 처리.
- 색은 토큰 문자열 대신 **CSS 변수 `--paint`(0~1)**를 움직이고 CSS가 `color-mix()`로 섞는다 → 다크/라이트 전환 중에도 안전.

### 4.3 아래 두 문단 `aboutNotes` (재생형, `start: 'top 85%'`)

| 시점 | 대상 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 0.00 | `.note` 2개의 위쪽 1px 선 | `scaleX 0 → 1` (왼쪽 기준) | 0.8 | `expo.out` |
| 0.15 | `.note` 라벨 + 본문 | `y: 28 → 0`, `autoAlpha`, 0.1s 간격 | 0.8 | `power3.out` |

---

## 5. Skills (02) — 단어 줄 흐르기

### 5.1 `skillsReveal` (재생형, `start: 'top 75%'`)

| 시점 | 대상 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 0.00 | 섹션 머리 | §4.1과 같은 패턴 | 0.62 | `power3.out` |
| 0.20 | 그룹(`.group`) 사이 가로 1px 선 | `scaleX 0 → 1`, 그룹마다 0.1s | 0.8 | `expo.out` |
| 0.30 | 그룹 라벨 `01 — Frontend · 6` | `autoAlpha`, 숫자 `· 0 → 6` 카운트업 | 0.6 | `power2.out` |
| 0.35 | 각 그룹의 단어(`.word`) | `yPercent: 100 → 0` (줄 안에서 마스크로 올라옴), 단어마다 0.04s, 그룹마다 0.1s 늦게 | 0.6 | `power3.out` |
| 0.50 | 구분자 `/` | `rotate: -90 → 0`, `autoAlpha` | 0.4 | `back.out(2.2)` |

### 5.2 인터랙션 (보너스, 마우스 기기만)

- 단어 호버: 지금 CSS `translateY(-4px)` 유지. 추가로 **같은 그룹의 다른 단어는 `opacity 0.4`**로 물러나 하나만 도드라지게 (0.2s, `power2.out`).

---

## 6. Projects (03) — 계단 카드

### 6.1 섹션 머리 + 필터 `projectsHead` (재생형, `start: 'top 80%'`)

| 시점 | 대상 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 0.00 | `(03) Projects` 라벨 | `clip-path` 왼→오 | 0.5 | `power3.out` |
| 0.08 | `h2 만든 것으로 말합니다` — SplitText `words` + `mask` | `yPercent: 110 → 0`, 단어마다 0.06s | 0.8 | `expo.out` |
| 0.40 | 필터 칩 | `y: 16 → 0`, `autoAlpha`, 칩마다 0.05s | 0.5 | `back.out(2.2)` |
| 0.55 | 상태 문구 `전체 · 6개 작업물` | `autoAlpha` | 0.3 | `power2.out` |

### 6.2 카드 등장 `projectCards` (재생형, **줄(행) 단위** 트리거)

`ScrollTrigger.batch(카드들, { start: 'top 85%', onEnter })` — 화면에 같이 들어온 카드끼리 묶어서 재생. 6장이 한꺼번에 뜨지 않는다.

카드 한 장 안의 순서:

| 시점 | 대상 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 0.00 | 카드 테두리 박스 | `clip-path: inset(100% 0 0 0) → inset(0)` (DESIGN §8.5) | 0.62 | `power3.out` |
| 0.10 | 썸네일 이미지 | `scale 1.25 → 1` (드러나는 동안 줌 아웃) | 1.0 | `power3.out` |
| 0.30 | 메타(분류 · 기간) | `autoAlpha` | 0.3 | `power2.out` |
| 0.35 | 제목 · 한 줄 소개 · 스택 | `y: 20 → 0`, `autoAlpha`, 0.06s 간격 | 0.6 | `power3.out` |

- 같은 batch 안 카드끼리는 **0.1s 간격**(`--stagger`) — 계단 왼쪽부터.

### 6.3 계단 패럴랙스 `projectStairs` (scrub, 데스크톱 3열일 때만)

- `start: 'top bottom'`, `end: 'bottom top'`, `scrub: 0.8`
- 계단 1·2·3번째 열이 서로 **다른 속도**로 움직임: `y: 0 → -40 / 0 → -80 / 0 → -120`(px). 계단이 스크롤 중 살짝 더 벌어졌다 모이는 느낌.
- `gsap.matchMedia('(min-width: 1024px)')` 안에서만. 2열·1열 배치에선 끔.

### 6.4 필터 · 더보기 전환

| 동작 | 지금 | 제안 |
|---|---|---|
| 필터 바꾸기 | `key`로 다시 마운트 → 처음부터 등장 | **Flip 전환** (아래 표). `key` 다시 마운트를 없애고 같은 목록에서 카드를 넣고 뺀다 |
| 더보기 | 새 카드 등장 + 포커스 이동 | 새로 붙은 카드만 §6.2 재생. 포커스 이동은 지금 코드 유지 |
| 자세히 보기 펼침 | `<details>` 즉시 열림 | 높이 `0 → auto` 0.4s `power3.out`(GSAP은 `height: 'auto'`를 계산해 줌), 닫을 땐 애니메이션 끝난 뒤 `open` 제거 |

**필터 Flip 타임라인 `projectFilter`** (총 약 0.75s) — Q-M3

| 시점 | 대상 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 직전 | 모든 카드 | `Flip.getState(카드들)`로 지금 위치 기억 → React가 목록을 바꿈 | — | — |
| 0.00 | **빠지는 카드** (`onLeave`) | `scale 1 → 0.9`, `autoAlpha → 0` | 0.25 | `power2.in` |
| 0.10 | **남는 카드** | 옛 자리 → 새 자리로 미끄러짐 (계단 높이 차이도 함께 이동) | 0.6 | `expo.inOut` |
| 0.10 | 남는 카드 | 이동하는 동안 `rotate: ±1.5deg → 0` (짝수 카드는 반대 방향) | 0.6 | `back.out(2.2)` |
| 0.25 | **새로 들어오는 카드** (`onEnter`) | `clip-path: inset(100% 0 0 0) → inset(0)`, 0.06s 간격 | 0.5 | `power3.out` |
| 0.25 | 상태 문구 `전체 · 6개 작업물` | 숫자만 `yPercent 100 → 0` 바뀜 | 0.3 | `power3.out` |

- 설정: `Flip.from(state, { absolute: true, nested: true, targets: 카드들 })`. `absolute`가 있어야 빠지는 카드가 자리를 차지하지 않는다.
- 전환 중에 칩을 또 누르면 진행 중인 Flip을 `progress(1)`로 끝내고 새 전환을 시작한다.
- 계단 배치(`nth-child`)는 목록이 바뀐 **뒤의** 순서로 다시 계산되므로, Flip이 그 위치 차이를 자연스럽게 메워 준다.
- 더보기로 붙는 카드도 같은 `onEnter` 동작을 쓴다.

### 6.5 호버 (DESIGN §8.3 그대로, CSS 유지)

카드 `rotate(-1.5deg)` 0.25s `--ease-bounce`, 썸네일 `scale(1.05)` 0.8s. GSAP으로 옮기지 않는다(CSS가 더 가볍다).

---

## 7. Education (04) — 연도 카운트와 선

### 7.1 `eduReveal` (항목마다 재생형, `start: 'top 80%'`)

| 시점 | 대상 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 0.00 | 섹션 머리 (처음 한 번) | §6.1 머리와 같은 패턴 | 0.8 | `expo.out` |
| 0.00 | 카드 왼쪽(또는 위) 1px 선 | `scaleY`(또는 `scaleX`) `0 → 1` | 0.8 | `expo.out` |
| 0.10 | 큰 연도 `.year` | 숫자 카운트업 `(연도-10) → 연도` + `yPercent 40 → 0` | 0.9 | `power3.out` |
| 0.25 | 기간 · `진행 중` 배지 | `autoAlpha`. 배지는 끝나고 `scale 1 → 1.12 → 1` 한 번 | 0.3 + 0.3 | `back.out(2.2)` |
| 0.30 | 제목 · 기관 | `y: 20 → 0`, `autoAlpha`, 0.06s | 0.6 | `power3.out` |
| 0.45 | 하이라이트 목록 `li` | `x: -12 → 0`, `autoAlpha`, 0.05s | 0.5 | `power3.out` |

- 홀/짝 항목이 좌우로 엇갈려 있으므로(`.item:nth-child(2n)`) 짝수 항목은 `x`를 반대(+12)로.

---

## 8. Contact (05) — 큰 문장과 메일

### 8.1 `contactReveal` (재생형, `start: 'top 70%'`)

| 시점 | 대상 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 0.00 | `(05) Contact` 라벨 | `clip-path` 왼→오 | 0.5 | `power3.out` |
| 0.10 | 큰 문장 h2 — SplitText `words` + `mask` (한글은 **단어 단위**로만 쪼갠다) | `yPercent: 110 → 0`, 단어마다 0.07s | 0.9 | `expo.out` |
| 0.70 | `함께` (`.dim`) | 흐린 색 → 포인트 오렌지, `scale 1 → 1.06 → 1` | 0.5 | `back.out(2.2)` |
| 0.80 | 메일 주소 링크 | 밑줄 `scaleX 0 → 1` 왼→오, 글자는 `y: 24 → 0` | 0.7 | `expo.out` |
| 0.95 | `↗` 화살표 | `x: -8, y: 8 → 0`, `autoAlpha` | 0.4 | `back.out(2.2)` |
| 1.05 | 링크 줄 · 주소 복사 버튼 | `y: 12 → 0`, `autoAlpha`, 0.06s | 0.5 | `power3.out` |

### 8.2 인터랙션

- **메일 링크 자석 효과** (마우스 기기만): 커서가 링크 근처 120px 안에 오면 링크가 커서 쪽으로 최대 10px 끌려감. `gsap.quickTo(x/y, 0.4, 'power3.out')`. 벗어나면 `elastic.out(1, 0.4)`로 제자리.
- **주소 복사 성공**: 버튼 글자 `yPercent 0 → -100` 빠지고 `복사했습니다 ✓`가 `100 → 0` 올라옴(0.35s). 1.6초 뒤 반대로. `aria-live` 문구는 지금 그대로 둔다.

---

## 9. Footer — 큰 PORTFOLIO

### 9.1 `footerBig` (scrub)

- `.big` 글자를 SplitText `chars`로 쪼갠다 (`aria-hidden`이므로 접근성 영향 없음).
- `start: 'top bottom'`, `end: 'bottom bottom'`, `scrub: 0.6`
- 글자마다 `yPercent: 100 → 0`, 가운데 글자부터 바깥으로(`stagger: { each: 0.05, from: 'center' }`) — 페이지 끝에 닿으면 글자가 바닥에서 솟아 완성됨.

### 9.2 `footerBar` (재생형, `start: 'top 95%'`)

| 시점 | 대상 | 동작 | 길이 | 곡선 |
|---|---|---|---|---|
| 0.00 | 위쪽 1px 선 | `scaleX 0 → 1` | 0.8 | `expo.out` |
| 0.20 | `© 연도` · 소스 링크 · 맨 위로 | `autoAlpha`, 0.06s | 0.4 | `power2.out` |

- `맨 위로` 클릭: Lenis `scrollTo(0, { duration: 1.4, easing: expo.inOut })`. 위로 올라가는 동안 Hero `heroGreet`이 거꾸로 재생되어, Claw'd가 다시 손을 흔든 뒤 원래 자세로 돌아간다.

---

## 10. 한 장으로 보기 — 스크롤 진행에 따른 흐름

```
[시간]  Loader 0~3s ──► Hero 등장 1.9s ──► Header 내려옴
[스크롤] Hero 고정(Claw'd 돌아봄 → 손 흔듦 → 말풍선 → 점프하고 물러남) ─► About ─(단어 칠하기 scrub)─► Skills(단어 흐름)
        ─► Projects(머리 → 카드 batch → 계단 패럴랙스 scrub) ─► Education(연도 카운트)
        ─► Contact(문장 단어 → 함께 → 메일) ─► Footer(PORTFOLIO 솟음 scrub)
[전역]  Header 숨김/보임 · 커서 · Lenis
```

| 섹션 | 재생형 | scrub형 | 새 플러그인 |
|---|---|---|---|
| Hero | 등장 1.9s | 고정 + Claw'd 인사 | ScrollTrigger, SplitText |
| Header | 등장 · 숨김 · 라벨 | — | ScrollTrigger |
| About | 머리 · 문단 | 단어 칠하기 | ScrollTrigger |
| Skills | 전체 | — | ScrollTrigger |
| Projects | 머리 · 카드 · 필터(Flip) · 펼침 | 계단 패럴랙스 | ScrollTrigger, SplitText, Flip |
| Education | 항목별 | — | ScrollTrigger |
| Contact | 전체 + 자석 · 복사 | — | ScrollTrigger, SplitText |
| Footer | 하단 바 | PORTFOLIO | ScrollTrigger, SplitText |

---

## 11. 구현 순서 제안

1. **기반**: `src/motion/` (토큰, 플러그인 등록, `matchMedia` 래퍼) + Lenis 연동
2. **Hero + Header**: CSS `@keyframes reveal` → `heroIntro`로 교체, Loader와 이음새 확인
3. **Claw'd 인사**: 팔 관절 Group + `greet` 값 노출(`mountClawdScene.ts`) → Hero 고정 `heroGreet`
4. **About**: IntersectionObserver 채색 → scrub로 교체
5. **Projects**: 카드 batch · Flip 필터 전환 · 펼침 (가장 복잡, 포커스 이동 회귀 테스트 필수)
6. **Skills · Education · Contact · Footer**: 패턴 재사용
7. **점검**: 모션 줄이기 · 키보드만 · 모바일 · 메뉴로 `#about` 이동 시 고정 구간 건너뛰기 · Lighthouse

---

## 12. 결정 기록

| ID | 질문 | 결정 |
|---|---|---|
| Q-M1 | 초기 JS 예산(100KB)을 이미 넘었다. 어떻게 할까? | **예산은 따지지 않는다.** 플러그인은 그냥 import (§0) |
| Q-M2 | DESIGN §8.5의 "CSS + IntersectionObserver" 등장 모션을 GSAP으로 바꿀까? | **바꾼다.** 섹션을 GSAP으로 옮길 때 그 섹션의 `data-reveal`·`useReveal`은 뺀다 |
| Q-M3 | Projects 필터 전환에 Flip을 쓸까? | **쓴다.** §6.4 `projectFilter` |
| Q-M4 | Hero를 핀(pin)으로 고정할까? | **고정한다. 단, 고정하는 동안 Claw'd가 인사하는 연출이 있어야 한다.** §2.2 `heroGreet` |

---

## 변경 기록

| 날짜 | 버전 | 내용 |
|---|---|---|
| 2026-10-18 | v0.1 | 초안 작성. 섹션별 타임라인, 번들 실측(초기 JS 106.2KB) 반영 |
| 2026-10-18 | v0.2 | Q-M1~M4 결정. 예산 제약 제거, Flip 필터 전환(§6.4) 추가, Hero 떠나기를 고정 + Claw'd 인사(§2.2)로 교체 |
