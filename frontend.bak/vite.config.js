import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true, // 5173 포트를 사용할 수 없는 경우 실패하도록 설정
    // Docker 환경에서의 프록시 설정
    proxy: {
      '/api': {
        target: 'http://172.19.0.3:8000',
        changeOrigin: true,
        secure: false
      },
      '/admin': {
        target: 'http://172.19.0.3:8000',
        changeOrigin: true,
        secure: false
      },
      '/media': {
        target: 'http://172.19.0.3:8000',
        changeOrigin: true,
        secure: false
      },
    },
    // WebSocket을 위한 Vite 개발 서버 설정
    hmr: {
      // Docker 네트워크 내에서 WebSocket 연결이 작동하도록 설정
      clientPort: 5173,
      host: 'localhost'
    },
  }
});
