# De Anza 트리맵

De Anza 캠퍼스의 나무 데이터를 시각화하고 관리하기 위한 웹 애플리케이션입니다. Django와 PostGIS를 기반으로 구축된 이 애플리케이션은 캠퍼스 내 나무를 탐색할 수 있는 인터랙티브 맵 인터페이스를 제공합니다.

## 목차
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 설정](#설치-및-설정)
  - [Docker 사용 (권장)](#docker-사용-권장)
  - [로컬 개발 환경 설정](#로컬-개발-환경-설정)
- [나무 데이터 가져오기](#나무-데이터-가져오기)
- [API 엔드포인트](#api-엔드포인트)
- [개발 및 프로덕션 환경](#개발-및-프로덕션-환경)
- [사용자 정의 사용자 모델](#사용자-정의-사용자-모델)
- [환경 변수](#환경-변수)
- [문제 해결](#문제-해결)
- [프로덕션 배포 고려사항](#프로덕션-배포-고려사항)
- [테스트 실행](#테스트-실행)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

## 주요 기능

- 나무 데이터의 인터랙티브 맵 시각화
- 상세한 나무 정보 표시
- 나무 데이터 접근을 위한 REST API
- CSV 파일에서 나무 데이터 가져오기
- 사용자 인증 및 권한 관리

## 기술 스택

- **백엔드**: Django 5.1.6
- **데이터베이스**: PostgreSQL + PostGIS (공간 데이터용)
- **API**: Django REST Framework
- **프론트엔드**: JavaScript, Leaflet.js (지도 라이브러리)
- **배포**: Docker, Docker Compose
- **의존성 관리**: Poetry

## 프로젝트 구조

프로젝트는 다음과 같은 주요 앱으로 구성되어 있습니다:

- **trees**: 나무 데이터 관리용 모델과 뷰
- **users**: 사용자 정의 계정 및 프로필 관리

## 설치 및 설정

### Docker 사용 (권장)

1. Docker와 Docker Compose 설치:
   - Mac용: [Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/)
   - Windows용: [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)
   - Linux용: [Docker Engine](https://docs.docker.com/engine/install/)과 [Docker Compose](https://docs.docker.com/compose/install/)

2. 저장소를 복제합니다:
   ```bash
   git clone [저장소-URL]
   cd [저장소-폴더]
   ```

3. `.env` 파일을 생성하고 설정합니다 (필요한 경우):
   ```bash
   cp .env.example .env
   # 필요한 경우 .env 파일을 편집합니다
   ```

   `.env` 파일에는 다음 변수들이 포함되어야 합니다:
   ```
   # Django 설정
   DJANGO_SECRET_KEY=django-insecure-your-secret-key-here
   DEBUG=1  # 프로덕션에서는 0으로 설정

   # 데이터베이스 설정
   DB_NAME=datreemap
   DB_USER=datreemap
   DB_PASSWORD=datreemap
   DB_HOST=db
   DB_PORT=5432

   # GDAL/GEOS 설정
   GDAL_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgdal.so
   GEOS_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgeos_c.so

   # 기타 설정
   ALLOWED_HOSTS=localhost 127.0.0.1
   IN_DOCKER=True
   ```

   `.env` 파일 편집 시 주요 고려사항:
   - 보안을 위해 프로덕션에서는 `DJANGO_SECRET_KEY`를 고유한 임의 문자열로 변경
   - 프로덕션 환경에서는 `DEBUG=0`으로 설정
   - **데이터베이스 보안**:
     - 강력하고 고유한 데이터베이스 사용자 비밀번호 사용
     - 환경별 데이터베이스 자격 증명 사용 고려
     - 프로덕션에서는 제한된 권한의 데이터베이스 사용자 생성
     - 프로덕션에서는 'root'나 기본 비밀번호 사용 금지
     - 프로덕션에서는 데이터베이스 연결 풀링 고려
   - 필요한 경우 데이터베이스 자격 증명 조정
   - 아키텍처에 따라 GDAL/GEOS 경로 업데이트:
     - ARM64 (M1/M2 Mac): `/usr/lib/aarch64-linux-gnu/libgdal.so` 사용
     - Intel/AMD64: `/usr/lib/libgdal.so` 사용
   - 프로덕션에서는 도메인을 `ALLOWED_HOSTS`에 추가

4. Poetry 의존성을 업데이트합니다:
   ```bash
   poetry lock
   ```

5. Docker Compose로 서비스를 시작합니다:
   ```bash
   docker-compose up --build
   ```

6. 데이터베이스를 초기화합니다:
   ```bash
   # 새 터미널에서
   docker-compose exec web python manage.py migrate
   docker-compose exec web python manage.py import_trees "Tree Dataset_De Anza College_Backup.csv"
   docker-compose exec web python manage.py createsuperuser
   ```

7. 웹 브라우저에서 애플리케이션에 접근합니다:
   ```
   http://localhost:8000
   ```
   
   관리자 인터페이스:
   ```
   http://localhost:8000/admin
   ```

## 나무 데이터 가져오기

CSV 파일에서 나무 데이터를 가져오기 위한 사용자 정의 관리 명령이 제공됩니다:

```bash
# Docker 설정의 경우
docker-compose exec web python manage.py import_trees "Tree Dataset_De Anza College_Backup.csv"

# 로컬 설정의 경우
python manage.py import_trees "Tree Dataset_De Anza College_Backup.csv"
```

Django의 dumpdata/loaddata 명령을 사용하여 나무 데이터를 내보내고 복원할 수도 있습니다:

```bash
# 나무 데이터 내보내기
docker-compose exec web python manage.py dumpdata trees.Tree > trees_backup.json

# 나무 데이터 복원
docker-compose exec web python manage.py loaddata trees_backup.json
```

## API 엔드포인트

- 나무 목록: `/trees/api/rest/trees/`
- 나무 상세: `/trees/api/rest/trees/<tag_number>/`
- 지도 나무 데이터: `/trees/api/trees/`
- 나무 상세 데이터: `/trees/api/trees/<tag_number>/`

## 개발 및 프로덕션 환경

Docker 설정은 개발 및 프로덕션 환경을 모두 지원합니다:

### 개발
- Dockerfile의 `development` 타겟 사용
- 코드를 볼륨으로 마운트하여 실시간 리로딩
- Django 개발 서버(`runserver`) 사용
- `docker-compose.yml`을 통해 설정

### 프로덕션
- Dockerfile의 `production` 타겟 사용
- WSGI 서버로 Gunicorn 사용
- 정적 파일 자동 수집
- `docker-compose.prod.yml`을 통해 설정

```bash
# 프로덕션 배포용
docker-compose -f docker-compose.prod.yml up --build -d
```

## 사용자 정의 사용자 모델

프로젝트는 다음 필드가 포함된 사용자 정의 사용자 모델을 구현합니다:
- 프로필 사진
- 이름
- 기여자 상태
- 성별
- 언어 선호도

## 환경 변수

주요 환경 변수:
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: 데이터베이스 연결 정보
- `DEBUG`: 디버그 모드 활성화/비활성화 (1 또는 0)
- `SECRET_KEY`: Django 시크릿 키
- `ALLOWED_HOSTS`: 허용된 호스트 도메인
- `GDAL_LIBRARY_PATH`, `GEOS_LIBRARY_PATH`: GDAL/GEOS 라이브러리 경로
- `IN_DOCKER`: Docker 환경 확인 플래그 (라이브러리 경로 설정용)

## 문제 해결

### GDAL 라이브러리 문제
GDAL 라이브러리 오류가 발생하는 경우:

```
OSError: /usr/lib/libgdal.so: cannot open shared object file: No such file or directory
```

환경에서 올바른 라이브러리 경로가 설정되어 있는지 확인하세요:

```bash
# 라이브러리 위치 확인
docker-compose exec web find / -name "libgdal.so*" 2>/dev/null

# GDAL 버전 확인
docker-compose exec web gdal-config --version
```

ARM64 아키텍처 (M1/M2 Mac) 사용자는 다음을 사용해야 합니다:
```
GDAL_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgdal.so
GEOS_LIBRARY_PATH=/usr/lib/aarch64-linux-gnu/libgeos_c.so
```

### Poetry 의존성 문제
Poetry 의존성 오류가 발생하는 경우:

```bash
# lock 파일 업데이트
poetry lock

# Docker 환경 내에서
docker run --rm -v $(pwd):/app -w /app python:3.12-slim bash -c "pip install poetry && poetry lock"
```

### 데이터베이스 연결 문제
웹 서비스가 데이터베이스에 연결할 수 없는 경우:

1. 데이터베이스 서비스가 정상인지 확인:
   ```bash
   docker-compose logs db
   ```

2. Docker 환경에서 `DB_HOST`가 `db`(서비스 이름)로 설정되어 있는지 확인

3. 수동으로 데이터베이스 연결 확인:
   ```bash
   docker-compose exec db psql -U datreemap -d datreemap -c "\l"
   ```

## 프로덕션 배포 고려사항

프로덕션 배포 시:
- `.env`에서 `DEBUG=0` 설정
- 보안된 `SECRET_KEY` 구성
- HTTPS 사용
- 적절한 정적 파일 서빙 설정
- 보안 설정 적용 (HSTS, XSS 보호 등)
- 프로덕션 Docker Compose 파일 사용:
  ```bash
  docker-compose -f docker-compose.prod.yml up --build -d
  ```

## 테스트 실행

```bash
# Docker 설정의 경우
docker-compose exec web python manage.py test

# 로컬 설정의 경우
python manage.py test
```

## 기여하기

이 프로젝트에 기여하는 두 가지 방법:

### 코드 기여

1. 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치를 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 엽니다

### 이슈 제보 및 기능 제안

1. 해당 이슈/기능이 이미 제보되었는지 확인합니다
2. 설명적인 제목과 자세한 내용을 포함한 새 이슈를 생성합니다
3. 버그의 경우 재현 단계를 포함하거나 기능의 경우 구체적인 사용 사례를 포함합니다
4. 관련 라벨과 필요한 경우 스크린샷을 추가합니다

## 라이선스

MIT 라이선스

Copyright (c) 2025 [Environmental Monitoring Society]

---

이 프로젝트는 De Anza 캠퍼스 전역의 나무 데이터를 시각화하고 관리하기 위해 지리 정보 시스템을 활용하는 웹 애플리케이션입니다.

자세한 Docker 설정 가이드는 [DOCKER_SETUP.md](DOCKER_SETUP.md)를 참조하세요.