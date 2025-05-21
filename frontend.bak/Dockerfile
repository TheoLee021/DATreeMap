FROM node:18-alpine

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package.json package-lock.json* ./
RUN npm install

# 소스 코드 복사
COPY . .

# 시작 스크립트 실행 권한 부여
RUN chmod +x /app/start-dev.sh

# 개발 모드에서는 Vite 개발 서버를 실행
# 시작 스크립트를 사용하여 동적 IP 주소로 연결
CMD ["/app/start-dev.sh"] 