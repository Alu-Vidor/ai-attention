import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repository = process.env.GITHUB_REPOSITORY
const repoName = repository?.split('/')?.[1] ?? 'ai-attention'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : `/${repoName}/`,
  plugins: [react()],
}))
