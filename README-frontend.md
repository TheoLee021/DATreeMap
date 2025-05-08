# De Anza Tree Map React+Tailwind CSS 프론트엔드

이 문서는 De Anza Tree Map 프로젝트에 React와 Tailwind CSS를 사용한 프론트엔드 설정 및 개발 가이드입니다.

## 설정 구성

이 프로젝트는 다음 기술 스택을 사용합니다:

- **React**: UI 프레임워크
- **Tailwind CSS**: 스타일링
- **Vite**: 빌드 도구
- **Leaflet/React-Leaflet**: 지도 라이브러리
- **Docker**: 개발 및 배포 환경

## Docker 기반 개발 환경

### 개발 환경 실행

전체 개발 환경(백엔드 + 프론트엔드)을 실행하려면:

```bash
./scripts/start-full-dev.sh
```

또는

```bash
docker-compose -f docker-compose.dev.yml up
```

프론트엔드만 실행하려면:

```bash
./scripts/start-frontend-dev.sh
```

또는

```bash
docker-compose -f docker-compose.dev.yml up frontend
```

개발 서버는 다음 URL에서 접근 가능합니다:
- **프론트엔드**: http://localhost:5173
- **백엔드**: http://localhost:8000

### 프론트엔드 개발하기

프론트엔드 코드는 `frontend/` 디렉토리에 있습니다. Docker 볼륨 설정으로 인해 로컬에서 파일을 수정하면 Docker 컨테이너 내부에서 자동으로 반영됩니다.

### 의존성 추가

새로운 npm 패키지를 추가하려면:

```bash
docker-compose -f docker-compose.dev.yml exec frontend npm install <패키지명>
```

## 프로덕션 빌드

프로덕션 환경을 위한 빌드 및 실행:

```bash
./scripts/build-prod.sh
```

또는

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

프로덕션 빌드는 다음 과정으로 진행됩니다:
1. React 애플리케이션이 빌드됨
2. 빌드된 정적 파일이 Django 컨테이너로 복사됨
3. Nginx가 정적 파일을 제공하고 API 요청을 Django 백엔드로 프록시함

## 프로젝트 구조

```
frontend/
├── public/            # 정적 에셋
├── src/
│   ├── components/    # React 컴포넌트
│   ├── services/      # API 서비스 
│   ├── hooks/         # 커스텀 React 훅
│   ├── App.jsx        # 메인 앱 컴포넌트
│   ├── config.js      # 애플리케이션 설정
│   ├── index.css      # 전역 스타일
│   └── main.jsx       # 진입점
├── index.html         # HTML 템플릿
├── vite.config.js     # Vite 설정
├── tailwind.config.js # Tailwind 설정
├── postcss.config.js  # PostCSS 설정
├── Dockerfile         # 개발용 Docker 설정
└── package.json       # 의존성 및 스크립트
```

## API 통신

백엔드 API는 `/api` 경로를 통해 접근할 수 있습니다. 개발 서버는 자동으로 API 요청을 백엔드 서버로 프록시합니다.

## 개발 시 주의사항

1. **환경 변수**: 환경 변수는 `.env` 파일 또는 Docker Compose 파일에서 관리됩니다.

2. **CORS**: 개발 환경에서는 Django 서버의 CORS 설정이 자동으로 구성됩니다.

3. **Hot Module Replacement (HMR)**: Docker 환경에서 HMR이 작동하도록 Vite 설정이 최적화되어 있습니다.

4. **포트 설정**: 기본적으로 프론트엔드는 5173 포트, 백엔드는 8000 포트에서 실행됩니다. 필요한 경우 Docker Compose 파일에서 수정할 수 있습니다. 

## Docker 네트워크 구성

프론트엔드와 백엔드는 Docker 네트워크를 통해 통신합니다. 이 과정에서 다음과 같은 특이사항이 있습니다:

1. **동적 IP 주소 관리**: Docker 네트워크 내에서 서비스 IP 주소는 재시작 시 변경될 수 있습니다. 이를 해결하기 위해 `start-dev.sh` 스크립트를 도입했습니다.
   - 이 스크립트는 컨테이너 시작 시 백엔드 서비스 IP를 자동으로 감지
   - 감지된 IP로 Vite 프록시 설정을 업데이트

2. **ALLOWED_HOSTS 설정**: Django 백엔드에서는 다음 호스트를 허용하도록 설정되어 있습니다:
   - localhost
   - 127.0.0.1
   - web (서비스 이름)
   - 모든 호스트 ('*') - 개발 환경에서만 사용

## 문제 해결

### Docker 네트워크 연결 문제

1. **백엔드 연결 오류**: "Failed to load tree data" 오류가 발생하는 경우:
   - Django 백엔드 로그 확인: `docker-compose -f docker-compose.dev.yml logs web`
   - 프론트엔드 로그 확인: `docker-compose -f docker-compose.dev.yml logs frontend`
   - Django ALLOWED_HOSTS 설정이 올바른지 확인 (config/settings.py)

2. **IP 주소 변경**: Docker 네트워크가 재생성된 경우 다음을 시도:
   - 전체 환경 재시작: `docker-compose -f docker-compose.dev.yml down && docker-compose -f docker-compose.dev.yml up`
   - 개별 서비스 재시작: `docker-compose -f docker-compose.dev.yml restart frontend`

### 변경 사항이 반영되지 않는 문제

1. **Hot Module Replacement 오류**: 코드 변경이 반영되지 않는 경우:
   - 브라우저 개발자 도구에서 WebSocket 연결 오류 확인
   - 브라우저 캐시 비우기
   - 프론트엔드 컨테이너 재시작 