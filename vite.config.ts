import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// TODO(NFR-D1): 최종적으로는 저장소를 R00neyj.github.io로 이름 변경해 루트 경로로
// 배포할 예정이라 base 설정이 필요 없어진다. 이름 변경 전, my-portfolio2 저장소로
// 미리보기하는 동안만 임시로 base를 지정한다 — 변경 완료 후 이 줄을 지울 것.
export default defineConfig({
  base: '/my-portfolio2/',
  plugins: [react()],
})
