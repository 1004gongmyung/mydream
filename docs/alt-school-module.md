# 대안학교 정보 모듈 — 데이터 갱신 절차

> 설계 원본: `../../mydream-alt-school-module-prompt.md` (2계층 분리·파생 금지·모델 생성 금지)
> 이 모듈의 목적은 학교 목록이 아니라 **"이 기관을 졸업하면 학력이 인정되는가"의 구분**이다.

## 구조

```
data/alternative_schools.seed.csv   원본 — 사람이 확인한 데이터만 (현재: 가상 샘플 3행)
tools/load-alt-schools.mjs          CSV → data/altschools.data.js 생성 (필수 필드·정합 검사, 불량 행 스킵+사유 출력)
tools/verify-alt-schools.mjs        기준일 180일 경과 목록 · 출처 URL 응답 · 정합 검사 (오류 시 종료 코드 1)
js/altschools.js                    로직 — 배지·정합·필터·검색 (UMD, 테스트 대상)
test/altschools.test.mjs            절대 규칙·배지·Tier2·검정고시 안내·필터 테스트
화면: #altschools(목록·검색·미확인 안내) / #altschool/<id>(상세)
```

## 갱신 절차 (데이터 넣기·고치기)

1. **원본 확인** — 아래 공식 출처에서 직접 확인한 값만 CSV에 적는다. 모델·추정으로 채우지 않는다.
   - 대안교육기관지원센터 https://www.alter-edu.re.kr — 등록 대안교육기관 현황 (Tier 2 주 소스)
   - 학교알리미 https://www.schoolinfo.go.kr — 특성화중·고, 인가 대안학교 (Tier 1 주 소스)
   - 시·도 교육청 공고 — 등록 현황 보완
   - 국가법령정보센터 — 「대안교육기관에 관한 법률」
2. `data/alternative_schools.seed.csv` 편집. 규칙:
   - `accredits_diploma`는 **원본에서 확인한 값을 직접 적는다** — legal_status에서 유추 금지
   - `verified_at`(YYYY-MM-DD, 확인한 날) 없는 행은 로더가 거부한다
   - 모르는 값은 빈칸(null)으로 둔다 — Tier 2는 이름·지위·소재지·출처만으로 정상
   - Tier 2 필수: `name, legal_status, accredits_diploma(false), region_sido, region_sigungu, address, source_*, verified_at`
3. `node tools/load-alt-schools.mjs` — 스킵된 행이 있으면 사유를 보고 CSV를 고친다
4. `node tools/verify-alt-schools.mjs` — 정합 오류 0건이어야 한다
5. `node --test test/altschools.test.mjs` + `node tools/audit-links.mjs`
6. 서버 띄우고 `node tools/sweep.mjs` → 통과하면 `git add -A; git commit; git push` (자동 배포)

## 법적 지위 × 학력 인정 대응표 (검증 기준)

| legal_status | accredits_diploma |
|---|---|
| SPECIALIZED_MIDDLE / SPECIALIZED_HIGH / ACCREDITED_ALT / ENTRUSTED | true |
| REGISTERED / UNREGISTERED | false |

이 표는 **검증에만** 쓴다. 두 값 모두 원본 확인 후 CSV에 명시 입력한다 (법이 바뀌면 파생 로직은 조용히 틀린다).

## 하지 말 것 (원본 프롬프트의 금지 목록)

- 학교 데이터를 모델이 생성·추정해 채우기
- `legal_status`로부터 `accredits_diploma` 자동 계산
- 학교 간 순위·평점·추천 알고리즘
- 종교 성향에 대한 평가·해석 문구 (사실만 기재)
- `verified_at` 없는 레코드 삽입
- robots.txt·이용약관 확인 전 자동 크롤러 구현

## 수록 현황 (2026-07-27, 1차 배치)

| 배치 | 범위 | 근거 출처 |
|---|---|---|
| 1차 (완료) | **경기 23곳** — 인가 대안학교(각종학교) 10 + 특성화중 7 + 특성화고 6 | 경기도교육청 「대안학교 및 대안교육 특성화학교 현황(2025)」 PDF |
| 1차 (완료) | **전북 6곳** — 특성화중 2 + 특성화고 4 | 전북교육청 대안교육지원센터 공식 페이지 |
| 2차 (과제) | 나머지 시도 특성화중고·인가 대안학교 | 각 시도교육청 공식 자료 확인 후 |
| 3차 (과제) | **Tier 2: 등록 대안교육기관 259곳(2024-06 교육부 기준)** | 교육부 '대안교육기관 현황' — hwpx 첨부라 자동 파싱 불가, 한글 파일 열어 수동 확인 필요 |

- 부분 수록 상태이므로 목록 화면에 "여기 없다고 인가·등록이 아닌 게 아니에요" 커버리지 안내가 뜨고, 검색 미확인 안내도 "아직 담기지 않았을 수 있음"을 병기한다.
- 전북 6곳은 characteristics 미확인(로더 경고로 추적 중), 전체 29곳의 상세 주소·모집 시기·학비는 학교알리미 개별 확인으로 보강할 것.

## 적응 메모 (원 스펙 대비)

- DB·ORM 없는 클래식 스크립트 앱이라 마이그레이션 대신 **CSV → 생성물(data/altschools.data.js)** 구조를 쓴다 (content.data.js와 동일 패턴)
- '사용자 지역 인접순' 기본 정렬은 위치 권한이 없어 **시도→이름순**으로 대체 (우열·랭킹 아님)
- 검정고시 연결은 기존 콘텐츠(#q/H2, 고교 지도 '학교 밖' 카드, 경로 지도 전환기)로 연결
- ~~현재 CSV는 가상 샘플 3행~~ → 2026-07-27 실데이터 1차 배치(경기·전북 29곳)로 교체 완료. 샘플 배너는 자동 소멸, 대신 커버리지 안내가 표시된다
