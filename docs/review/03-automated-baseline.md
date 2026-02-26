# DATreeMap 전체 리뷰 3단계: 자동 진단 베이스라인

작성일: 2026-02-26  
기준 브랜치: `main`

## 1) 실행 환경 확인

- `python3 --version`: `3.14.2`
- `poetry --version`: `2.1.1`
- `docker --version`: `28.5.1`, `docker compose v2.40.0`
- 전역 `black` 실행 경로는 손상(3.10 인터프리터 경로 깨짐)되어 `poetry run black` 기준으로 점검

## 2) 자동 점검 결과

| 항목 | 명령 | 결과 | 비고 |
|---|---|---|---|
| 의존성 메타 체크 | `poetry check` | PASS | `All set!` |
| Python 문법 컴파일 | `poetry run python -m compileall -q config trees users common` | PASS | 출력 없음(오류 없음) |
| 포맷 규칙 | `poetry run black --check .` | FAIL | `17 files would be reformatted` |
| Django 시스템 체크(로컬) | `poetry run python manage.py check` | FAIL | GDAL 라이브러리 경로 로딩 실패 |
| Django 테스트(로컬) | `poetry run python manage.py test` | FAIL | GDAL 라이브러리 경로 로딩 실패 |
| Compose 스펙 검증 | `docker compose -f docker-compose.yml config -q` | PASS | 경고 없음 |
| Compose 스펙 검증(dev) | `docker compose -f docker-compose.dev.yml config -q` | PASS (WARN) | `version` 속성 obsolete 경고 |
| Compose 스펙 검증(prod) | `docker compose -f docker-compose.prod.yml config -q` | PASS (WARN) | `version` obsolete, `SECRET_KEY` unset 경고 |
| Django 체크(컨테이너) | `docker compose run --rm web python manage.py check` | PASS | 시스템 체크 통과 |
| Django 테스트(컨테이너) | `docker compose run --rm web python manage.py test` | PASS* | `Ran 0 tests` (실행 테스트 없음) |

## 3) 주요 실패/차단 원인

### A. GeoDjango 런타임 경로 하드코딩

- 현재 기본 설정의 GDAL/GEOS 경로는 Linux 컨테이너 기준(`/usr/lib/aarch64-linux-gnu/...`)으로 고정
- macOS 로컬 실행 시 라이브러리 로딩 실패로 `manage.py check/test` 진입 자체가 차단됨

### B. 로컬 Homebrew GDAL 의존성 깨짐

- macOS 경로(`/opt/homebrew/lib/libgdal.dylib`)로 override 시도했으나, `libOpenEXR-3_3.32.dylib` 누락으로 추가 실패

### C. 컨테이너 경고 상태

- 컨테이너 실행 시 orphan container 경고(`datreemap-frontend-1`)가 출력됨
- 테스트는 실행 성공했지만 현재 프로젝트 테스트 케이스가 없어 `NO TESTS RAN`

## 4) 품질 게이트 판정 (Step 3)

- `black --check`: FAIL
- `manage.py check`: 로컬 FAIL / 컨테이너 PASS
- `manage.py test`: 로컬 FAIL / 컨테이너 PASS* (`Ran 0 tests`)
- Docker Compose 구문 검증: PASS(일부 경고)

판정: **자동 진단 베이스라인 수집 완료. 런타임 체크는 통과했지만 테스트 실효성은 미충족(테스트 0건)** 

## 5) Step 4 진행 시 해석 가이드

- `check/test` 로컬 실패는 코드보다는 환경 결함 영향이 큼
- 4단계 수동 리뷰에서 코드 리스크를 분리해 식별하고, 환경 항목은 별도 개선 항목으로 분리 기록 필요
