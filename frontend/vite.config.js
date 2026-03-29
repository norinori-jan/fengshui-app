import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // これで iPhone のカメラ・方位計が動くようになります
  ],
  server: {
    host: true, // --host を手動で打たなくてよくなります
    port: 5173,
    https: true // 明示的にHTTPSを有効化
  }
})