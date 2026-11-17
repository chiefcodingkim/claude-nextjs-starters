# ROADMAP

> 기준 문서: `docs/PRD.md` (v0.1, 2026-11-14) / 최종 갱신: 2026-11-17
> 공수 표기: S(≤0.5일) / M(1~2일) / L(3일+) · 상태: `[ ]` 미착수, `[x]` 완료 · `[가정]`은 해당 Task 안에서 확정 후 PRD에 반영

## 1. 개요

- **목표**: Notion 데이터베이스의 견적서를 고유 링크(`/invoice/[token]`)로 웹에서 열람하고 PDF로 내려받는 읽기 전용 서비스. 웹과 PDF의 금액·품목은 100% 일치해야 한다.
- **MVP 범위**: FR-001~FR-013 (P0: FR-001~010, P1: FR-011~013). 대상 규모 개발자 1~2명, 3주.
- **범위 밖(부록 A)**: 견적서 작성/편집 UI, 계정/로그인/결제/전자서명, 이메일 발송·승인 워크플로, 다국어·다중 통화·세금 자동화, 자체 DB.
- **기술 스택**: Next.js 15.5 App Router, React 19.3, TypeScript(strict), Tailwind v4, shadcn/ui(Base UI `base-nova`, `asChild` 사용 금지), `@notionhq/client`(API `2025-09-03`, `dataSources.query`), `@react-pdf/renderer`(Node 런타임), `server-only`, (선택) `zod`. 경로 별칭 `@/*`는 프로젝트 루트, 들여쓰기 2칸.
- **비기능 요구(6장) 요약**: LCP ≤ 2.0s(캐시 히트) / TTFB ≤ 2.5s p95(미스) / PDF ≤ 5s p95(20행) · 품목 상한 50행 · 토큰 128비트 · 404 동일 응답 · noindex/no-referrer · WCAG 2.1 AA · 최신 Chrome/Edge/Firefox, iOS Safari 16+ · 60초 캐시.

## 2. 현재 상태

| 구분 | 항목 |
|------|------|
| 구현 완료 | 스타터킷 골격: `app/layout.tsx`(ThemeProvider/Header/Footer), `components/ui/{badge,button,card,separator}`(`buttonVariants` export 확인됨), 다크모드 토글, `lib/utils.ts`(`cn`), `.env.example`(PRD 9.3의 4개 변수 작성됨), `.gitignore`의 `.env*`(`!.env.example`) 처리 |
| 부분 구현 | `config/site.ts`(서비스명 "견적서 뷰어"·설명 갱신됨, 내비는 홈 1개), `app/page.tsx`(3단계 사용 안내 소개 페이지 있음, Notion 템플릿 상세 안내·브랜딩은 미확정) |
| 빈 골격(`.gitkeep`만 존재) | `app/invoice/[token]`, `components/invoice`, `lib/notion`, `lib/invoice`, `lib/pdf` |
| 미착수 | 신규 의존성(`@notionhq/client`, `@react-pdf/renderer`, `server-only`), shadcn `table`/`skeleton`, Notion 워크스페이스, 폰트, 테스트 프레임워크, 배포 |

기존 로드맵(`b50d13b`)은 전 항목 미착수였으므로 보존할 체크 상태는 없다. 이번 갱신에서 위 현황 반영, Phase 재편(번들/배포 스파이크 앞당김), 추적 매트릭스·리스크·미결 사항을 추가했다.

## 3. 전체 일정 요약

| Phase | 목표 | 주요 산출물 | 예상 공수 | 의존 |
|-------|------|-------------|-----------|------|
| 0. 스파이크/준비 | Notion API, 한글 PDF, 서버리스 번들 3대 불확실성 선검증 | Notion 샘플 DB, 검증 결과 PRD 반영, 스파이크 PDF 프리뷰 배포 | 3~4일 | — |
| 1. 데이터 레이어 | 토큰으로 `Invoice` 반환 + 금액 계산 | `lib/notion/*`, `lib/invoice/*`, 단위 테스트 | 4~5일 | 0 |
| 2. 웹 뷰어 | 링크로 견적서 열람 + 상태 화면 | `app/invoice/[token]/*`, `components/invoice/*` | 4~5일 | 1 |
| 3. PDF | 한글 PDF 다운로드 | `lib/pdf/*`, `pdf/route.ts` | 4~5일 | 1, 0-4/0-5 (2와 병렬 가능) |
| 4. 품질/보안/성능 | 일치·성능·보안·접근성 검증, P1 마감 | 검증 체크리스트, 만료 배지 | 2~3일 | 2, 3 |
| 5. 배포/문서 | 프로덕션 배포, 실기기 검수, README | Vercel 배포, `README.md` | 2~3일 | 4 |

**크리티컬 패스**: 0-1 → 0-3 → 1-4 → 1-5 → 3-3 → 3-4 → 4-1 → 5-1 → 5-2. Phase 2와 Phase 3의 3-1·3-2는 Phase 1 완료 후 병렬 진행 가능(Phase 3의 `route.ts`는 1-5 필요).

일정 압박 시 제외 순서: 4-3(만료 배지, FR-012) → 2-5(인쇄, FR-011) → FR-013 중 메타 태그. P0(FR-001~010)는 유지.

## 4. Phase별 상세

### Phase 0: 스파이크 및 준비 (3~4일)

- **목표**: 위험 항목(Notion 필터/`filter_properties`, 한글 PDF 폰트, 서버리스 번들 크기)을 본 개발 전에 검증한다(R2, R3, R4).
- **완료 기준(DoD)**: 실제 Notion DB에서 data source 쿼리 성공 / 한글·특수문자 PDF 샘플에 □ 0건, 로컬 ≤ 5초 / Vercel 프리뷰에서 폰트 포함 PDF 생성 성공 / PRD 9.4 "구현 시 검증할 항목" 결과를 PRD에 `[확인]`으로 반영 / `npm run lint`, `npm run build` 통과.
- **Task 목록**
  - [ ] `0-1` Notion 워크스페이스 준비 — Read content 권한 internal Integration 생성, Invoices/InvoiceItems DB를 PRD 7.1 스키마대로 생성(Relation 양방향), 두 DB에 Integration 연결, 샘플 데이터(견적서 3건: 발행/초안/만료, 품목 3·0·30건), `GET /v1/databases/{id}`로 data source ID 확인 후 `.env.local` 작성. 산출물: `.env.local`(커밋 금지). 요구사항: FR-001, 6.2. 공수 S. 선행 없음.
    - 검증 방법: curl/스크립트로 data source 쿼리 200 응답, 품목 DB 접근 시 `object_not_found` 없음.
  - [ ] `0-2` 의존성 설치 — `npm i @notionhq/client @react-pdf/renderer server-only`, 설치 버전과 기본 API 버전(`2025-09-03`) 확인(R4). 산출물: `package.json`. 공수 S. 선행 없음.
    - 검증 방법: `npm run lint`, `npm run build` 통과.
  - [ ] `0-3` Notion API 미확인 항목 검증 — `select.equals`/`relation.contains` 연산자명, `filter_properties`의 이름/ID 허용 여부와 필터 속성 포함 필요 여부, `page_size` 최대값, 전체 페이지 타입 가드 헬퍼명, `databases.retrieve`의 `data_sources` 반환 여부, 레이트리밋 에러 코드(`APIErrorCode.RateLimited`) 확인. 산출물: 검증 스크립트(임시, 스크래치 용도), PRD 9.4 `[확인]` 갱신. 요구사항: FR-001, 6.6, R4·R10·R11. 공수 M. 선행 `0-1`, `0-2`.
    - 검증 방법: 항목별 결과가 PRD에 기록되고 이후 Task가 그 결과(속성 ID 사용 여부 등)를 참조한다. 필요 시 Context7로 SDK 문서 재확인.
  - [ ] `0-4` 한글 PDF 폰트 스파이크 — Noto Sans KR 또는 Pretendard TTF(Regular/Bold) 선정(Q9), OFL 라이선스 확인·고지 파일 추가, `lib/pdf/fonts/` 배치, 임시 Route Handler에서 `Font.register`(절대 경로, `process.cwd()` 기준)+`renderToBuffer`로 한글/영문/숫자/특수문자(㈜, ₩, 중점) 샘플 생성, TTF 동작·폰트 용량·서브셋 필요 여부·응답 시간 측정. 산출물: `lib/pdf/fonts/*.ttf`, 임시 `app/spike/pdf/route.ts`(Phase 0 종료 시 삭제). 요구사항: FR-004, 6.5, R2. 공수 M. 선행 `0-2`.
    - 검증 방법: 샘플 PDF에서 □ 0건(육안 체크리스트), 로컬 응답 ≤ 5초. 실패 시 PRD 10장 B안 재검토 후 Phase 3 범위 조정.
  - [ ] `0-5` 서버리스 번들/배포 스파이크 — `0-4`의 임시 라우트를 Vercel 프리뷰에 배포하여 폰트 파일 포함 여부(`outputFileTracingIncludes` 필요 여부), 함수 크기, 콜드스타트 응답 시간, `maxDuration` 필요 여부 확인. Q2(배포 플랫폼) 확정. 산출물: `next.config.ts` 설정(필요 시), 측정 결과를 PRD R3에 기록. 요구사항: R3, 6.1, Q2. 공수 S. 선행 `0-4`.
    - 검증 방법: 프리뷰 URL에서 샘플 PDF 다운로드 성공, 함수 크기가 플랫폼 한도 이내.
  - [x] `0-6` 미결 사항 1차 확정(2026-11-17 완료: Q1~Q9 확정, PRD 7.1·7.2·9.3·14장 반영) — Q1(링크 방식), Q3(공급자 정보 위치), Q4(토큰 생성), Q5(테스트 전략), Q6(부가세/통화), Q7(60초 지연) 결정을 사용자에게 확인하고 PRD 반영. 산출물: PRD 갱신. 공수 S. 선행 없음(`0-1` 스키마 확정 전 수행).
    - 검증 방법: 7장 미결 사항 표의 "Phase 0 확정" 항목이 모두 "확정"으로 변경된다.
- **리스크**: 한글 폰트 용량이 크거나 TTF가 동작하지 않을 수 있음(→ 서브셋/대체 폰트). 서버리스 번들 한도 초과 시 폰트 서브셋 또는 B안 재평가(일정 +2~3일, 예비일 사용).

### Phase 1: 데이터 레이어 (4~5일)

- **목표**: 유효한 토큰으로 `Invoice`를 반환하고, 잘못된/미발행 토큰은 구분 없이 `null`을 반환하며, 금액 계산을 웹/PDF가 공용으로 사용한다.
- **완료 기준(DoD)**: 샘플 토큰 → `Invoice`(품목 정렬·전체 페이지네이션) / 비UUID·미발행·불일치 → 동일한 `null` / 429·5xx → `Upstream` 도메인 에러(본문 비노출) / 단위 테스트 통과 / lint·typecheck·build 통과 / 임시 JSON 출력 페이지로 확인 후 삭제.
- **Task 목록**
  - [ ] `1-1` 도메인 타입·스키마 상수 — `lib/notion/types.ts`(PRD 7.2 기준, 단 Q3 확정에 따라 `supplier`는 행 값이 없으면 `config`/환경변수 기본값으로 채워 항상 존재하도록 매핑), `lib/notion/schema.ts`(속성명 또는 `0-3`에서 결정한 속성 ID 상수). 요구사항: FR-001, R4·R7. 공수 S. 선행 `0-3`, `0-6`.
    - 검증 방법: `npx tsc --noEmit` 통과, 속성명이 Notion DB와 일치.
  - [ ] `1-2` 금액 계산·포맷 — `lib/invoice/calculate.ts`의 `calculateTotals()`(품목금액=수량×단가, 부가세=`Math.floor(공급가액×taxRate/100)`, 총액), `lib/invoice/format.ts`(원화 `220,000원`, 날짜, 만료 판정 헬퍼). 요구사항: FR-007, FR-008, FR-012(판정부). 공수 S. 선행 `0-6`(Q6).
    - 검증 방법: PRD 예시(수량2×100,000, 10% → 200,000/20,000/220,000) 및 경계 케이스(수량 0, 세율 0, 큰 금액, 소수 단가 방어)로 단위 테스트.
  - [ ] `1-3` 테스트 환경 도입 `[가정: Q5, Vitest]` — Vitest 설치, `npm run test` 스크립트, `calculate`/`mapper`/UUID 검증 테스트. 산출물: `vitest.config.ts`, `lib/**/*.test.ts`, `package.json`. 요구사항: R8, FR-007. 공수 S. 선행 `0-6`.
    - 검증 방법: `npm run test` 통과, `@/*` 별칭 해석 정상. Q5에서 미도입 결정 시 `1-2`는 수동 케이스 5개 스크립트로 대체.
  - [ ] `1-4` 매퍼·도메인 에러 — `lib/notion/mapper.ts`(title/rich_text/number/select/date/relation 추출, 필수값 누락·타입 불일치 시 throw, 전체 페이지 타입 가드, 필요 시 `zod`), `lib/notion/errors.ts`(`NotFoundError`, `UpstreamError`; Notion 오류 본문 비노출). 요구사항: FR-001, FR-006, R7. 공수 M. 선행 `1-1`.
    - 검증 방법: 샘플 3건 매핑 성공, 필수값을 비운 건은 에러로 분리, 서버 로그에 사유 기록·사용자 메시지는 일반화.
  - [ ] `1-5` 조회 함수·캐시·에러 변환 — `lib/notion/client.ts`(`import "server-only"`, `Client` 싱글턴, `retry.maxRetries`), `lib/notion/invoices.ts`의 `getInvoiceByToken(token)`: (0) UUID 형식 검증 실패 시 Notion 호출 없이 `null` (1) 견적서 data source를 `ShareToken`+`Status=발행`, `page_size: 1`, `Items` 제외로 쿼리 (2) 품목 data source를 `Invoice` relation 필터+`Order` 오름차순+`collectPaginatedAPI`로 조회(견적서의 `Items` 값 미사용, R10) (3) 매핑. `unstable_cache`(60초, 태그 `invoice:{token}`)로 래핑, `null` 결과 캐시 정책 결정 `[가정]`, `RateLimited` 시 stale 우선 제공 검토, POST 500/503 앱 레벨 재시도 1회 여부 결정(R11), 로그는 토큰 해시 앞 8자+시각+결과코드만. 요구사항: FR-001, FR-005, FR-006, 6.2, 6.6, 11장, R1·R10·R11. 공수 M~L. 선행 `0-3`, `1-1`, `1-4`.
    - 검증 방법: 유효 토큰 → 견적서+품목 3건 / 초안·잘못된 토큰·비UUID → 동일 `null` / 잘못된 `NOTION_TOKEN`·네트워크 차단 → `UpstreamError` / 60초 내 재호출 시 Notion 호출 0회(캐시 히트 로그) / 품목 30건(및 25개 초과) 전부 반환.
- **리스크**: Next 15에서 `unstable_cache`와 태그 동작(PRD 9.4-5 `[가정]`) 불일치 가능, 속성 ID/이름 상충으로 인한 쿼리 실패. 완화: `0-3` 결과 반영, 캐시 동작은 `1-5`에서 실측.

### Phase 2: 웹 뷰어 (4~5일)

- **목표**: 클라이언트가 링크 하나로 반응형·다크모드 견적서를 열람하고, 오류/로딩/빈 상태가 PRD대로 표시된다.
- **완료 기준(DoD)**: 샘플 3건(발행/초안/만료)의 기대 화면 확인 / 360~1280px 가로 스크롤 없음 / 404가 미발행·불일치·삭제에서 동일 / Notion 오류 시 error 화면(스택·토큰 비노출) / noindex 헤더·메타 / lint·typecheck·build 통과 / 임시 JSON 페이지 삭제.
- **Task 목록**
  - [ ] `2-1` UI 기반 준비 — `npx shadcn@latest add table skeleton`(생성 파일의 `import { cn } from "cn"`을 `@/lib/utils`로 수정, CLAUDE.md 주의사항), `config/site.ts` 내비게이션/브랜딩 갱신(Q8, 단일 출처 유지), 홈 `app/page.tsx`에 Notion 템플릿 사용 안내 보강(목록 기능은 만들지 않음). 산출물: `components/ui/table.tsx`, `components/ui/skeleton.tsx`, `config/site.ts`, `app/page.tsx`. 요구사항: 8.1, 8.4. 공수 S. 선행 `0-6`(Q8은 임시 값으로 진행 가능).
    - 검증 방법: `npm run build` 통과, `cn` import 경로 확인.
  - [ ] `2-2` 견적서 뷰 컴포넌트 — `components/invoice/invoice-view.tsx`(번호·상태 배지·발행일/유효기간, 공급자/클라이언트 카드, 합계 블록, 비고), `invoice-items-table.tsx`(데스크톱 `<table>`+`<th scope>`, <640px 행 카드 전환, 품목 0건 시 "등록된 품목이 없습니다."), `download-button.tsx`(`<a href="…/pdf" download>`+`buttonVariants()`, `asChild` 금지). 계산·포맷은 `lib/invoice` 사용. 요구사항: FR-002, FR-006(빈 상태), FR-007, FR-010, 6.3. 공수 M. 선행 `1-2`, `2-1`.
    - 검증 방법: 360/768/1280px 가로 스크롤 없음, 다크모드 색 대비(WCAG AA), 키보드 Tab으로 다운로드 버튼 접근, 품목 50행 렌더링.
  - [ ] `2-3` 견적서 페이지 — `app/invoice/[token]/page.tsx`(Server Component: `getInvoiceByToken` → 없으면 `notFound()` → `InvoiceView`), `generateMetadata`(제목에 견적번호, `robots: { index: false, follow: false }`). 요구사항: FR-001, FR-002, FR-005, FR-013. 공수 M. 선행 `1-5`, `2-2`.
    - 검증 방법: 유효 토큰으로 FR-002 필드 전부 표시, 응답/메타에 `noindex, nofollow`.
  - [ ] `2-4` 상태 화면 — `loading.tsx`(스켈레톤), `not-found.tsx`("견적서를 찾을 수 없습니다. 링크를 다시 확인해 주세요."), `error.tsx`(Client Component, "다시 시도" 버튼, 스택/토큰 비노출). `UpstreamError`는 error 경계로, `null`은 404로 분기. 요구사항: FR-005, FR-006, FR-009. 공수 S. 선행 `2-3`.
    - 검증 방법: 초안/잘못된 토큰/삭제 → 동일 404, `NOTION_TOKEN` 제거 후 error 화면, 인위 지연 시 스켈레톤 후 본문 교체(FR-009).
  - [ ] `2-5` 인쇄 스타일·보안 헤더 (P1) — 인쇄 시 헤더/푸터/다운로드 버튼 숨김(`print:hidden`, `components/layout/*` 수정 포함), `next.config.ts`의 `/invoice/:path*` 헤더(`X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer`, `Cache-Control: private` `[가정]`). 요구사항: FR-011, FR-013, 6.2. 공수 S. 선행 `2-3`.
    - 검증 방법: 인쇄 미리보기에서 3요소 미표시, `curl -I`로 헤더 확인.
- **리스크**: 모바일 카드 전환 시 접근성(표 시맨틱) 저하 → 데스크톱 table + 모바일 별도 마크업을 `sr-only`/`hidden` 클래스로 분기하되 중복 읽기 확인. 헤더/푸터 인쇄 숨김이 전역 레이아웃을 건드림.

### Phase 3: PDF (4~5일, Phase 2와 병렬 가능)

- **목표**: 한글이 깨지지 않는 PDF를 링크 한 번으로 다운로드하고, 웹과 금액·품목이 일치한다.
- **완료 기준(DoD)**: FR-003 헤더 충족 / 한글·특수문자 □ 0건 / 품목 20행 ≤ 5초(p95), 50행 분할 정상 / 웹과 총액·품목 수·날짜 불일치 0건 / 잘못된 토큰은 404 / lint·typecheck·build 통과 / Phase 0 임시 스파이크 라우트 삭제.
- **Task 목록**
  - [ ] `3-1` 폰트 등록 모듈 — `lib/pdf/fonts.ts`(`Font.register`, `process.cwd()` 기준 절대 경로, 중복 등록 방지), `0-4` 결과의 폰트/서브셋 확정본 사용, OFL 고지. 요구사항: FR-004, 6.5, R2. 공수 S. 선행 `0-4`, `0-5`.
    - 검증 방법: 로컬·Vercel 프리뷰 모두에서 폰트 로드 성공.
  - [ ] `3-2` PDF 문서 컴포넌트 — `lib/pdf/invoice-document.tsx`(A4, 헤더/당사자/품목표/합계/비고, 긴 품목명 줄바꿈, 페이지 분할 시 표 헤더 반복, 만료 표시 여부 `[가정]`). 합계는 웹과 동일한 `calculateTotals()`, 포맷은 `lib/invoice/format.ts` 재사용(로직 복사 금지). 요구사항: FR-004, FR-007, FR-008, R5. 공수 L. 선행 `1-2`, `3-1`.
    - 검증 방법: 한글/특수문자(㈜, ₩) 샘플, 긴 품목명, 0건·20행·50행 케이스 육안 확인.
  - [ ] `3-3` PDF Route Handler — `app/invoice/[token]/pdf/route.ts`(`runtime = "nodejs"`, `maxDuration` `[가정]`, `getInvoiceByToken` 공용 → `null`이면 404, `UpstreamError`면 503, 성공 시 `renderToBuffer`). 헤더: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="견적서-{번호}.pdf"`(비ASCII 대응으로 `filename*=UTF-8''` 병기, RFC 5987), `X-Robots-Tag: noindex`, `Cache-Control: private`. 요구사항: FR-003, FR-005, FR-006, 6.2. 공수 M. 선행 `1-5`, `3-2`.
    - 검증 방법: 브라우저 다운로드 시 파일명/타입 확인, 잘못된 토큰 404, 오류 응답에 스택 미노출.
  - [ ] `3-4` 다운로드 연결 — `download-button.tsx`를 `/invoice/[token]/pdf`에 연결, 스파이크 라우트 삭제. 요구사항: FR-003. 공수 S. 선행 `2-2`, `3-3`.
    - 검증 방법: 웹에서 버튼 클릭 → PDF 저장, 모바일 뷰포트에서도 동작.
- **리스크**: react-pdf 렌더링 시간·메모리(512MB `[가정]`) 한도, 웹/PDF 레이아웃 이원화(R5). 완화: 품목 상한 50행, 공용 계산 함수, 4-1 대조 검증.

### Phase 4: 품질·보안·성능 및 P1 마감 (2~3일)

- **목표**: 비기능 요구사항과 성공 지표를 실측으로 확인하고 P1 기능을 마감한다.
- **완료 기준(DoD)**: 2.2 지표 충족(또는 사유 기록) / 클라이언트 번들에 `NOTION_TOKEN`·Notion SDK 미포함 / 로그에 전체 토큰·본문 미기록 / FR-008 불일치 0건 / lint·typecheck·test·build 통과.
- **Task 목록**
  - [ ] `4-1` 웹/PDF 일치 검증 — 샘플 3건(0건·30건 포함)의 총액·품목 수·날짜를 대조하는 테스트 또는 체크리스트. 산출물: `lib/invoice/*.test.ts` 또는 `docs/` 체크리스트(작성 시). 요구사항: FR-008, R5. 공수 S. 선행 `3-4`.
    - 검증 방법: 불일치 0건.
  - [ ] `4-2` 성능 측정 — Lighthouse(모바일 4G) LCP 캐시 히트 ≤ 2.0s, 캐시 미스 TTFB p95 ≤ 2.5s, PDF 20행 p95 ≤ 5s. 초과 시 캐시/폰트 서브셋 조정. 요구사항: 2.2, 6.1, R1·R3. 공수 M. 선행 `2-4`, `3-4`.
    - 검증 방법: 측정값을 PRD 또는 PR 설명에 기록.
  - [ ] `4-3` 만료 배지 (P1) — `ValidUntil < 오늘`이면 웹 헤더에 "만료" 배지(열람/다운로드 허용), 시간대(KST) 기준 판정. `components/invoice/invoice-view.tsx`, `lib/invoice/format.ts`. 요구사항: FR-012. 공수 S. 선행 `2-2`.
    - 검증 방법: 만료 샘플에서 배지 표시, 유효 샘플에서는 미표시, 경계(당일) 단위 테스트.
  - [ ] `4-4` 보안·접근성 점검 — 빌드 산출물(`.next/static`)에서 `NOTION_TOKEN`·`@notionhq` 검색, `NEXT_PUBLIC_` 접두사 오남용 점검, 로그 포맷 확인, `npm audit`, 품목표 시맨틱·키보드 접근·색 대비 확인, 브라우저 매트릭스(Chrome/Edge/Firefox/iOS Safari 16+) 점검. 요구사항: 6.2, 6.3, 6.4, 11장. 공수 M. 선행 `2-5`, `3-4`.
    - 검증 방법: 체크리스트 전 항목 통과, 발견 이슈는 Task로 등록.
- **리스크**: 성능 지표 미달 시 재작업(예비일 사용).

### Phase 5: 배포 및 문서 (2~3일)

- **목표**: 프로덕션에서 MVP 완료 기준(PRD 2.3)을 모두 충족한다.
- **완료 기준(DoD)**: PRD 2.3 체크리스트 전부 통과 / README로 신규 공급자가 Notion 설정부터 링크 발행까지 수행 가능.
- **Task 목록**
  - [ ] `5-1` 프로덕션 배포 — Vercel 프로젝트 연결, 환경변수 4종 등록(Production/Preview, `NEXT_PUBLIC_SITE_URL` 실제 도메인), `maxDuration`/`outputFileTracingIncludes` 최종 확인. 요구사항: PRD 2.3, R3, Q2. 공수 S. 선행 `4-2`, `4-4`.
    - 검증 방법: 프로덕션 URL에서 샘플 견적서 열람·PDF 성공.
  - [ ] `5-2` 실환경 검수 — 실제 Notion 데이터로 완료 기준 전부 확인, iOS Safari·Android Chrome 실기기 열람/PDF, 404/미발행/Notion 장애(토큰 무효화) 화면, Notion 수정 후 60초 내 반영 확인. 요구사항: FR-001~010 종합, Q7. 공수 M. 선행 `5-1`.
    - 검증 방법: PRD 2.3 체크박스 5개를 모두 체크.
  - [ ] `5-3` 문서화 — `README.md`(서비스 소개, Notion DB 스키마·Integration 공유·data source ID 확인 절차, 환경변수, 링크 발행/폐기, 알려진 제한: 반영 지연 60초·품목 50행·링크 유출 주의), `CLAUDE.md` 아키텍처 섹션에 `lib/notion`·`lib/pdf`·`app/invoice` 구현 반영, PRD 열린 질문 결정 기록. 요구사항: 4.1, 6.6, R6·R7, 11장. 공수 S. 선행 `5-2`(초안은 병행 가능).
    - 검증 방법: 문서만 보고 제3자가 샘플 견적서를 발행해 본다.
- **리스크**: 프로덕션과 프리뷰의 환경변수 불일치, Notion 권한/공유 누락.

## 5. 요구사항 추적 매트릭스

| 요구사항 ID | 설명 | 담당 Phase/Task |
|-------------|------|-----------------|
| FR-001 (P0) | Notion 견적서·품목 조회 | 0-1, 0-3, 1-1, 1-4, 1-5, 2-3 |
| FR-002 (P0) | 웹 뷰어 | 2-2, 2-3 |
| FR-003 (P0) | PDF 다운로드 | 3-3, 3-4, 2-2 |
| FR-004 (P0) | 한글 PDF 렌더링 | 0-4, 3-1, 3-2 |
| FR-005 (P0) | 접근 제어(토큰+발행 상태, 동일 404) | 1-5, 2-3, 2-4, 3-3 |
| FR-006 (P0) | 오류/빈 상태 | 1-4, 1-5, 2-2(빈 상태), 2-4, 3-3 |
| FR-007 (P0) | 금액 계산 | 1-2, 1-3, 2-2, 3-2 |
| FR-008 (P0) | 웹/PDF 일치 | 1-2, 3-2, 4-1 |
| FR-009 (P0) | 로딩 스켈레톤 | 2-1, 2-4 |
| FR-010 (P0) | 반응형 + 다크모드 | 2-2, 4-4 |
| FR-011 (P1) | 인쇄 스타일 | 2-5 |
| FR-012 (P1) | 만료 배지 | 1-2(판정 헬퍼), 4-3 |
| FR-013 (P1) | noindex | 2-3, 2-5, 3-3 |
| 6.1 성능 | LCP/TTFB/PDF 시간, 50행 상한 | 0-5, 4-2 |
| 6.2 보안 | 토큰 서버 전용, 128비트, 헤더 | 0-1, 1-5, 2-5, 3-3, 4-4 |
| 6.3 접근성 | WCAG AA, 표 시맨틱 | 2-2, 4-4 |
| 6.4 브라우저 | 지원 매트릭스 | 4-4, 5-2 |
| 6.5 PDF 품질 | TTF, OFL, 서브셋 | 0-4, 3-1 |
| 6.6 캐싱 | 60초 캐시, 레이트리밋, 재시도, UUID 검증 | 0-3, 1-5, 5-2 |
| 7.3 금액 규칙 | 앱 계산, 원 미만 절사 | 1-2 |
| 11장 보안·개인정보 | 로그 최소화, 토큰 폐기, 의존성 | 1-5, 4-4, 5-3 |
| 2.3 MVP DoD | 완료 기준 5항목 | 5-1, 5-2 |

## 6. 리스크 관리

| 리스크 | 영향도 | 가능성 | 완화책(Task) |
|--------|--------|--------|--------------|
| R1 Notion 레이트리밋/지연 | 높음 | 중 | 60초 캐시, 조회 2회 제한, stale 우선 제공(1-5) |
| R2 PDF 한글 폰트 깨짐/형식 미지원 | 높음 | 중 | Phase 0 스파이크, TTF 사용(0-4, 3-1) |
| R3 서버리스 번들 크기/타임아웃 | 높음 | 중 | 프리뷰 배포 스파이크, 서브셋, `maxDuration`, 50행 상한(0-5, 5-1) |
| R4 Notion SDK/API 변경, 속성명/ID 변경 | 중 | 중 | 설치 시 Context7 재확인, `lib/notion` 격리, `schema.ts` 상수화(0-3, 1-1) |
| R5 웹/PDF 레이아웃 이원화로 불일치 | 중 | 중 | 공용 계산·포맷, 수락 테스트(3-2, 4-1) |
| R6 링크 유출 | 높음 | 낮음 | 128비트 토큰, 상태 전환 즉시 차단, noindex, 공급자 안내(2-5, 5-3) |
| R7 공급자의 Notion 스키마 임의 변경 | 중 | 중 | 매퍼 검증+서버 로그, 템플릿 안내(1-4, 5-3) |
| R8 테스트 프레임워크 부재 | 중 | 중 | Vitest 도입(1-3) |
| R9 범위 확대 | 중 | 중 | 부록 A 비목표 고수, Post-MVP로 분리 |
| R10 품목 relation 25개 한도 | 높음 | 낮음(회피 설계) | 품목 DB를 `Invoice` 필터로 조회, 25개 초과 샘플 검증(1-5) |
| R11 POST 쿼리 500/503 미재시도 | 중 | 낮음 | 앱 레벨 재시도 1회 검토, stale 캐시(1-5) |

## 7. 미결 사항 / 가정

PRD 14장 열린 질문과 `[가정]` 항목. Q1~Q9는 2026-11-17 권장안대로 확정되었다(상태 열 참조). A 항목은 "확정 시점"에 확인한다.

| # | 항목 | 결정 | 상태 | 영향 Task |
|---|------|------|------|-----------|
| Q1 | 링크 방식 | 별도 `ShareToken`(UUID v4) | 확정 | 0-1, 1-5 |
| Q2 | 배포 플랫폼 | Vercel (0-5 프리뷰 배포로 실측 검증) | 확정 | 0-5, 5-1 |
| Q3 | 공급자 정보 위치 | `config`/환경변수 고정값을 기본으로 하고, 견적서 행의 Supplier* 속성은 선택 입력(있으면 우선). PRD 7.1의 `SupplierName` 필수 → 선택으로 변경 | 확정 | 1-1, 1-4 |
| Q4 | 토큰 생성 | Notion 수동 입력 + README 가이드 제공 | 확정 | 0-1, 5-3 |
| Q5 | 테스트 전략 | Vitest(`calculateTotals`, `mapper`, UUID 검증) + Playwright MCP 수동 E2E | 확정 | 1-3 |
| Q6 | 부가세/통화 | 기본 10%, 원 미만 절사, KRW 단일 통화 (세무 기준은 운영 전 재확인) | 확정 | 1-2 |
| Q7 | 반영 지연 | 최대 60초 허용(웹훅/재검증 API는 Post-MVP) | 확정 | 1-5, 5-2 |
| Q8 | 브랜딩(서비스명/로고/PDF 푸터) | 임시값("견적서 뷰어")으로 진행, 추후 `config/site.ts`에서 교체 | 임시 확정 | 2-1, 3-2 |
| Q9 | 폰트 | Noto Sans KR TTF 정적 Regular/Bold. 0-4 스파이크에서 문제 시 Pretendard로 교체 | 확정 | 0-4, 3-1 |
| A1 | 품목 상한 50행, PDF 메모리 ≤ 512MB | 가정 | Phase 4 (4-2) | 3-2, 4-2 |
| A2 | `Cache-Control: private` 또는 서버 캐시만 사용 | 가정 | Phase 2 (2-5) | 2-5, 3-3 |
| A3 | `unstable_cache`의 Next 15 동작, `null` 결과 캐시 여부 | 가정 | Phase 1 (1-5) | 1-5 |
| A4 | 접근 로그: 토큰 해시 앞 8자+시각+결과코드만 | 가정 | Phase 1 (1-5) | 1-5, 4-4 |
| A5 | 열람→다운로드 전환율 ≥ 40% | MVP 범위에서는 측정 안 함(분석 도구 미도입) | MVP 이후 | — |
| A6 | 만료 견적서의 PDF에도 만료 표시 여부 | 미정 | Phase 3 (3-2) | 3-2, 4-3 |
| A7 | 한글 파일명 처리 | `filename`+`filename*` 병기 | Phase 3 (3-3) | 3-3 |

PRD 자체의 모호함/주의점:
- ~~성공 지표 6.1이 "8장의 지표"를 참조하나 8장은 화면 설계다.~~ 해결(2026-11-17): PRD 6.1을 "2.2장의 지표"로 수정했다.
- FR-003 수락 기준의 `filename="견적서-{번호}.pdf"`는 비ASCII를 포함하므로 RFC 5987 `filename*` 인코딩 병기가 필요하다(A7).
- ~~12장 마일스톤은 한글 폰트 검증을 3주차에 두었으나 R2는 1주차 스파이크를 요구하여 모순이다.~~ 해결(2026-11-17): PRD 12장에 1주차 스파이크(1-S)를 추가하고 작업 9를 본 구현으로 한정했다. 본 로드맵은 R2에 따라 Phase 0에 배치했다.
- FR-006의 "재시도 안내" 화면과 R11의 앱 레벨 재시도(최대 1회)는 별개이며, 후자는 도입 여부만 미정이다.

## 8. 변경 이력

| 일자 | 내용 |
|------|------|
| 2026-11-17 | Task 0-6 완료 처리. PRD 12장의 폰트 검증 시점 모순을 PRD 수정(1주차 스파이크 1-S 추가)으로 해소. |
| 2026-11-17 | Q1~Q9 권장안대로 확정(7장 갱신). Q3은 공급자 정보를 `config`/환경변수 기본값 + 행별 선택 입력으로 결정하여 스키마·타입 영향 반영, Q8은 임시 확정. A6(만료 PDF 표시)·A4(접근 로그)는 미확정 유지. |
| 2026-11-17 | 템플릿 형식으로 전면 재작성. 현재 코드 상태 반영(`.env.example`, 홈, `config/site.ts` 기구현 확인), 번들/배포 스파이크(0-5)와 테스트 환경(1-3) 추가, 추적 매트릭스·리스크·미결 사항 정리. 기존 체크 상태는 전부 미착수였으므로 변경 없음. |
| 2026-11-14 | 최초 작성(`b50d13b`). |
