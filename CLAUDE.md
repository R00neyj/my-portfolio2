# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude Code(claude.ai/code)에게 가이드를 제공합니다.

## 프로젝트 상태

이 프로젝트는 막 스캐폴딩된 Vite + React + TypeScript 프로젝트입니다 (`npm create vite`의 기본 React-TS 템플릿을 거의 그대로 사용). 테스트 설정, 라우터, React 외의 추가 라이브러리가 전혀 없으며 `src/App.tsx`는 아직 플레이스홀더 시작 페이지 그대로입니다. 이미 정해진 컨벤션이 있는 기존 코드베이스가 아니라, 실제 포트폴리오 사이트를 위한 빈 캔버스로 취급하세요.

## 명령어

- `npm run dev` — HMR을 지원하는 Vite 개발 서버 실행
- `npm run build` — `tsc -b`로 타입 체크(`tsconfig.app.json` / `tsconfig.node.json` 프로젝트 참조 전체) 후 `vite build`로 프로덕션 빌드
- `npm run lint` — oxlint 실행
- `npm run preview` — 프로덕션 빌드를 로컬에서 서빙

테스트 러너는 구성되어 있지 않습니다. 타입 오류는 `npm run build`로 확인할 수 있습니다 (번들링 없이 더 빠르게 확인하려면 `tsc -b`를 직접 실행하세요).

## 아키텍처

- 진입점: `index.html` → `src/main.tsx`가 `src/App.tsx`의 `<App />`을 `StrictMode` 안에서 `#root`에 마운트합니다.
- `src/App.tsx` + `src/App.css`가 유일한 최상위 페이지이며, `src/index.css`에 전역 스타일이 있습니다.
- 그대로 서빙되는 정적 자산은 `public/`에 있습니다 (예: `/icons.svg`, `/favicon.svg`처럼 절대 경로로 참조). 컴포넌트에서 import되어 Vite가 처리/해싱하는 자산은 `src/assets/`에 있습니다.
- TypeScript 프로젝트는 참조(references)로 분리되어 있습니다: `tsconfig.app.json`은 `src/`를 담당(bundler 방식 모듈 해석, `noEmit`, React JSX), `tsconfig.node.json`은 `vite.config.ts`를 담당(Node 환경). `tsconfig.json`은 이 둘을 가리키는 루트 파일입니다.
- 린팅은 ESLint가 아닌 oxlint(`.oxlintrc.json`)를 사용하며, 활성화된 플러그인은 `react`, `typescript`, `oxc`입니다.
