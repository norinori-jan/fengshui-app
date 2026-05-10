import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // iPhoneのカメラ・方位計（Sensor）を動かすための必須プラグイン
  ],
  base: '/fengshui-app/', // GitHub PagesのURLパスに合わせる設定（重要！）
  server: {
    host: true,   // ローカル開発時にスマホからアクセス可能にする
    port: 5173,
    https: true   // ローカル開発時もHTTPSで通信する
  }
})