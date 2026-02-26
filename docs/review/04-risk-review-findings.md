# DATreeMap 전체 리뷰 4단계: 리스크 중심 수동 리뷰 결과

작성일: 2026-02-26  
기준 브랜치: `main`

## Findings (Severity 순)

### [P0] 운영 보안 설정이 실질적으로 비활성화됨

- 위치:
  - `config/settings.py` L24, L27, L42
  - `docker-compose.prod.yml` L16
- 문제:
  - `SECRET_KEY`가 하드코딩되어 있고 `DEBUG=True`, `ALLOWED_HOSTS=['*']`가 기본값으로 고정됨
  - 프로덕션 Compose가 `DJANGO_SETTINGS_MODULE=config.settings`를 사용해 `config/settings/production.py` 보안 설정이 적용되지 않음
- 영향:
  - 운영 환경에서 디버그 노출/호스트 검증 무력화/고정 시크릿 사용 위험
- 권장 수정:
  - `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`를 환경변수 기반으로 전환
  - 프로덕션은 `DJANGO_SETTINGS_MODULE=config.settings.production` 사용
  - 부트 시 필수 환경변수 누락 시 실패(fail fast)
- 필요 테스트:
  - 프로덕션 컨테이너에서 `DEBUG=False`, `ALLOWED_HOSTS` 반영 여부 확인
  - 미설정 시 앱이 시작 실패하는지 검증

### [P1] 지도/모달 렌더링 경로에 Stored XSS 취약점

- 위치:
  - `static/js/map.js` L270-L276, L532-L564, L622-L633
- 문제:
  - API 데이터(`common_name`, `botanical_name`, `notes`, `species`)를 escaping 없이 HTML 문자열로 합성 후 `innerHTML`에 주입
- 영향:
  - DB에 스크립트 페이로드가 저장되면 지도 팝업/모달/필터에서 스크립트 실행 가능
- 권장 수정:
  - 사용자/데이터 입력값은 text node(`textContent`)로 렌더링
  - 불가피한 HTML 렌더링은 sanitize 라이브러리 사용
- 필요 테스트:
  - `<img src=x onerror=alert(1)>` 같은 페이로드가 화면에서 문자로만 표시되는지 확인

### [P1] `tree_data` API에서 `eval` 사용으로 런타임 장애 위험

- 위치:
  - `trees/views.py` L85-L90
- 문제:
  - `serialize('geojson', ...)` 결과 문자열을 `eval`로 파싱
  - JSON `null/true/false`는 Python `eval` 문법과 달라 `NameError`를 유발할 수 있음
- 영향:
  - null 값 포함 시 `/api/trees/`가 500으로 실패 가능
  - 불필요한 `eval` 사용 자체가 보안/안정성 리스크
- 권장 수정:
  - `json.loads(geojson)`로 대체
  - 가능하면 `serialize` 문자열 변환 없이 DRF serializer 경로로 통일
- 필요 테스트:
  - nullable 필드가 포함된 데이터로 `/api/trees/` 응답 200/JSON 검증

### [P1] 프로덕션 프론트엔드 아티팩트 경로 불일치로 배포 실패 가능

- 위치:
  - `multi-stage.Dockerfile` L4-L7
  - `docker-compose.prod.yml` L45
- 문제:
  - 빌드/마운트 경로가 `frontend/`를 전제로 하나 저장소에는 `frontend/`가 없고 `frontend.bak/`만 존재
- 영향:
  - 프로덕션 이미지 빌드 실패 또는 Nginx가 빈/누락된 프론트엔드 제공
- 권장 수정:
  - 실제 운영 프론트엔드 디렉터리 하나로 경로 통일
  - CI에서 `docker compose -f docker-compose.prod.yml build` 검증 추가
- 필요 테스트:
  - 프로덕션 빌드 성공 여부와 `/` 경로 정상 렌더링 확인

### [P1] 커스텀 User 필수 필드와 `createsuperuser` 입력 요구사항 불일치

- 위치:
  - `users/models.py` L30-L37
  - 확인 결과: `User.REQUIRED_FIELDS == ['email']`
- 문제:
  - `gender`, `language`는 필수(`blank=False`, default 없음)인데 `REQUIRED_FIELDS`에 없음
- 영향:
  - `createsuperuser --noinput` 같은 자동화 경로 실패 가능
  - 계정 생성 흐름에서 무결성 오류 위험
- 권장 수정:
  - `REQUIRED_FIELDS`에 필수 필드 추가 또는 필드 default/blank 정책 정합화
- 필요 테스트:
  - `createsuperuser` 대화형/비대화형 모두 성공 검증

### [P2] 좌표값이 0일 때 위치(Point) 생성 누락

- 위치:
  - `trees/models.py` L55-L58
- 문제:
  - `if self.latitude and self.longitude` 조건으로 0.0 좌표가 false 취급됨
- 영향:
  - 유효한 적도/본초자오선 좌표 데이터 저장 시 `location` 누락
- 권장 수정:
  - `is not None` 조건으로 변경
- 필요 테스트:
  - `(0.0, 0.0)` 좌표 저장 시 `location` 생성 확인

### [P2] 목록 정렬이 문자열 기반이라 숫자 정렬이 부정확함

- 위치:
  - `trees/views.py` L44-L55
  - `trees/models.py` L28-L31
- 문제:
  - `height`, `diameter`가 `CharField`이고 그대로 `order_by` 수행
- 영향:
  - 예: `"100"`이 `"20"`보다 앞서는 lexicographic 정렬
- 권장 수정:
  - 숫자 필드 분리(마이그레이션) 또는 DB 함수로 안전한 numeric cast 정렬
- 필요 테스트:
  - 숫자 문자열 샘플 데이터에서 오름/내림차순 결과 검증

### [P3] 모달 오픈 시 keydown 리스너 누적으로 이벤트 누수

- 위치:
  - `static/js/map.js` L525-L529
- 문제:
  - 모달을 열 때마다 `document`에 새 keydown 핸들러 등록, 해제 로직 없음
- 영향:
  - 장시간 사용 시 중복 핸들러 증가, 예측 불가 동작/성능 저하 가능
- 권장 수정:
  - 모달 생명주기 내 1회 등록/해제 또는 `once` 옵션 사용
- 필요 테스트:
  - 모달 반복 열기/닫기 후 ESC 동작 및 핸들러 개수 검증

## 테스트 갭

- 컨테이너 기준 `python manage.py test` 결과: `Ran 0 tests`
- 현재 발견된 P0/P1 이슈를 보호하는 회귀 테스트가 없음

## 우선 처리 순서 제안

1. P0 보안 설정 정상화(`settings`/prod compose 정합)
2. P1 XSS 제거(`map.js` 렌더링 방식 전환)
3. P1 `eval` 제거 및 API 응답 경로 통일
4. P1 배포 경로(frontend 디렉터리) 정합화
5. P1 사용자 생성 정책(`REQUIRED_FIELDS`) 정합화
6. P2/P3 데이터 품질/프론트 이벤트 누수 개선
