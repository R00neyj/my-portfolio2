import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// NFR-D1: 저장소를 R00neyj.github.io로 배포(루트 경로)하기로 해 base 설정이 필요 없다.
export default defineConfig({
  plugins: [react()],
})
