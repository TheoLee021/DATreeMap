#!/bin/sh

# web 서비스의 IP 주소 확인
WEB_IP=$(getent hosts web | awk '{ print $1 }')

if [ -z "$WEB_IP" ]; then
  echo "Warning: Could not resolve web service IP, using default (web:8000)"
  WEB_IP="web"
  WEB_PORT=8000
else
  echo "Detected web service IP: $WEB_IP"
  WEB_PORT=8000
fi

# vite.config.js 파일 생성
cat > ./vite.config.js << EOF
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
        target: 'http://${WEB_IP}:${WEB_PORT}',
        changeOrigin: true,
        secure: false
      },
      '/admin': {
        target: 'http://${WEB_IP}:${WEB_PORT}',
        changeOrigin: true,
        secure: false
      },
      '/media': {
        target: 'http://${WEB_IP}:${WEB_PORT}',
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
EOF

echo "Updated vite.config.js with web service IP: $WEB_IP:$WEB_PORT"

# Vite 개발 서버 시작
exec npm run dev 