# 구현 로드맵: Notion 연동 견적서 웹 뷰어 & PDF 다운로드 (MVP)

| 항목 | 내용 |
|------|------|
| 기준 문서 | `docs/PRD.md` (v0.1, Notion API 분석 반영본) |
| 기간 | 3주 (개발자 1~2명) |
| 공수 표기 | S(≤0.5일) / M(1~2일) / L(3일+) |
| 상태 표기 | `[ ]` 미착수 · `[x]` 완료 |

> 각 작업(Task)은 단독으로 검증 가능해야 하며, 검증 기준은 PRD의 `FR-*`를 따른다. `[가정]` 항목은 해당 작업 안에서 확정하고 PRD에 반영한다.

---

## 0. 한눈에 보기

```mermaid
flowchart LR
  P0[Phase 0\n스파이크/준비\n(1주차 초반)] --> P1[Phase 1\n데이터 레이어\n(1주차)]
  P1 --> P2[Phase 2\n웹 뷰어\n(2주차)]
  P1 --> P3a[Phase 3a\nPDF 문서\n(2주차 후반~3주차)]
  P2 --> P4[Phase 4\nPDF 라우트/마감\n(3주차)]
  P3a --> P4
  P4 --> P5[Phase 5\n배포/검수\n(3주차 말)]
```

| Phase | 기간 | 산출물 | 관련 FR |
|-------|------|--------|---------|
| 0. 스파이크/준비 | 1주차 1~2일 | Notion 실호출 검증, 한글 PDF 스파이크, 의존성 설치 | — |
| 1. 데이터 레이어 | 1주차 | `lib/notion`, `lib/invoice` | FR-001, 005, 007 |
| 2. 웹 뷰어 | 2주차 | `/invoice/[token]` + 상태 화면 | FR-002, 006, 009, 010, 011, 013 |
| 3. PDF 문서 | 2주차 후반~3주차 | `lib/pdf` 문서 컴포넌트 + 폰트 | FR-004 |
| 4. PDF 라우트/마감 | 3주차 | `/pdf` 다운로드, 만료 배지 | FR-003, 008, 012 |
| 5. 배포/검수 | 3주차 말 | Vercel 배포, 실기기 확인, 문서 | MVP 완료 기준 |

크리티컬 패스: **Phase 0(스파이크) → Phase 1 → Phase 4 → Phase 5**. Phase 2와 Phase 3은 Phase 1 완료 후 병렬 진행 가능하다.

---

## Phase 0. 스파이크 및 준비 (1주차, 1~2일)

목적: 불확실성이 큰 두 가지(Notion API 실제 동작, 한글 PDF)를 **본 개발 전에** 검증한다 (PRD R2, R4).

### T0.1 Notion 워크스페이스 준비 — S
- [ ] internal Integration 생성(Read content 권한만)
- [ ] Invoices, InvoiceItems DB 생성(PRD 7.1 스키마 그대로, Relation은 **양방향**)
- [ ] 두 DB에 Integration 연결(공유)
- [ ] 샘플 데이터: 견적서 3건(발행/초안/만료) + 품목(3건, 0건, 30건 케이스)
- [ ] 각 DB의 data source ID 확인(`GET /v1/databases/{id}` → `data_sources[0].id`)
- 완료 기준: 토큰으로 data source 쿼리가 수동 호출(curl/스크립트)에서 성공한다.

### T0.2 의존성 설치 및 환경 설정 — S
- [ ] `npm i @notionhq/client @react-pdf/renderer server-only` (zod는 T1.3에서 필요 시 추가)
- [ ] `.env.example` 작성(PRD 9.3: `NOTION_TOKEN`, `NOTION_INVOICES_DATA_SOURCE_ID`, `NOTION_ITEMS_DATA_SOURCE_ID`, `NEXT_PUBLIC_SITE_URL`), `.env.local` 생성
- [ ] `.gitignore`에서 `.env*.local` 제외 확인
- [ ] 설치된 `@notionhq/client` 버전과 기본 API 버전(`2025-09-03`) 확인
- 완료 기준: `npm run lint`, `npm run build` 통과.

### T0.3 Notion API 미확인 항목 검증 — M
PRD 9.4 "구현 시 검증할 항목"을 실호출/타입 체크로 확정하고 결과를 PRD에 반영한다.
- [ ] `select.equals`, `relation.contains` 필터 연산자 이름
- [ ] `filter_properties`가 속성 이름/ID 중 무엇을 받는지, 필터 속성 포함 필요 여부
- [ ] `page_size` 최대값, 전체 페이지 타입 가드 헬퍼 이름
- [ ] `databases.retrieve`가 `data_sources`를 반환하는지
- 완료 기준: 위 4개 결정이 PRD에 `[확인]`으로 기록된다.

### T0.4 한글 PDF 스파이크 — M
- [ ] Noto Sans KR 또는 Pretendard TTF(Regular/Bold) 선정, OFL 라이선스 확인, `lib/pdf/fonts/`에 배치
- [ ] 임시 Route Handler에서 `Font.register`(절대 경로) + `renderToBuffer`로 한글/영문/숫자/특수문자(㈜, ₩, 중점) 샘플 PDF 생성
- [ ] 폰트 형식(TTF) 동작과 번들 크기, 로컬 응답 시간 측정
- 완료 기준: 글자 깨짐(□) 0건, 응답 ≤ 5초. 실패 시 PRD 10장 대안(Playwright 등) 재검토 후 Phase 3 범위를 조정한다.

---

## Phase 1. 데이터 레이어 (1주차)

### T1.1 도메인 타입 — S
- [ ] `lib/notion/types.ts`: PRD 7.2 그대로(`Invoice`, `InvoiceItem`, `Party`, `InvoiceStatus`, `InvoiceTotals`)
- [ ] `lib/notion/schema.ts`: 속성명(또는 T0.3에서 결정한 ID) 상수

### T1.2 금액 계산/포맷 — S
- [ ] `lib/invoice/calculate.ts`: `calculateTotals()` (품목금액=수량×단가, 부가세=`Math.floor`, 총액)
- [ ] `lib/invoice/format.ts`: 원화 포맷(`220,000원`), 날짜 포맷(`2026-11-14`), 만료 판정 헬퍼
- 검증(FR-007): 수동 케이스 5개(정상, 수량 0, 세율 0, 소수 단가 방어, 큰 금액)를 스크립트로 확인.

### T1.3 매퍼 — M
- [ ] `lib/notion/mapper.ts`: 속성 타입별 추출(title/rich_text/number/select/date/relation), 필수값 누락 시 throw
- [ ] 쿼리 결과를 전체 페이지 타입으로 좁히는 가드
- [ ] 도메인 에러(`lib/notion/errors.ts`): `NotFound`, `Upstream`(Notion 오류 본문 비노출)
- 완료 기준: 샘플 3건이 `Invoice`로 매핑되고, 필수값을 비운 건은 에러로 분리된다.

### T1.4 조회 함수 및 캐싱 — M
- [ ] `lib/notion/client.ts`: `import "server-only"`, `Client` 싱글턴(`retry.maxRetries` 설정)
- [ ] `lib/notion/invoices.ts`: `getInvoiceByToken(token)`
  1. UUID 형식 검증(실패 시 즉시 `null`)
  2. 견적서 data source 쿼리(`ShareToken` + `Status=발행`, `page_size: 1`, `Items` 제외)
  3. 품목 data source를 `Invoice` relation 필터 + `Order` 정렬로 조회(전체 페이지네이션)
  4. 매핑 후 반환
- [ ] `unstable_cache`(60초, 태그 `invoice:{token}`)로 래핑하고 `null` 결과 캐시 정책 결정 `[가정]`
- [ ] 429/5xx 처리: 도메인 에러 변환, POST 쿼리의 500/503 앱 레벨 재시도 1회 여부 결정(R11)
- 검증(FR-001, FR-005): 유효 토큰 → 견적서 + 품목 3건 / 초안·잘못된 토큰·비UUID → `null`(동일 처리) / 토큰 오류 시 `Upstream` 에러.

**Phase 1 종료 게이트**: 개발 서버에서 임시 페이지로 `getInvoiceByToken` 결과를 JSON 출력해 확인한 뒤 임시 페이지는 삭제한다.

---

## Phase 2. 웹 뷰어 (2주차)

### T2.1 UI 기반 준비 — S
- [ ] `npx shadcn@latest add table skeleton` 실행, 생성 파일의 `import { cn } from "cn"` → `@/lib/utils`로 수정(CLAUDE.md 주의사항)
- [ ] `config/site.ts`: 서비스명/설명/내비게이션을 견적서 서비스에 맞게 갱신(단일 출처)
- [ ] 홈(`/`)을 서비스 소개 + 사용 방법(Notion 템플릿 안내)으로 교체 — 목록 기능은 만들지 않는다

### T2.2 견적서 뷰 컴포넌트 — M
- [ ] `components/invoice/invoice-view.tsx`: 헤더(번호/상태 배지/날짜), 공급자·클라이언트 카드, 합계 블록, 비고
- [ ] `components/invoice/invoice-items-table.tsx`: 데스크톱 `<table>`(`<th scope>`), 모바일(<640px) 행 카드 전환
- [ ] `components/invoice/download-button.tsx`: `<a href=".../pdf" download>` + `buttonVariants()` (`asChild` 사용 금지, `button.tsx` export 확인 `[가정]`)
- 검증(FR-002, FR-010): 360/768/1280px에서 가로 스크롤 없음, 다크모드 색 대비 확인.

### T2.3 페이지 및 상태 화면 — M
- [ ] `app/invoice/[token]/page.tsx`: `getInvoiceByToken` → 없으면 `notFound()`, `generateMetadata`(제목에 견적번호, `robots: noindex, nofollow`)
- [ ] `loading.tsx`(스켈레톤), `not-found.tsx`, `error.tsx`(다시 시도 버튼, 스택/토큰 비노출)
- [ ] 품목 0건 빈 상태 문구
- 검증(FR-005, FR-006, FR-009, FR-013): 잘못된 토큰/초안 → 동일 404, 토큰 환경변수 제거 후 오류 화면, 응답 헤더/메타에 noindex.

### T2.4 인쇄 스타일 및 헤더 처리 — S (P1)
- [ ] 인쇄 시 헤더/푸터/다운로드 버튼 숨김(`print:hidden`)
- [ ] 견적서 페이지의 `Referrer-Policy: no-referrer`, 캐시 헤더 설정(`next.config`)
- 검증(FR-011): 인쇄 미리보기에서 3요소 미표시.

---

## Phase 3. PDF 문서 (2주차 후반 ~ 3주차 초)

### T3.1 PDF 문서 컴포넌트 — L
- [ ] `lib/pdf/invoice-document.tsx`: `@react-pdf/renderer` `Document/Page/View/Text`로 헤더, 당사자, 품목표, 합계, 비고 구성(A4)
- [ ] 폰트 등록 모듈 분리(`lib/pdf/fonts.ts`), 절대 경로는 `process.cwd()` 기준으로 생성
- [ ] 품목이 많을 때 페이지 분할(표 헤더 반복), 최대 50행 기준 검증
- [ ] 합계/세액은 **웹과 동일한 `calculateTotals()`** 사용(웹 로직 복사 금지)
- 검증(FR-004): 한글/특수문자 샘플, 긴 품목명 줄바꿈, 50행 분할이 깨지지 않음.

---

## Phase 4. PDF 라우트 및 마감 (3주차)

### T4.1 PDF Route Handler — M
- [ ] `app/invoice/[token]/pdf/route.ts`: `runtime = "nodejs"`, `maxDuration` 설정 `[가정]`
- [ ] 동일한 `getInvoiceByToken` 사용 → 없으면 404 응답, 있으면 `renderToBuffer` 후 응답
- [ ] 헤더: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename*=UTF-8''견적서-{번호}.pdf`(한글 파일명은 RFC 5987 인코딩), `X-Robots-Tag: noindex`
- 검증(FR-003): 브라우저 다운로드 파일명/타입, 잘못된 토큰 404.

### T4.2 웹/PDF 일치 검증 — S
- [ ] 샘플 3건에 대해 웹과 PDF의 총액·품목 수·날짜를 비교하는 체크 스크립트 또는 수동 체크리스트
- 검증(FR-008): 불일치 0건.

### T4.3 만료 배지 — S (P1)
- [ ] `ValidUntil < 오늘`이면 웹에 "만료" 배지(열람/다운로드는 허용), PDF에도 표시 여부 결정 `[가정]`
- 검증(FR-012).

### T4.4 성능/보안 점검 — M
- [ ] LCP/TTFB(PRD 2.2) 측정: 캐시 히트/미스
- [ ] PDF 응답 시간 p95 ≤ 5초(품목 20행) 측정
- [ ] 클라이언트 번들에 `NOTION_TOKEN`/Notion SDK가 포함되지 않았는지 확인(빌드 산출물 검색)
- [ ] 로그에 전체 토큰/본문 데이터가 남지 않는지 확인(토큰 해시 앞 8자만)
- [ ] 접근성: 키보드로 다운로드 버튼 접근, 품목표 시맨틱 확인

---

## Phase 5. 배포 및 검수 (3주차 말)

### T5.1 배포 — S
- [ ] Vercel 프로젝트 연결, 환경변수 4종 등록(Production/Preview), `NEXT_PUBLIC_SITE_URL` 설정
- [ ] 폰트 파일이 서버리스 번들에 포함되는지 확인(필요 시 `outputFileTracingIncludes` 설정) `[가정]`

### T5.2 실환경 검수 — M
- [ ] 실제 Notion 데이터로 PRD 2.3의 MVP 완료 기준 전부 확인
- [ ] 모바일 실기기(iOS Safari, Android Chrome)에서 열람/PDF 다운로드
- [ ] Notion 수정 → 60초 내 웹/PDF 반영 확인

### T5.3 문서화 — S
- [ ] `README.md`: 서비스 소개, Notion 템플릿 사용법(DB 스키마, Integration/공유 절차, data source ID 확인), 환경변수, 링크 발행/폐기 방법
- [ ] 알려진 제한(반영 지연 60초, 품목 50행 권장, 링크 유출 주의) 명시
- [ ] 필요 시 CLAUDE.md의 아키텍처 섹션에 `lib/notion`, `lib/pdf`, `app/invoice` 반영

---

## 일정 요약

| 주차 | 일 | 작업 | 공수 |
|------|----|------|------|
| 1주차 | 1 | T0.1, T0.2 | S+S |
| | 2 | T0.3, T0.4 | M+M |
| | 3 | T1.1, T1.2, T1.3 | S+S+M |
| | 4~5 | T1.4, Phase 1 게이트 | M |
| 2주차 | 1 | T2.1, T2.2(시작) | S+M |
| | 2 | T2.2(완료), T2.3 | M |
| | 3 | T2.3 마무리, T2.4 | S |
| | 4~5 | T3.1 | L |
| 3주차 | 1 | T3.1 마무리, T4.1 | M |
| | 2 | T4.2, T4.3, T4.4 | S+S+M |
| | 3 | T5.1, T5.2 | S+M |
| | 4 | T5.3, 버퍼, 최종 점검 | S |
| | 5 | 예비일(Phase 0 스파이크 결과에 따른 재작업) | — |

일정 압박 시 제외 순서: **T4.3 만료 배지 → T2.4 인쇄 스타일(FR-011) → FR-013 일부**. P0(FR-001~010)는 유지한다.

---

## 의존성 및 병렬화

| 작업 | 선행 | 병렬 가능 |
|------|------|-----------|
| T1.2 | — | T1.1, T0.3과 병렬 |
| T1.4 | T0.1, T0.3, T1.1, T1.3 | — |
| T2.* | T1.4 | T3.1과 병렬(2인 시) |
| T3.1 | T0.4, T1.2 | T2.*와 병렬 |
| T4.1 | T1.4, T3.1 | — |
| T5.* | 전체 | — |

---

## 위험 관리 체크포인트

| 시점 | 확인 사항 | 실패 시 조치 |
|------|-----------|--------------|
| Phase 0 종료 | 한글 PDF 샘플 합격, Notion 쿼리 성공 | PDF 방식 재평가(PRD 10장 B안), 일정 +2~3일 |
| Phase 1 종료 | 캐시/에러 변환 동작, 레이트리밋 시 UX | 캐시 TTL/재시도 정책 조정 |
| Phase 3 종료 | 50행 PDF 분할, 응답 시간 | 품목 상한 하향(30행) 및 폰트 서브셋 |
| Phase 5 | 서버리스에서 폰트 로드/타임아웃 | 폰트 경로/번들 설정 수정, `maxDuration` 조정 |

---

## 열린 질문 반영 시점

PRD 14장 질문은 아래 시점 전에 확정한다.

| 질문 | 확정 시점 |
|------|-----------|
| Q1 링크 방식, Q4 토큰 생성 | Phase 0 (T0.1 스키마 확정 전) |
| Q9 폰트 선택 | Phase 0 (T0.4) |
| Q3 공급자 정보 위치, Q6 부가세/통화 | Phase 1 시작 전 (타입/계산 확정) |
| Q5 테스트 전략 | Phase 1 시작 전 (`calculateTotals` 테스트 도입 여부) |
| Q7 반영 지연 허용 | Phase 1 (T1.4 캐시 TTL) |
| Q2 배포 플랫폼 | Phase 4 (T4.1 런타임 설정 전) |
| Q8 브랜딩 | Phase 2 (T2.1 `config/site.ts`) |
