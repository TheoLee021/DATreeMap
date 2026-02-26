# DATreeMap 전체 리뷰 1단계: 스코프/기준 확정

작성일: 2026-02-26  
기준 브랜치: `main`

## 1) 리뷰 목표

- 기능 정확성: 트리 목록/지도/API/데이터 임포트 동작의 정확성 확인
- 회귀 위험: 설정 변경, 배포 구성, 데이터 모델 변경 시 깨질 수 있는 경로 식별
- 보안/운영성: 인증/권한/시크릿/배포 설정에서 실서비스 리스크 점검
- 테스트 신뢰도: 현재 테스트 상태와 회귀 방지 수준 평가

## 2) 리뷰 범위 (In Scope)

- 백엔드 핵심 코드
  - `config/` (settings, urls, asgi/wsgi)
  - `trees/` (models, views, serializers, urls, management commands)
  - `users/` (custom user model, views)
  - `common/` (공통 모델/구성)
- 웹 UI 서버 렌더링 경로
  - `templates/`
  - `static/`
- 운영/배포 구성
  - `Dockerfile`, `multi-stage.Dockerfile`
  - `docker-compose.yml`, `docker-compose.dev.yml`, `docker-compose.prod.yml`
  - `nginx/`, `start.sh`, `scripts/`
- 의존성/실행 정의
  - `pyproject.toml`, `poetry.lock`, `README*.md`

## 3) 리뷰 제외 범위 (Out of Scope)

- 캐시/산출물/로컬 상태 파일
  - `__pycache__/`, `media/`, `staticfiles/`, `.DS_Store`
- 대용량 데이터 샘플/백업 아티팩트 자체 품질
  - `Tree Dataset_De Anza College_Backup.csv`, `trees_backup.json`, `db.sqlite3`
- 히스토리/백업 성격 디렉터리
  - `.git copy/`
  - `frontend.bak/` (현재 실행 경로가 아니므로 참고만)

## 4) 우선순위 기준 (Severity)

- `P0`: 즉시 장애/데이터 손실/치명 보안 이슈 가능성
- `P1`: 높은 확률의 기능 오동작, 권한/무결성 손상, 배포 차단
- `P2`: 성능/유지보수성/운영 안정성 저하, 중기 리스크
- `P3`: 코드 품질 개선, 일관성/가독성 이슈

## 5) 리뷰 게이트 (Phase 3에서 실행할 기준)

- 정적/기본 점검
  - `python manage.py check`
  - `python manage.py test`
- 빌드/실행 점검
  - 개발/운영 Docker Compose 구성 유효성 확인
  - 정적 파일 수집 경로 및 Nginx 라우팅 정합성 확인
- 코드 규칙 점검
  - `black --check .` (도입된 dev dependency 기준)

## 6) 리스크 기반 우선 리뷰 영역

- `trees/views.py`: API 응답 처리, 필터/정렬/페이징, 예외 처리
- `trees/models.py`: Geo 필드 저장 로직, 데이터 무결성
- `trees/management/commands/import_trees.py`: CSV 입력 검증, 실패 처리
- `config/settings.py`: DEBUG/ALLOWED_HOSTS/시크릿/DB 설정 안전성
- Docker/Nginx: 운영 경로의 프론트엔드 정적 서빙 정합성

## 7) 단계 완료 조건 (Definition of Done for Step 1)

- 리뷰 대상/제외 대상이 명시되어 있음
- 심각도 기준(P0~P3)이 고정되어 있음
- 이후 단계에서 사용할 점검 게이트가 명시되어 있음
- 리스크 우선순위 영역이 파일 단위로 지정되어 있음
