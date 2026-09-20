# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude Code(claude.ai/code)에게 가이드를 제공합니다.

## 프로젝트 상태

`docs/요구사항.md`의 Phase 0~1 구현이 진행 중입니다. 디자인 토큰(§7)과 레이아웃 셸, Hero~Contact 전 섹션, 다크 모드 토글이 구현되어 있습니다. 콘텐츠는 아직 대부분 TODO/플레이스홀더(실명, 실제 프로젝트 링크, 학력 등)이며, 테스트 러너(Vitest, D6)와 GitHub Actions 배포(D5)는 아직 구성되지 않았습니다. 새 코드를 작성할 때는 이미 자리 잡은 CSS Modules + 토큰 컨벤션(아래 아키텍처 참고)을 따르세요.

## 명령어

- `npm run dev` — HMR을 지원하는 Vite 개발 서버 실행
- `npm run build` — `vite build`로 프로덕션 빌드 (타입 체크는 포함되지 않음 — 확인하려면 `tsc -b`를 직접 실행하세요)
- `npm run preview` — 프로덕션 빌드를 로컬에서 서빙
- `npm run deploy` — `predeploy`로 빌드 후 `gh-pages`로 `dist`를 `gh-pages` 브랜치에 배포 (D5 재검토: 원래 GitHub Actions 자동 배포가 원안이었으나 `gh-pages` 수동 배포로 변경)

테스트 러너와 lint 스크립트는 현재 구성되어 있지 않습니다 (`oxlint`는 devDependency로 남아 있으므로 `npx oxlint`로 직접 실행 가능). 타입 오류는 `tsc -b`로 직접 확인하세요.

## 아키텍처

- 진입점: `index.html` → `src/main.tsx`가 `src/App.tsx`의 `<App />`을 `StrictMode` 안에서 `#root`에 마운트합니다. `index.html`의 인라인 스크립트가 렌더 전에 저장된 다크 모드 값을 적용해 FOUC를 막습니다(FR-X2).
- `src/App.tsx`는 skip link + `<Header>` + `<main>`(Hero~Contact) + `<Footer>`로 이뤄진 페이지 셸만 담당하며, 자체 스타일은 없습니다.
- **디자인 토큰**: `src/styles/tokens.css`에 컬러(라이트/다크)·타이포·간격·radius·shadow 커스텀 프로퍼티를 전역 정의합니다(§7 DS2~DS4, DS9). `src/styles/shared.module.css`는 섹션 공통 컨테이너/헤딩 클래스를 제공합니다. `src/index.css`는 리셋, 포커스 링, skip-link, `prefers-reduced-motion` 처리를 담당합니다. 컴포넌트 CSS에서 색상·radius·shadow 값을 하드코딩하지 말고 토큰만 참조하세요(DS6).
- **컴포넌트**: `src/components/<Name>/<Name>.tsx` + `<Name>.module.css` 쌍으로 구성합니다(NFR-M4). 현재 Header, ThemeToggle, Hero, About, Skills, Projects, Education, Contact, Footer가 있습니다.
- **콘텐츠 데이터**: `src/data/{types,skills,projects,education,links}.ts`에 있습니다(§6). 프로젝트/스킬/학력/링크를 추가·수정할 때는 해당 컴포넌트가 아니라 이 데이터 파일을 고칩니다(S4).
- **훅**: `src/hooks/useTheme.ts`(다크 모드 토글 + localStorage), `src/hooks/useActiveSection.ts`(스크롤 스파이 내비게이션 하이라이트, §3.3).
- 아이콘은 `lucide-react`를 사용합니다(DS10). 주의: 이 패키지에는 브랜드 로고 아이콘(GitHub 등)이 없으므로 외부 링크에는 `ExternalLink`처럼 의미가 맞는 일반 아이콘을 씁니다.
- 그대로 서빙되는 정적 자산은 `public/`에 있습니다 (예: `/favicon.svg`처럼 절대 경로로 참조). 컴포넌트에서 import되어 Vite가 처리/해싱하는 자산은 `src/assets/`에 있습니다.
- TypeScript 프로젝트는 참조(references)로 분리되어 있습니다: `tsconfig.app.json`은 `src/`를 담당(bundler 방식 모듈 해석, `noEmit`, React JSX), `tsconfig.node.json`은 `vite.config.ts`를 담당(Node 환경). `tsconfig.json`은 이 둘을 가리키는 루트 파일입니다.
- 린팅은 ESLint가 아닌 oxlint(`.oxlintrc.json`)를 사용하며, 활성화된 플러그인은 `react`, `typescript`, `oxc`입니다.
